import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { deleteDatabaseAsync, openDatabaseSync } from "expo-sqlite";
import migrations from "./migrations";

export type DatabaseIntegrationResult = {
  migrations: boolean;
  foreignKeys: boolean;
  rollback: boolean;
};

export async function runDatabaseIntegrationChecks(): Promise<DatabaseIntegrationResult> {
  if (!__DEV__) {
    throw new Error(
      "Database self-check is only available in development builds.",
    );
  }
  const databaseName = `expense-tracker-integration-${Date.now()}.db`;
  const sqlite = openDatabaseSync(databaseName);
  const testDb = drizzle(sqlite);
  const result: DatabaseIntegrationResult = {
    migrations: false,
    foreignKeys: false,
    rollback: false,
  };

  try {
    await sqlite.execAsync(
      "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;",
    );
    await migrate(testDb, migrations);
    await migrate(testDb, migrations);
    const tables = await sqlite.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table'",
    );
    result.migrations = ["accounts", "categories", "transactions"].every(
      (table) => tables.some((row) => row.name === table),
    );

    try {
      await sqlite.runAsync(
        "INSERT INTO transactions(id,kind,account_id,category_id,amount,currency,occurred_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
        "invalid-transaction",
        "expense",
        "missing-account",
        "missing-category",
        100,
        "INR",
        Date.now(),
        Date.now(),
        Date.now(),
      );
    } catch {
      result.foreignKeys = true;
    }

    try {
      await sqlite.withTransactionAsync(async () => {
        await sqlite.runAsync(
          "INSERT INTO accounts(id,name,type,currency,opening_balance,archived,created_at) VALUES (?,?,?,?,?,?,?)",
          "rollback-account",
          "Rollback",
          "cash",
          "INR",
          0,
          0,
          Date.now(),
        );
        throw new Error("Intentional rollback");
      });
    } catch {
      const row = await sqlite.getFirstAsync<{ count: number }>(
        "SELECT count(*) AS count FROM accounts WHERE id = ?",
        "rollback-account",
      );
      result.rollback = row?.count === 0;
    }

    if (!Object.values(result).every(Boolean)) {
      throw new Error(`Database checks failed: ${JSON.stringify(result)}`);
    }
    return result;
  } finally {
    await sqlite.closeAsync();
    await deleteDatabaseAsync(databaseName).catch(() => undefined);
  }
}
