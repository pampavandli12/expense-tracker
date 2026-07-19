import m0000 from "../drizzle/0000_neat_crystal.sql";
import journal from "../drizzle/meta/_journal.json";

const migrations = {
  journal,
  migrations: { m0000 },
};

export default migrations;
