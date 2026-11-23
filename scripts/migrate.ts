import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDb, db, describeDb } from "./db";

/** Applies pending migrations from ./drizzle. Safe to run on every deploy. */
async function main() {
  await migrate(db, { migrationsFolder: "./drizzle" });
  await closeDb();
  console.log(`✓ Migrations applied (${describeDb()})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
