import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

export const sqlite = openDatabaseSync("expense-tracker.db", { enableChangeListener: true });
export const db = drizzle(sqlite, { schema });

const migrationSql = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, type TEXT NOT NULL, currency TEXT NOT NULL DEFAULT 'INR', opening_balance INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, kind TEXT NOT NULL, icon TEXT NOT NULL, color TEXT NOT NULL, system INTEGER NOT NULL DEFAULT 0, archived INTEGER NOT NULL DEFAULT 0);
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_kind ON categories(name, kind);
CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY NOT NULL, kind TEXT NOT NULL, account_id TEXT NOT NULL REFERENCES accounts(id), category_id TEXT NOT NULL REFERENCES categories(id), amount INTEGER NOT NULL CHECK(amount > 0), currency TEXT NOT NULL, occurred_at INTEGER NOT NULL, notes TEXT, expense_type TEXT, transfer_id TEXT, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS transactions_month ON transactions(occurred_at);
CREATE INDEX IF NOT EXISTS transactions_account ON transactions(account_id);
CREATE TABLE IF NOT EXISTS transfers (id TEXT PRIMARY KEY NOT NULL, from_account_id TEXT NOT NULL REFERENCES accounts(id), to_account_id TEXT NOT NULL REFERENCES accounts(id), source_amount INTEGER NOT NULL, destination_amount INTEGER NOT NULL, source_currency TEXT NOT NULL, destination_currency TEXT NOT NULL, occurred_at INTEGER NOT NULL, notes TEXT);
CREATE TABLE IF NOT EXISTS budgets (id TEXT PRIMARY KEY NOT NULL, month TEXT NOT NULL, currency TEXT NOT NULL, amount INTEGER NOT NULL CHECK(amount > 0), alerts_enabled INTEGER NOT NULL DEFAULT 1, warning_threshold INTEGER NOT NULL DEFAULT 80, critical_threshold INTEGER NOT NULL DEFAULT 100, updated_at INTEGER NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS budgets_month_currency ON budgets(month, currency);
CREATE TABLE IF NOT EXISTS notification_events (id TEXT PRIMARY KEY NOT NULL, budget_id TEXT NOT NULL REFERENCES budgets(id), month TEXT NOT NULL, threshold INTEGER NOT NULL, created_at INTEGER NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS notification_once ON notification_events(budget_id, month, threshold);
CREATE TABLE IF NOT EXISTS preferences (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
`;

const seedCategories = [
  ["expense-food", "Food & Dining", "expense", "restaurant", "#FF7A1A"],
  ["expense-rent", "Housing & Rent", "expense", "home", "#5663F7"],
  ["expense-travel", "Travel", "expense", "airplane", "#08BBD2"],
  ["expense-emi", "EMI", "expense", "business", "#7C68EE"],
  ["expense-subs", "Subscriptions", "expense", "card", "#EC5BA8"],
  ["expense-other", "Other", "expense", "ellipsis-horizontal", "#8FA0B8"],
  ["income-salary", "Salary", "income", "briefcase", "#15E765"],
  ["income-freelance", "Freelance", "income", "laptop", "#3B82F6"],
  ["income-other", "Other", "income", "add-circle", "#8B5CF6"],
] as const;

export async function initializeDatabase() {
  await sqlite.execAsync(migrationSql);
  await sqlite.withTransactionAsync(async () => {
    await sqlite.runAsync("INSERT OR IGNORE INTO accounts (id,name,type,currency,opening_balance,archived,created_at) VALUES (?,?,?,?,?,?,?)", "account-cash", "Cash", "cash", "INR", 0, 0, Date.now());
    for (const [id, name, kind, icon, color] of seedCategories) {
      await sqlite.runAsync("INSERT OR IGNORE INTO categories (id,name,kind,icon,color,system,archived) VALUES (?,?,?,?,?,?,?)", id, name, kind, icon, color, 1, 0);
    }
    await sqlite.runAsync("INSERT OR IGNORE INTO preferences (key,value) VALUES (?,?)", "baseCurrency", "INR");
  });
}
