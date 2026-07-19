import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { openDatabaseSync } from "expo-sqlite";
import migrations from "./migrations";
import * as schema from "./schema";

export const sqlite = openDatabaseSync("expense-tracker.db", {
  enableChangeListener: true,
});
export const db = drizzle(sqlite, { schema });

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
  await sqlite.execAsync(
    "PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;",
  );
  await migrate(db, migrations);
  await sqlite.withTransactionAsync(async () => {
    await sqlite.runAsync(
      "INSERT OR IGNORE INTO accounts (id,name,type,currency,opening_balance,archived,created_at) VALUES (?,?,?,?,?,?,?)",
      "account-cash",
      "Cash",
      "cash",
      "INR",
      0,
      0,
      Date.now(),
    );
    for (const [id, name, kind, icon, color] of seedCategories) {
      await sqlite.runAsync(
        "INSERT OR IGNORE INTO categories (id,name,kind,icon,color,system,archived) VALUES (?,?,?,?,?,?,?)",
        id,
        name,
        kind,
        icon,
        color,
        1,
        0,
      );
    }
    await sqlite.runAsync(
      "INSERT OR IGNORE INTO preferences (key,value) VALUES (?,?)",
      "baseCurrency",
      "INR",
    );
  });
}
