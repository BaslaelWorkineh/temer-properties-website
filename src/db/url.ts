/**
 * Postgres connection string, shared by the app, drizzle-kit and scripts so they always hit the same database.
 * Neon: use the pooled connection string (host contains "-pooler") with ?sslmode=require.
 */
export const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

export function requireDatabaseUrl() {
  if (!/^postgres(ql)?:\/\//.test(databaseUrl)) {
    throw new Error(
      "DATABASE_URL must be a Postgres connection string, e.g. the Neon one: postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require",
    );
  }
  return databaseUrl;
}
