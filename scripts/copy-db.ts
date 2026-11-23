import "./load-env";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { closeDb, db, describeDb, pool } from "./db";

/**
 * One-time move from the old SQLite database (data/temer.db) to Postgres (Neon): projects, photos, Amharic text,
 * guides, bookings, enquiries and admin accounts. The target is DATABASE_URL.
 *
 *   npm run db:copy                       # from ./data/temer.db; stops if the target already has content
 *   npm run db:copy -- --from other.db    # another SQLite file
 *   npm run db:copy -- --replace          # empties the target first (its bookings and enquiries too!)
 *
 * Login sessions are not copied: everyone signs in again.
 */
const SKIP = new Set(["sessions", "__drizzle_migrations"]);
const CHUNK = 100;

const fromArg = process.argv.indexOf("--from");
const sourcePath = fromArg > -1 ? process.argv[fromArg + 1] : "./data/temer.db";
const replace = process.argv.includes("--replace");

type PgType = "boolean" | "timestamp with time zone" | "jsonb" | string;

/** SQLite stored booleans as 0/1, timestamps as Unix seconds and JSON as text. */
function convert(value: unknown, type: PgType) {
  if (value === null || value === undefined) return null;
  if (type === "boolean") return Boolean(Number(value));
  if (type === "timestamp with time zone") return new Date(Number(value) * 1000);
  if (type === "jsonb") return typeof value === "string" ? value : JSON.stringify(value);
  return value;
}

async function main() {
  const source = createClient({ url: `file:${sourcePath}` });
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });

    // Tables in foreign-key order: parents before children.
    const names = (await source.execute("select name from sqlite_master where type = 'table' and name not like 'sqlite_%'")).rows
      .map((r) => String(r.name))
      .filter((n) => !SKIP.has(n));
    const parents = new Map<string, string[]>();
    for (const name of names) {
      const fks = await source.execute(`pragma foreign_key_list("${name}")`);
      parents.set(name, fks.rows.map((r) => String(r.table)).filter((t) => t !== name && names.includes(t)));
    }
    const ordered: string[] = [];
    const visit = (name: string) => {
      if (ordered.includes(name)) return;
      for (const p of parents.get(name) ?? []) visit(p);
      ordered.push(name);
    };
    names.forEach(visit);

    // Never mix data silently.
    const filled: string[] = [];
    for (const name of ordered) {
      const { rows } = await pool.query(`select count(*)::int as n from "${name}"`);
      if (rows[0].n > 0) filled.push(`${name} (${rows[0].n})`);
    }
    if (filled.length && !replace) {
      throw new Error(`The target already has content: ${filled.join(", ")}. Re-run with --replace to overwrite it.`);
    }
    if (filled.length) {
      await pool.query(`truncate ${ordered.map((n) => `"${n}"`).join(", ")} restart identity cascade`);
      console.log(`• Emptied the target: ${filled.join(", ")}`);
    }

    const client = await pool.connect();
    try {
      await client.query("begin");
      for (const name of ordered) {
        const types = new Map<string, PgType>(
          (
            await client.query(
              "select column_name, data_type from information_schema.columns where table_schema = 'public' and table_name = $1",
              [name],
            )
          ).rows.map((r) => [r.column_name, r.data_type]),
        );
        const { columns, rows } = await source.execute(`select * from "${name}"`);
        const cols = columns.filter((c) => types.has(c));
        for (let i = 0; i < rows.length; i += CHUNK) {
          const chunk = rows.slice(i, i + CHUNK);
          const values: unknown[] = [];
          const tuples = chunk.map((row) => `(${cols.map((c) => (values.push(convert(row[c], types.get(c)!)), `$${values.length}`)).join(", ")})`);
          await client.query(`insert into "${name}" (${cols.map((c) => `"${c}"`).join(", ")}) values ${tuples.join(", ")}`, values);
        }
        // Identity columns don't advance on explicit ids: continue numbering after the copied rows.
        if (types.has("id") && cols.includes("id")) {
          await client.query(`select setval(pg_get_serial_sequence('"${name}"', 'id'), coalesce((select max(id) from "${name}"), 0) + 1, false)`);
        }
        console.log(`✓ ${name}: ${rows.length} rows`);
      }
      await client.query("commit");
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
    console.log(`Done: copied ${sourcePath} into ${describeDb()}.`);
  } finally {
    source.close();
    await closeDb();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
