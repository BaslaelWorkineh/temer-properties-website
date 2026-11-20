import { existsSync } from "node:fs";

// Mirror Next.js env loading for CLI scripts (.env.local wins over .env).
for (const file of [".env.local", ".env"]) {
  if (existsSync(file)) process.loadEnvFile(file);
}
