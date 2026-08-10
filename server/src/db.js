const mysql = require("mysql2/promise");

let pool = null;

function getPool() {
  if (pool) return pool;
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  if (!host || !user || !database) {
    throw new Error("MySQL env not configured");
  }
  pool = mysql.createPool({
    host,
    port: Number(process.env.MYSQL_PORT || 3306),
    user,
    password: password || "",
    database,
    waitForConnections: true,
    connectionLimit: 5,
    timezone: "+00:00",
    ...(process.env.MYSQL_SSL === "1"
      ? { ssl: { rejectUnauthorized: false } }
      : {})
  });
  return pool;
}

async function pingDb() {
  const p = getPool();
  await p.query("SELECT 1");
}

module.exports = { getPool, pingDb };
