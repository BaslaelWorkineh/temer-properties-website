import "server-only";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import { databaseUrl, ensureLocalDbDir } from "./url";

/**
 * Local development and single-server deployments use a SQLite file
 * (DATABASE_URL=file:./data/temer.db). Serverless deployments can point
 * DATABASE_URL at a Turso/libSQL database (libsql://…) with DATABASE_AUTH_TOKEN.
 */
const globalForDb = globalThis as unknown as { __libsqlClient?: Client };

function createLibsqlClient() {
  ensureLocalDbDir(databaseUrl);
  const client = createClient({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN });
  if (databaseUrl.startsWith("file:")) {
    // Better concurrency for the file database: readers don't block the writer.
    client.execute("PRAGMA journal_mode = WAL").catch(() => {});
    client.execute("PRAGMA foreign_keys = ON").catch(() => {});
    client.execute("PRAGMA busy_timeout = 5000").catch(() => {});
  }
  return client;
}

const client = globalForDb.__libsqlClient ?? createLibsqlClient();
if (process.env.NODE_ENV !== "production") globalForDb.__libsqlClient = client;

export const db = drizzle(client, { schema });
export { schema };
