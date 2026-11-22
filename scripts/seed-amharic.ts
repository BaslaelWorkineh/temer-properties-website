import "./load-env";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@libsql/client";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import { databaseUrl, ensureLocalDbDir } from "../src/db/url";
import { locations, posts, projects, properties } from "../src/db/schema";

/**
 * Loads the first-draft Amharic text from scripts/data/am-*.json into each record's `translations` column
 * (`{ am: { … } }`), matched by slug. Safe to run again: it replaces the Amharic text of every record in the files.
 *
 *   npm run db:seed-am
 *
 * After running it, refresh the public pages (edit and save any record in the admin, or restart the server) so the
 * cached pages pick up the new text. Have a native speaker review the text, then edit it in the admin.
 */
function load(name: string): Record<string, Record<string, unknown>> {
  return JSON.parse(readFileSync(resolve(process.cwd(), "scripts/data", name), "utf8"));
}

async function main() {
  ensureLocalDbDir(databaseUrl);
  const client = createClient({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN });
  const db = drizzle(client);

  const tables = [
    { label: "properties", file: "am-properties.json", table: properties },
    { label: "projects", file: "am-projects.json", table: projects },
    { label: "locations", file: "am-locations.json", table: locations },
    { label: "posts", file: "am-posts.json", table: posts },
  ] as const;

  for (const { label, file, table } of tables) {
    const data = load(file);
    let updated = 0;
    const missing: string[] = [];
    for (const [slug, am] of Object.entries(data)) {
      const rows = await db.select({ id: table.id }).from(table).where(eq(table.slug, slug)).limit(1);
      if (!rows[0]) {
        missing.push(slug);
        continue;
      }
      // `translations` has a different type per table; the shapes are checked by the loaders in src/lib/data.
      await db
        .update(table)
        .set({ translations: { am } as never })
        .where(eq(table.id, rows[0].id));
      updated++;
    }
    console.log(`✓ ${label}: ${updated} records${missing.length ? ` (not found: ${missing.join(", ")})` : ""}`);
  }
  client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
