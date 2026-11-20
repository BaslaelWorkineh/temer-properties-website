import "./scripts/load-env";
import { defineConfig } from "drizzle-kit";
import { databaseUrl, ensureLocalDbDir } from "./src/db/url";

ensureLocalDbDir(databaseUrl);

export default defineConfig({
  dialect: "turso",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  strict: true,
  verbose: true,
});
