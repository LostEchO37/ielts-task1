const express = require("express");
const { getPool } = require("../db");

const router = express.Router();

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

router.post("/", async (req, res) => {
  const body = req.body || {};
  const id = newId();
  const record = {
    id,
    event_type: String(body.event || body.event_type || "pageview").slice(0, 32),
    page: String(body.page || "/").slice(0, 220),
    referrer: String(body.referrer || "").slice(0, 320),
    ua: String(req.headers["user-agent"] || "").slice(0, 180),
    lang: String(body.lang || "").slice(0, 32),
    user_name: String(body.user || "").slice(0, 32),
    session_id: String(body.session || "").slice(0, 64),
    vw: Math.min(Number(body.vw) || 0, 65535),
    vh: Math.min(Number(body.vh) || 0, 65535),
    module: String(body.module || "").slice(0, 24),
    extra: body.extra && typeof body.extra === "object" ? JSON.stringify(body.extra) : null
  };

  try {
    const pool = getPool();
    await pool.execute(
      `INSERT INTO visits (id, event_type, page, referrer, ua, lang, user_name, session_id, vw, vh, module, extra)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        record.id,
        record.event_type,
        record.page,
        record.referrer,
        record.ua,
        record.lang,
        record.user_name,
        record.session_id,
        record.vw,
        record.vh,
        record.module,
        record.extra
      ]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("track error", e.message);
    res.status(503).json({ ok: false, error: "storage_unavailable" });
  }
});

module.exports = router;
