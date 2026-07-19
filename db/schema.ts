import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    type: text("type", {
      enum: ["cash", "bank", "card", "wallet"],
    }).notNull(),
    currency: text("currency").notNull().default("INR"),
    openingBalance: integer("opening_balance").notNull().default(0),
    archived: integer("archived", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    check("accounts_currency_iso", sql`length(${table.currency}) = 3`),
  ],
);

export const categories = sqliteTable(
  "categories",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    kind: text("kind", { enum: ["income", "expense"] }).notNull(),
    icon: text("icon").notNull(),
    color: text("color").notNull(),
    system: integer("system", { mode: "boolean" }).notNull().default(false),
    archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  },
  (table) => [uniqueIndex("categories_name_kind").on(table.name, table.kind)],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    kind: text("kind", { enum: ["income", "expense"] }).notNull(),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull(),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull(),
    notes: text("notes"),
    expenseType: text("expense_type", { enum: ["variable", "fixed"] }),
    transferId: text("transfer_id"),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    index("transactions_month").on(table.occurredAt),
    index("transactions_account").on(table.accountId),
    check("transactions_amount_positive", sql`${table.amount} > 0`),
    check("transactions_currency_iso", sql`length(${table.currency}) = 3`),
  ],
);

export const transfers = sqliteTable(
  "transfers",
  {
    id: text("id").primaryKey(),
    fromAccountId: text("from_account_id")
      .notNull()
      .references(() => accounts.id),
    toAccountId: text("to_account_id")
      .notNull()
      .references(() => accounts.id),
    sourceAmount: integer("source_amount").notNull(),
    destinationAmount: integer("destination_amount").notNull(),
    sourceCurrency: text("source_currency").notNull(),
    destinationCurrency: text("destination_currency").notNull(),
    occurredAt: integer("occurred_at", { mode: "timestamp_ms" }).notNull(),
    notes: text("notes"),
  },
  (table) => [
    check("transfers_source_amount_positive", sql`${table.sourceAmount} > 0`),
    check(
      "transfers_destination_amount_positive",
      sql`${table.destinationAmount} > 0`,
    ),
    check(
      "transfers_distinct_accounts",
      sql`${table.fromAccountId} <> ${table.toAccountId}`,
    ),
    check(
      "transfers_source_currency_iso",
      sql`length(${table.sourceCurrency}) = 3`,
    ),
    check(
      "transfers_destination_currency_iso",
      sql`length(${table.destinationCurrency}) = 3`,
    ),
  ],
);

export const budgets = sqliteTable(
  "budgets",
  {
    id: text("id").primaryKey(),
    month: text("month").notNull(),
    currency: text("currency").notNull(),
    amount: integer("amount").notNull(),
    alertsEnabled: integer("alerts_enabled", { mode: "boolean" })
      .notNull()
      .default(true),
    warningThreshold: integer("warning_threshold").notNull().default(80),
    criticalThreshold: integer("critical_threshold").notNull().default(100),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("budgets_month_currency").on(table.month, table.currency),
    check("budgets_amount_positive", sql`${table.amount} > 0`),
    check("budgets_currency_iso", sql`length(${table.currency}) = 3`),
  ],
);

export const notificationEvents = sqliteTable(
  "notification_events",
  {
    id: text("id").primaryKey(),
    budgetId: text("budget_id")
      .notNull()
      .references(() => budgets.id),
    month: text("month").notNull(),
    threshold: integer("threshold").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => [
    uniqueIndex("notification_once").on(
      table.budgetId,
      table.month,
      table.threshold,
    ),
  ],
);

export const preferences = sqliteTable("preferences", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
