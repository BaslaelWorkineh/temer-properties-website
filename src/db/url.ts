import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Shared by the app, drizzle-kit and scripts so they always hit the same database. */
export const databaseUrl = process.env.DATABASE_URL?.trim() || "file:./data/temer.db";

export function ensureLocalDbDir(url: string) {
  if (!url.startsWith("file:")) return;
  const filePath = url.slice("file:".length);
  if (!filePath || filePath === ":memory:") return;
  mkdirSync(dirname(resolve(filePath)), { recursive: true });
}
