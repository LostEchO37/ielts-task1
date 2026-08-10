const fs = require("fs");
const path = require("path");
const { getPool } = require("./db");

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
  console.log(`Database migrated (${statements.length} statements)`);
}

module.exports = { migrate };
