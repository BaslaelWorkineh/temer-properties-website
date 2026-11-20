import "./load-env";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { databaseUrl, ensureLocalDbDir } from "../src/db/url";

/** Applies pending migrations from ./drizzle. Safe to run on every deploy. */
async function main() {
  ensureLocalDbDir(databaseUrl);
  const client = createClient({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN });
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  client.close();
  console.log(`✓ Migrations applied (${databaseUrl.startsWith("file:") ? databaseUrl : "remote database"})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
