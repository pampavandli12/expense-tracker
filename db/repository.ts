import { and, asc, desc, eq, gte, like, lt, or, sql } from "drizzle-orm";
import {
  formatMoney,
  monthBounds,
  monthKey,
  toMinorUnits,
} from "@/lib/finance";
import {
  calculateAccountBalance,
  calculateBudgetPercent,
  calculateBudgetSuggestion,
} from "@/lib/ledger";
import { db, sqlite } from "./client";
import {
  accounts,
  budgets,
  categories,
  notificationEvents,
  preferences,
  transactions,
  transfers,
  type Transaction,
} from "./schema";

export const id = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export { formatMoney, monthBounds, monthKey, toMinorUnits };

const ISO_CURRENCY = /^[A-Z]{3}$/;

function validateCurrency(currency: string) {
  if (!ISO_CURRENCY.test(currency)) {
    throw new Error("Currency must be a three-letter ISO code.");
  }
}

function validateAmount(amount: number) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Amount must be a positive integer in minor units.");
  }
}

function validateDate(date: Date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Choose a valid transaction date.");
  }
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  if (date > endOfToday)
    throw new Error("Future transactions are not supported.");
}

export async function listAccounts(options?: { includeArchived?: boolean }) {
  const query = db.select().from(accounts);
  return options?.includeArchived
    ? query.orderBy(asc(accounts.createdAt))
    : query
        .where(eq(accounts.archived, false))
        .orderBy(asc(accounts.createdAt));
}

export async function getAccount(accountId: string) {
  return (
    await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1)
  )[0];
}

export async function accountBalances() {
  const rows = await listAccounts();
  return Promise.all(
    rows.map(async (account) => {
      const totals = await db
        .select({
          kind: transactions.kind,
          total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
        })
        .from(transactions)
        .where(
          and(
            eq(transactions.accountId, account.id),
            eq(transactions.currency, account.currency),
          ),
        )
        .groupBy(transactions.kind);
      const transferOut = (
        await db
          .select({
            total: sql<number>`coalesce(sum(${transfers.sourceAmount}), 0)`,
          })
          .from(transfers)
          .where(eq(transfers.fromAccountId, account.id))
      )[0]?.total;
      const transferIn = (
        await db
          .select({
            total: sql<number>`coalesce(sum(${transfers.destinationAmount}), 0)`,
          })
          .from(transfers)
          .where(eq(transfers.toAccountId, account.id))
      )[0]?.total;
      const income = totals.find((row) => row.kind === "income")?.total ?? 0;
      const expense = totals.find((row) => row.kind === "expense")?.total ?? 0;
      return {
        ...account,
        balance: calculateAccountBalance({
          openingBalance: account.openingBalance,
          income,
          expense,
          transferIn,
          transferOut,
        }),
      };
    }),
  );
}

export type AccountInput = {
  name: string;
  type: "cash" | "bank" | "card" | "wallet";
  currency: string;
  openingBalance: number;
};

export async function createAccount(input: AccountInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Account name is required.");
  validateCurrency(input.currency);
  if (!Number.isInteger(input.openingBalance)) {
    throw new Error("Opening balance must use integer minor units.");
  }
  await db.insert(accounts).values({
    id: id("acc"),
    ...input,
    name,
    createdAt: new Date(),
  });
}

export async function updateAccount(accountId: string, input: AccountInput) {
  const existing = await getAccount(accountId);
  if (!existing) throw new Error("Account not found.");
  if (existing.currency !== input.currency) {
    const activity = (
      await db
        .select({ count: sql<number>`count(*)` })
        .from(transactions)
        .where(eq(transactions.accountId, accountId))
    )[0]?.count;
    const transferActivity = (
      await db
        .select({ count: sql<number>`count(*)` })
        .from(transfers)
        .where(
          or(
            eq(transfers.fromAccountId, accountId),
            eq(transfers.toAccountId, accountId),
          ),
        )
    )[0]?.count;
    if ((activity ?? 0) > 0 || (transferActivity ?? 0) > 0) {
      throw new Error("Currency cannot change after an account has activity.");
    }
  }
  const name = input.name.trim();
  if (!name) throw new Error("Account name is required.");
  validateCurrency(input.currency);
  await db
    .update(accounts)
    .set({ ...input, name })
    .where(eq(accounts.id, accountId));
}

