const express = require("express");
const { getPool } = require("../db");

const router = express.Router();

function newId() {
  return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function requireAuth(req, res, next) {
  const token = process.env.ADMIN_STATS_TOKEN;
  if (!token) {
    return res.status(503).json({ error: "ADMIN_STATS_TOKEN not configured" });
  }
  const auth = req.headers.authorization || "";
  const queryToken = req.query.token || "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : queryToken;
  if (provided !== token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

function clampRating(n) {
  const r = Math.round(Number(n) || 0);
  return Math.min(5, Math.max(0, r));
}

router.get("/wall", async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT id, created_at, display_name, user_name, rating, content, featured_at
       FROM feedback
       WHERE status = 'featured'
       ORDER BY featured_at DESC, created_at DESC
       LIMIT 30`
    );
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        at: r.featured_at || r.created_at,
        name: r.display_name || r.user_name || "",
        rating: r.rating,
        content: r.content
      }))
    });
  } catch (e) {
    console.error("feedback wall error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  const content = String(body.content || "").trim();
  if (content.length < 4) {
    return res.status(400).json({ error: "content_too_short", message: "请至少写 4 个字" });
  }
  if (content.length > 500) {
    return res.status(400).json({ error: "content_too_long", message: "最多 500 字" });
  }

  const sessionId = String(body.session || "").slice(0, 64);
  const userName = String(body.user || "").slice(0, 32);
  const displayName = String(body.displayName || body.display_name || userName || "").slice(0, 32);
  const rating = clampRating(body.rating);
  const allowWall = !!body.allowWall;

  try {
    const pool = getPool();

    if (sessionId) {
      const [recent] = await pool.query(
        `SELECT COUNT(*) AS c FROM feedback
         WHERE session_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
        [sessionId]
      );
      if (recent[0].c >= 2) {
        return res.status(429).json({ error: "rate_limited", message: "提交太频繁，请稍后再试" });
      }
    }

    const id = newId();
    await pool.execute(
      `INSERT INTO feedback (id, user_name, display_name, rating, content, status, session_id)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [id, userName, allowWall ? displayName : "", rating, content, sessionId]
    );

    res.json({ ok: true, id });
  } catch (e) {
    console.error("feedback submit error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

router.get("/admin", requireAuth, async (req, res) => {
  const status = String(req.query.status || "pending").slice(0, 16);
  const limit = Math.min(parseInt(req.query.limit || "100", 10), 200);
  const allowed = ["pending", "featured", "hidden", "all"];
  const filterStatus = allowed.includes(status) ? status : "pending";

  try {
    const pool = getPool();
    const where = filterStatus === "all" ? "" : "WHERE status = ?";
    const params = filterStatus === "all" ? [limit] : [filterStatus, limit];
    const [rows] = await pool.query(
      `SELECT id, created_at, user_name, display_name, rating, content, status, featured_at, session_id
       FROM feedback ${where}
       ORDER BY created_at DESC
       LIMIT ?`,
      params
    );

    res.json({
      items: rows.map((r) => ({
        id: r.id,
        at: r.created_at,
        user: r.user_name,
        displayName: r.display_name,
        rating: r.rating,
        content: r.content,
        status: r.status,
        featuredAt: r.featured_at,
        session: r.session_id
      }))
    });
  } catch (e) {
    console.error("feedback admin error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = String(req.params.id || "").slice(0, 64);
  const body = req.body || {};
  const status = String(body.status || "").slice(0, 16);
  const allowed = ["pending", "featured", "hidden"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: "invalid_status" });
  }

  const displayName = body.displayName !== undefined
    ? String(body.displayName || "").slice(0, 32)
    : undefined;

  try {
    const pool = getPool();
    const featuredAt = status === "featured" ? new Date() : null;
    const sets = ["status = ?", "featured_at = ?"];
    const params = [status, featuredAt];

    if (displayName !== undefined) {
      sets.push("display_name = ?");
      params.push(displayName);
    }
    params.push(id);

    const [result] = await pool.execute(
      `UPDATE feedback SET ${sets.join(", ")} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "not_found" });
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("feedback patch error", e.message);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

module.exports = router;
