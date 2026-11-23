import "./load-env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { requireDatabaseUrl } from "../src/db/url";

/** Database connection for CLI scripts (src/db/index.ts is server-only). Call closeDb() when done. */
export const pool = new Pool({ connectionString: requireDatabaseUrl(), max: 3 });
export const db = drizzle(pool, { schema });

export async function closeDb() {
  await pool.end();
}

/** Host and database name only (never the password), for log lines. */
export function describeDb() {
  try {
    const u = new URL(requireDatabaseUrl());
    return `${u.hostname}${u.pathname}`;
  } catch {
    return "database";
  }
}
