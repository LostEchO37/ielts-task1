const fs = require("fs");
const path = require("path");
const { getPool } = require("./db");

const PATCHES = [
  "ALTER TABLE accounts MODIFY password_hash VARCHAR(256) NOT NULL"
];

async function migrate() {
  const schemaPath = path.join(__dirname, "..", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.replace(/--[^\n]*/g, "").trim())
    .filter(Boolean);

  const pool = getPool();
  for (const stmt of statements) {
    await pool.query(stmt);
  }
  for (const patch of PATCHES) {
    try {
      await pool.query(patch);
    } catch (e) {
      console.warn("Migration patch skipped:", e.message);
    }
  }
  console.log(`Database migrated (${statements.length} statements)`);
}

async function checkTables() {
  const pool = getPool();
  const db = process.env.MYSQL_DATABASE;
  const [rows] = await pool.query(
    "SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('accounts', 'user_records')",
    [db]
  );
  return new Set(rows.map((r) => r.name));
}

module.exports = { migrate, checkTables };