export async function archiveAccount(accountId: string) {
  const activeAccounts = await listAccounts();
  if (activeAccounts.length <= 1) {
    throw new Error("Keep at least one active account.");
  }
  await db
    .update(accounts)
    .set({ archived: true })
    .where(eq(accounts.id, accountId));
}

export async function listCategories(
  kind?: "income" | "expense",
  options?: { includeArchived?: boolean },
) {
  const conditions = [];
  if (!options?.includeArchived)
    conditions.push(eq(categories.archived, false));
  if (kind) conditions.push(eq(categories.kind, kind));
  const query = db.select().from(categories);
  return conditions.length
    ? query
        .where(and(...conditions))
        .orderBy(desc(categories.system), asc(categories.name))
    : query.orderBy(desc(categories.system), asc(categories.name));
}

export type CategoryInput = {
  name: string;
  kind: "income" | "expense";
  icon: string;
  color: string;
};

export async function createCategory(input: CategoryInput) {
  const name = input.name.trim();
  if (!name) throw new Error("Category name is required.");
  await db.insert(categories).values({
    id: id("category"),
    ...input,
    name,
    system: false,
    archived: false,
  });
}

export async function updateCategory(categoryId: string, input: CategoryInput) {
  const existing = (
    await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)
  )[0];
  if (!existing) throw new Error("Category not found.");
  if (existing.system) throw new Error("Built-in categories cannot be edited.");
  if (existing.kind !== input.kind) {
    throw new Error("A category type cannot change after creation.");
  }
  const name = input.name.trim();
  if (!name) throw new Error("Category name is required.");
  await db
    .update(categories)
    .set({ ...input, name })
    .where(eq(categories.id, categoryId));
}

export async function archiveCategory(categoryId: string) {
  const existing = (
    await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)
  )[0];
  if (!existing) throw new Error("Category not found.");
  if (existing.system)
    throw new Error("Built-in categories cannot be archived.");
  await db
    .update(categories)
    .set({ archived: true })
    .where(eq(categories.id, categoryId));
}

export type TransactionInput = {
  kind: "income" | "expense";
  accountId: string;
  categoryId: string;
  amount: number;
  currency: string;
  occurredAt: Date;
  notes?: string;
  expenseType?: "variable" | "fixed";
};

async function validateTransaction(input: TransactionInput) {
  validateAmount(input.amount);
  validateCurrency(input.currency);
  validateDate(input.occurredAt);
  const [account, category] = await Promise.all([
    getAccount(input.accountId),
    db
      .select()
      .from(categories)
      .where(eq(categories.id, input.categoryId))
      .limit(1)
      .then((rows) => rows[0]),
  ]);
  if (!account || account.archived)
    throw new Error("Choose an active account.");
  if (account.currency !== input.currency) {
    throw new Error("Transaction currency must match its account.");
  }
  if (!category || category.archived || category.kind !== input.kind) {
    throw new Error("Choose a valid category.");
  }
}

export async function getTransaction(transactionId: string) {
  return (
    await db
      .select({
        transaction: transactions,
        category: categories,
        account: accounts,
      })
      .from(transactions)
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(eq(transactions.id, transactionId))
      .limit(1)
  )[0];
}

export async function saveTransaction(
  input: TransactionInput,
  transactionId?: string,
) {
  await validateTransaction(input);
  const now = new Date();
  if (transactionId) {
    const existing = await getTransaction(transactionId);
    if (!existing) throw new Error("Transaction not found.");
    await db
      .update(transactions)
      .set({
        ...input,
        notes: input.notes?.trim() || null,
        expenseType:
          input.kind === "expense" ? (input.expenseType ?? "variable") : null,
        updatedAt: now,
      })
      .where(eq(transactions.id, transactionId));
  } else {
    await db.insert(transactions).values({
      id: id("txn"),
      ...input,
      notes: input.notes?.trim() || null,
      expenseType:
        input.kind === "expense" ? (input.expenseType ?? "variable") : null,
      createdAt: now,
      updatedAt: now,
    });
  }
  if (input.kind === "expense") {
    await evaluateBudgetAlerts(monthKey(input.occurredAt), input.currency);
  }
}

export type TransactionFilters = {
  month?: string;
  query?: string;
  kind?: "income" | "expense";
  expenseType?: "variable" | "fixed";
  categoryId?: string;
  accountId?: string;
  currency?: string;
};

