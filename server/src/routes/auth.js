const express = require("express");
const { getPool } = require("../db");
const {
  createPasswordRecord,
  verifyPassword,
  signToken,
  authMiddleware,
  newUserId,
  validateUsername,
  validatePassword,
  defaultUserData
} = require("../auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  const username = validateUsername(req.body?.username);
  const password = validatePassword(req.body?.password);
  if (!username) {
    return res.status(400).json({ error: "invalid_username", message: "用户名 3–16 字，仅字母数字下划线或中文" });
  }
  if (!password) {
    return res.status(400).json({ error: "invalid_password", message: "密码 6–64 字" });
  }

  const id = newUserId();
  const passwordHash = createPasswordRecord(password);
  const data = defaultUserData();

  try {
    const pool = getPool();
    await pool.execute(
      "INSERT INTO accounts (id, username, password_hash) VALUES (?, ?, ?)",
      [id, username, passwordHash]
    );
    await pool.execute(
      "INSERT INTO user_records (user_id, data) VALUES (?, ?)",
      [id, JSON.stringify(data)]
    );
    const token = signToken(id, username);
    res.status(201).json({ ok: true, token, user: { id, name: username } });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "username_taken", message: "用户名已被占用" });
    }
    console.error("register error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

router.post("/login", async (req, res) => {
  const username = validateUsername(req.body?.username);
  const password = validatePassword(req.body?.password);
  if (!username || !password) {
    return res.status(400).json({ error: "invalid_credentials", message: "用户名或密码格式不正确" });
  }

  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id, username, password_hash FROM accounts WHERE username = ? LIMIT 1",
      [username]
    );
    const row = rows[0];
    if (!row || !verifyPassword(password, row.password_hash)) {
      return res.status(401).json({ error: "invalid_credentials", message: "用户名或密码错误" });
    }
    const token = signToken(row.id, row.username);
    res.json({ ok: true, token, user: { id: row.id, name: row.username } });
  } catch (e) {
    console.error("login error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT id, username, created_at FROM accounts WHERE id = ? LIMIT 1",
      [req.auth.userId]
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "not_found" });
    res.json({
      ok: true,
      user: { id: row.id, name: row.username, createdAt: row.created_at }
    });
  } catch (e) {
    console.error("me error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

router.get("/data", authMiddleware, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute(
      "SELECT data, updated_at FROM user_records WHERE user_id = ? LIMIT 1",
      [req.auth.userId]
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "not_found" });
    let data = row.data;
    if (typeof data === "string") {
      try { data = JSON.parse(data); } catch { data = defaultUserData(); }
    }
    res.json({ ok: true, data, updatedAt: row.updated_at });
  } catch (e) {
    console.error("get data error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

router.put("/data", authMiddleware, async (req, res) => {
  const body = req.body?.data;
  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "invalid_data" });
  }

  const allowed = defaultUserData();
  const sanitized = {};
  for (const key of Object.keys(allowed)) {
    sanitized[key] = body[key] !== undefined ? body[key] : allowed[key];
  }

  try {
    const pool = getPool();
    await pool.execute(
      "UPDATE user_records SET data = ? WHERE user_id = ?",
      [JSON.stringify(sanitized), req.auth.userId]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("put data error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

module.exports = router;
