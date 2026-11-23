import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { requireDatabaseUrl } from "./url";

/**
 * Postgres (Neon in production) through node-postgres. On Vercel each function instance keeps a small pool; Neon's
 * pooled endpoint ("-pooler" in the host) multiplexes them, so many instances don't exhaust connections.
 */
const globalForDb = globalThis as unknown as { __pgPool?: Pool };

function createPool() {
  const building = process.env.NEXT_PHASE === "phase-production-build";
  const pool = new Pool({
    connectionString: requireDatabaseUrl(),
    // The build runs several workers in parallel, each with its own pool: keep each one small.
    max: building ? 2 : 5,
    // Neon closes idle connections (and suspends the database after a few idle minutes), so don't keep idle
    // connections around long, and give a waking database time to answer.
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: building ? 30_000 : 15_000,
    keepAlive: true,
  });
  // A connection closed by the server while idle emits "error" on the pool; without a listener that would crash
  // the process. The pool already discards that connection and opens a new one for the next query.
  pool.on("error", (err) => console.warn("[db] idle connection closed:", err.message));
  return pool;
}

// Reused across hot reloads in development so they don't leak connections.
const pool = globalForDb.__pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.__pgPool = pool;

export const db = drizzle(pool, { schema });
export type Db = typeof db;
export { schema };
