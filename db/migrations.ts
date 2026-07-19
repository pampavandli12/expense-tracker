import journal from "../drizzle/meta/_journal.json";
import { bundledMigrationSql } from "./migrations.generated";

const migrations = {
  journal,
  migrations: bundledMigrationSql,
};

export default migrations;
