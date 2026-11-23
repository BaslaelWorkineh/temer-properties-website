import "./load-env";
import { parseArgs } from "node:util";
import { eq } from "drizzle-orm";
import { closeDb, db } from "./db";
import { adminUsers } from "../src/db/schema";
import { hashPassword } from "../src/lib/auth/password";

/**
 * Create an admin, or reset an existing admin's password:
 *   npm run admin:create -- --email you@example.com --name "Your Name" --password "a-long-password"
 * --password can be omitted when ADMIN_PASSWORD is set. --role editor creates a non-admin editor.
 */
async function main() {
  const { values } = parseArgs({
    options: {
      email: { type: "string" },
      name: { type: "string" },
      password: { type: "string" },
      role: { type: "string", default: "admin" },
    },
  });

  const email = values.email?.trim().toLowerCase();
  const password = values.password ?? process.env.ADMIN_PASSWORD ?? "";
  const role = values.role === "editor" ? "editor" : "admin";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Pass a valid --email, e.g. npm run admin:create -- --email you@example.com --name "Your Name" --password "…"');
  }
  if (password.length < 10) throw new Error("The password must be at least 10 characters (--password or ADMIN_PASSWORD).");


  try {
    const passwordHash = await hashPassword(password);
    const [existing] = await db.select({ id: adminUsers.id, name: adminUsers.name }).from(adminUsers).where(eq(adminUsers.email, email)).limit(1);

    if (existing) {
      await db
        .update(adminUsers)
        .set({ passwordHash, role, ...(values.name ? { name: values.name.trim() } : {}) })
        .where(eq(adminUsers.id, existing.id));
      console.log(`✓ Updated admin ${email} (password reset${values.name ? ", name updated" : ""}).`);
    } else {
      const name = values.name?.trim() || email.split("@")[0];
      await db.insert(adminUsers).values({ email, name, passwordHash, role });
      console.log(`✓ Created ${role} ${email}. Sign in at /admin/login`);
    }
  } catch (err) {
    if (err instanceof Error && /does not exist/i.test(err.message)) {
      throw new Error("The database has no tables yet. Run `npm run db:migrate` first.");
    }
    throw err;
  } finally {
    await closeDb();
  }
}

main().catch((err) => {
  console.error(`✗ ${err instanceof Error ? err.message : err}`);
  process.exit(1);
});
