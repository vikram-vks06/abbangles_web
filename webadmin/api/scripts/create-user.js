import "dotenv/config";
import bcrypt from "bcryptjs";
import pool from "../src/db.js";

const [companyId, emailArg, password, ...nameParts] = process.argv.slice(2);
const email = emailArg?.trim().toLowerCase();
const fullName = nameParts.join(" ").trim();

if (!companyId || !email || !password || !fullName) {
  console.error(
    'Usage: npm run create-user -- <company_id> <email> <password> <"Full Name">',
  );
  process.exitCode = 1;
} else {
  try {
    const [companies] = await pool.execute(
      "SELECT company_id FROM web_companies WHERE company_id = ? AND status = 'active'",
      [companyId],
    );
    if (!companies.length) throw new Error(`Active company not found: ${companyId}`);

    const passwordHash = await bcrypt.hash(password, 12);
    await pool.execute(
      `INSERT INTO web_admin_users (company_id, email, password_hash, full_name, role, status)
       VALUES (?, ?, ?, ?, 'owner', 'active')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash),
         full_name = VALUES(full_name), role = 'owner', status = 'active'`,
      [companyId, email, passwordHash, fullName],
    );
    console.log(`Owner account ready for ${email} in ${companyId}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