export async function listTransactions(input?: string | TransactionFilters) {
  const filters = typeof input === "string" ? { month: input } : (input ?? {});
  const conditions = [];
  if (filters.month) {
    const { start, end } = monthBounds(filters.month);
    conditions.push(
      gte(transactions.occurredAt, start),
      lt(transactions.occurredAt, end),
    );
  }
  if (filters.kind) conditions.push(eq(transactions.kind, filters.kind));
  if (filters.expenseType) {
    conditions.push(eq(transactions.expenseType, filters.expenseType));
  }
  if (filters.categoryId) {
    conditions.push(eq(transactions.categoryId, filters.categoryId));
  }
  if (filters.accountId) {
    conditions.push(eq(transactions.accountId, filters.accountId));
  }
  if (filters.currency) {
    validateCurrency(filters.currency);
    conditions.push(eq(transactions.currency, filters.currency));
  }
  const search = filters.query?.trim();
  if (search) {
    const pattern = `%${search}%`;
    conditions.push(
      or(
        like(transactions.notes, pattern),
        like(categories.name, pattern),
        like(accounts.name, pattern),
      )!,
    );
  }
  const query = db
    .select({
      transaction: transactions,
      category: categories,
      account: accounts,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .innerJoin(accounts, eq(transactions.accountId, accounts.id));
  return conditions.length
    ? query
        .where(and(...conditions))
        .orderBy(desc(transactions.occurredAt), desc(transactions.createdAt))
    : query.orderBy(
        desc(transactions.occurredAt),
        desc(transactions.createdAt),
      );
}

export async function deleteTransaction(transactionId: string) {
  const existing = await getTransaction(transactionId);
  if (!existing) throw new Error("Transaction not found.");
  await db.delete(transactions).where(eq(transactions.id, transactionId));
}

export type TransferInput = {
  fromAccountId: string;
  toAccountId: string;
  sourceAmount: number;
  destinationAmount: number;
  occurredAt: Date;
  notes?: string;
};

export async function createTransfer(input: TransferInput) {
  if (input.fromAccountId === input.toAccountId) {
    throw new Error("Choose two different accounts.");
  }
  validateAmount(input.sourceAmount);
  validateAmount(input.destinationAmount);
  validateDate(input.occurredAt);
  const [fromAccount, toAccount] = await Promise.all([
    getAccount(input.fromAccountId),
    getAccount(input.toAccountId),
  ]);
  if (!fromAccount || fromAccount.archived) {
    throw new Error("Source account is unavailable.");
  }
  if (!toAccount || toAccount.archived) {
    throw new Error("Destination account is unavailable.");
  }
  if (
    fromAccount.currency === toAccount.currency &&
    input.sourceAmount !== input.destinationAmount
  ) {
    throw new Error("Same-currency transfers must use equal amounts.");
  }
  await db.transaction(async (tx) => {
    await tx.insert(transfers).values({
      id: id("transfer"),
      ...input,
      sourceCurrency: fromAccount.currency,
      destinationCurrency: toAccount.currency,
      notes: input.notes?.trim() || null,
    });
  });
}

export async function listTransfers(accountId?: string) {
  const query = db.select().from(transfers);
  return accountId
    ? query
        .where(
          or(
            eq(transfers.fromAccountId, accountId),
            eq(transfers.toAccountId, accountId),
          ),
        )
        .orderBy(desc(transfers.occurredAt))
    : query.orderBy(desc(transfers.occurredAt));
}

export async function monthSummary(
  month: string,
  currency: string,
  accountId?: string,
) {
  validateCurrency(currency);
  const { start, end } = monthBounds(month);
  const conditions = [
    gte(transactions.occurredAt, start),
    lt(transactions.occurredAt, end),
    eq(transactions.currency, currency),
  ];
  if (accountId) conditions.push(eq(transactions.accountId, accountId));
  const rows = await db
    .select({
      kind: transactions.kind,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`,
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(transactions.kind);
  const income = rows.find((row) => row.kind === "income")?.total ?? 0;
  const expense = rows.find((row) => row.kind === "expense")?.total ?? 0;
  return { income, expense, balance: income - expense };
}

export async function categorySummary(
  month: string,
  currency: string,
  accountId?: string,
) {
  validateCurrency(currency);
  const { start, end } = monthBounds(month);
  const conditions = [
    eq(transactions.kind, "expense"),
    eq(transactions.currency, currency),
    gte(transactions.occurredAt, start),
    lt(transactions.occurredAt, end),
  ];
  if (accountId) conditions.push(eq(transactions.accountId, accountId));
  return db
    .select({
      id: categories.id,
      name: categories.name,
      icon: categories.icon,
      color: categories.color,
      total: sql<number>`sum(${transactions.amount})`,
    })
    .from(transactions)
    .innerJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(...conditions))
    .groupBy(categories.id)
    .orderBy(desc(sql`sum(${transactions.amount})`));
}

export async function spendingTrend(
  anchor: Date,
  currency: string,
  count = 6,
  accountId?: string,
) {
  const result: { month: string; income: number; expense: number }[] = [];
  for (let index = count - 1; index >= 0; index--) {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - index, 1);
    const summary = await monthSummary(monthKey(date), currency, accountId);
    result.push({
      month: new Intl.DateTimeFormat("en", { month: "short" }).format(date),
      income: summary.income,
      expense: summary.expense,
    });
  }
  return result;
}

export async function getBudget(month: string, currency: string) {
  return (
    await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.month, month), eq(budgets.currency, currency)))
      .limit(1)
  )[0];
}

export async function saveBudget(
  month: string,
  currency: string,
  amount: number,
  alertsEnabled: boolean,
) {
  validateCurrency(currency);
  validateAmount(amount);
  const current = await getBudget(month, currency);
  if (current) {
    await db
      .update(budgets)
      .set({ amount, alertsEnabled, updatedAt: new Date() })
      .where(eq(budgets.id, current.id));
  } else {
    await db.insert(budgets).values({
      id: id("budget"),
      month,
      currency,
      amount,
      alertsEnabled,
      updatedAt: new Date(),
    });
  }
}

async function evaluateBudgetAlerts(month: string, currency: string) {
  const budget = await getBudget(month, currency);
  if (!budget?.alertsEnabled) return;
  const { expense } = await monthSummary(month, currency);
  const percent = calculateBudgetPercent(expense, budget.amount);
  for (const threshold of [budget.warningThreshold, budget.criticalThreshold]) {
    if (percent < threshold) continue;
    const eventId = id("notice");
    const result = await sqlite.runAsync(
      "INSERT OR IGNORE INTO notification_events(id,budget_id,month,threshold,created_at) VALUES (?,?,?,?,?)",
      eventId,
      budget.id,
      month,
      threshold,
      Date.now(),
    );
    if (result.changes > 0) {
      const { notifyBudgetThreshold } =
        await import("@/services/notifications");
      await notifyBudgetThreshold(threshold);
    }
  }
}

export async function budgetSuggestion(month: string, currency: string) {
  const { start } = monthBounds(month);
  const values: number[] = [];
  for (let index = 1; index <= 3; index++) {
    const date = new Date(start.getFullYear(), start.getMonth() - index, 1);
    const summary = await monthSummary(monthKey(date), currency);
    if (summary.expense > 0) values.push(summary.expense);
  }
  return calculateBudgetSuggestion(values);
}

export async function getPreference(key: string) {
  return (
    await db.select().from(preferences).where(eq(preferences.key, key)).limit(1)
  )[0]?.value;
}

export async function setPreference(key: string, value: string) {
  await sqlite.runAsync(
    "INSERT INTO preferences(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    key,
    value,
  );
}

export async function exportDatabaseSnapshot() {
  const [accountRows, categoryRows, transactionRows, transferRows, budgetRows] =
    await Promise.all([
      listAccounts({ includeArchived: true }),
      listCategories(undefined, { includeArchived: true }),
      listTransactions(),
      listTransfers(),
      db.select().from(budgets).orderBy(asc(budgets.month)),
    ]);
  return {
    exportedAt: new Date().toISOString(),
    version: 1,
    accounts: accountRows,
    categories: categoryRows,
    transactions: transactionRows.map((row) => row.transaction),
    transfers: transferRows,
    budgets: budgetRows,
  };
}

export async function resetLocalData() {
  await db.transaction(async (tx) => {
    await tx.delete(notificationEvents);
    await tx.delete(budgets);
    await tx.delete(transfers);
    await tx.delete(transactions);
    await tx.delete(categories).where(eq(categories.system, false));
    await tx.delete(accounts);
    await tx.insert(accounts).values({
      id: "account-cash",
      name: "Cash",
      type: "cash",
      currency: "INR",
      openingBalance: 0,
      archived: false,
      createdAt: new Date(),
    });
  });
}

export async function clearNotificationEventsForTesting() {
  if (!__DEV__)
    throw new Error("Testing helper is unavailable in release builds.");
  await db.delete(notificationEvents);
}

export type { Transaction };
