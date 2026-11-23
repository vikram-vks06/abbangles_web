import "dotenv/config";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import bcrypt from "bcryptjs";
import pool from "../src/db.js";
import { saveDocument } from "../src/content-store.js";

const companyId = process.env.DEFAULT_COMPANY_ID || "A1B1";
const email = (process.env.INITIAL_ADMIN_EMAIL || "admin@abbangles.com").trim().toLowerCase();
const seedPath = fileURLToPath(new URL("../../src/data/site-content.json", import.meta.url));

try {
  const seed = JSON.parse(await readFile(seedPath, "utf8"));
  seed.company = { ...seed.company, id: companyId };
  const companyName = String(seed.company.name || "Arbuda Bangles");
  await pool.execute(
    `INSERT INTO web_companies (company_id, company_name, domain, status)
     VALUES (?, ?, 'abbangles.com', 'active')
     ON DUPLICATE KEY UPDATE company_name = VALUES(company_name),
       domain = VALUES(domain), status = 'active'`,
    [companyId, companyName],
  );

  const [users] = await pool.execute(
    "SELECT id FROM web_admin_users WHERE company_id = ? AND email = ?",
    [companyId, email],
  );
  if (users.length) {
    console.log(`Company is ready. Admin account ${email} already exists; its password was not changed.`);
  } else {
    const password = randomBytes(18).toString("base64url");
    const passwordHash = await bcrypt.hash(password, 12);
    await pool.execute(
      `INSERT INTO web_admin_users (company_id, email, password_hash, full_name, role, status)
       VALUES (?, ?, ?, 'Arbuda Bangles Admin', 'owner', 'active')`,
      [companyId, email, passwordHash],
    );
    console.log(`Created owner account: ${email}`);
    console.log(`Temporary password (save it now): ${password}`);
  }

  const [content] = await pool.execute(
    "SELECT setting_key FROM web_settings WHERE company_id = ? AND setting_key = 'content:schemaVersion'",
    [companyId],
  );
  if (!content.length) {
    seed.company.name = companyName;
    await saveDocument(pool, companyId, seed);
    console.log("Imported starter site content into the normalized company tables.");
  } else {
    console.log("Existing company content was preserved.");
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
