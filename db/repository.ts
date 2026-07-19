import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db, sqlite } from "./client";
import { accounts, budgets, categories, preferences, transactions, type Transaction } from "./schema";
import { formatMoney, monthBounds, monthKey, toMinorUnits } from "@/lib/finance";

export const id = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
export { formatMoney, monthBounds, monthKey, toMinorUnits };

export async function listAccounts() { return db.select().from(accounts).where(eq(accounts.archived, false)).orderBy(asc(accounts.createdAt)); }
export async function accountBalances() {
  const rows = await listAccounts();
  return Promise.all(rows.map(async (account) => {
    const totals = await db.select({ kind: transactions.kind, total: sql<number>`coalesce(sum(${transactions.amount}), 0)` }).from(transactions).where(and(eq(transactions.accountId, account.id), eq(transactions.currency, account.currency))).groupBy(transactions.kind);
    const income = totals.find((x) => x.kind === "income")?.total ?? 0; const expense = totals.find((x) => x.kind === "expense")?.total ?? 0;
    return { ...account, balance: account.openingBalance + income - expense };
  }));
}
export async function listCategories(kind?: "income" | "expense") { return db.select().from(categories).where(kind ? and(eq(categories.archived, false), eq(categories.kind, kind)) : eq(categories.archived, false)).orderBy(desc(categories.system), asc(categories.name)); }
export async function createAccount(input: { name: string; type: "cash" | "bank" | "card" | "wallet"; currency: string; openingBalance: number }) {
  await db.insert(accounts).values({ id: id("acc"), ...input, createdAt: new Date() });
}
export async function archiveAccount(accountId: string) { await db.update(accounts).set({ archived: true }).where(eq(accounts.id, accountId)); }

export type TransactionInput = { kind: "income" | "expense"; accountId: string; categoryId: string; amount: number; currency: string; occurredAt: Date; notes?: string; expenseType?: "variable" | "fixed" };
export async function saveTransaction(input: TransactionInput, transactionId?: string) {
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new Error("Amount must be a positive integer in minor units.");
  const now = new Date();
  if (transactionId) await db.update(transactions).set({ ...input, notes: input.notes || null, expenseType: input.kind === "expense" ? input.expenseType ?? "variable" : null, updatedAt: now }).where(eq(transactions.id, transactionId));
  else await db.insert(transactions).values({ id: id("txn"), ...input, notes: input.notes || null, expenseType: input.kind === "expense" ? input.expenseType ?? "variable" : null, createdAt: now, updatedAt: now });
  if (input.kind === "expense") await evaluateBudgetAlerts(monthKey(input.occurredAt), input.currency);
}
export async function deleteTransaction(transactionId: string) { await db.delete(transactions).where(eq(transactions.id, transactionId)); }
export async function listTransactions(month?: string) {
  if (!month) return db.select({ transaction: transactions, category: categories, account: accounts }).from(transactions).innerJoin(categories, eq(transactions.categoryId, categories.id)).innerJoin(accounts, eq(transactions.accountId, accounts.id)).orderBy(desc(transactions.occurredAt));
  const { start, end } = monthBounds(month);
  return db.select({ transaction: transactions, category: categories, account: accounts }).from(transactions).innerJoin(categories, eq(transactions.categoryId, categories.id)).innerJoin(accounts, eq(transactions.accountId, accounts.id)).where(and(gte(transactions.occurredAt, start), lt(transactions.occurredAt, end))).orderBy(desc(transactions.occurredAt));
}
export async function monthSummary(month: string, currency: string) {
  const { start, end } = monthBounds(month);
  const rows = await db.select({ kind: transactions.kind, total: sql<number>`coalesce(sum(${transactions.amount}), 0)` }).from(transactions).where(and(gte(transactions.occurredAt, start), lt(transactions.occurredAt, end), eq(transactions.currency, currency))).groupBy(transactions.kind);
  const income = rows.find((x) => x.kind === "income")?.total ?? 0;
  const expense = rows.find((x) => x.kind === "expense")?.total ?? 0;
  return { income, expense, balance: income - expense };
}
export async function categorySummary(month: string, currency: string) {
  const { start, end } = monthBounds(month);
  return db.select({ id: categories.id, name: categories.name, icon: categories.icon, color: categories.color, total: sql<number>`sum(${transactions.amount})` }).from(transactions).innerJoin(categories, eq(transactions.categoryId, categories.id)).where(and(eq(transactions.kind, "expense"), eq(transactions.currency, currency), gte(transactions.occurredAt, start), lt(transactions.occurredAt, end))).groupBy(categories.id).orderBy(desc(sql`sum(${transactions.amount})`));
}
export async function spendingTrend(anchor: Date, currency: string, count = 6) {
  const result: { month: string; income: number; expense: number }[] = [];
  for (let i = count - 1; i >= 0; i--) { const date = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1); const summary = await monthSummary(monthKey(date), currency); result.push({ month: new Intl.DateTimeFormat("en", { month: "short" }).format(date), income: summary.income, expense: summary.expense }); }
  return result;
}
export async function getBudget(month: string, currency: string) { return (await db.select().from(budgets).where(and(eq(budgets.month, month), eq(budgets.currency, currency))).limit(1))[0]; }
export async function saveBudget(month: string, currency: string, amount: number, alertsEnabled: boolean) {
  const current = await getBudget(month, currency);
  if (current) await db.update(budgets).set({ amount, alertsEnabled, updatedAt: new Date() }).where(eq(budgets.id, current.id));
  else await db.insert(budgets).values({ id: id("budget"), month, currency, amount, alertsEnabled, updatedAt: new Date() });
}
async function evaluateBudgetAlerts(month: string, currency: string) {
  const budget = await getBudget(month, currency); if (!budget?.alertsEnabled) return;
  const { expense } = await monthSummary(month, currency); const percent = Math.floor(expense / budget.amount * 100);
  for (const threshold of [budget.warningThreshold, budget.criticalThreshold]) {
    if (percent < threshold) continue;
    const eventId = id("notice"); const result = await sqlite.runAsync("INSERT OR IGNORE INTO notification_events(id,budget_id,month,threshold,created_at) VALUES (?,?,?,?,?)", eventId, budget.id, month, threshold, Date.now());
    if (result.changes > 0) { const { notifyBudgetThreshold } = await import("@/services/notifications"); await notifyBudgetThreshold(threshold); }
  }
}
export async function budgetSuggestion(month: string, currency: string) {
  const { start } = monthBounds(month); const values: number[] = [];
  for (let i = 1; i <= 3; i++) { const d = new Date(start.getFullYear(), start.getMonth() - i, 1); const s = await monthSummary(monthKey(d), currency); if (s.expense > 0) values.push(s.expense); }
  return values.length === 3 ? Math.round(values.reduce((a, b) => a + b, 0) / 3) : null;
}
export async function getPreference(key: string) { return (await db.select().from(preferences).where(eq(preferences.key, key)).limit(1))[0]?.value; }
export async function setPreference(key: string, value: string) { await sqlite.runAsync("INSERT INTO preferences(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", key, value); }
export type { Transaction };
