const express = require("express");
const { getPool } = require("../db");

const router = express.Router();

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

router.get("/", requireAuth, async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "200", 10), 500);

  try {
    const pool = getPool();

    const [[{ totalStored }]] = await pool.query("SELECT COUNT(*) AS totalStored FROM visits");

    const [rows] = await pool.query(
      `SELECT id, ts, event_type, page, referrer, ua, lang, user_name AS user, session_id, vw, vh, module, extra
       FROM visits ORDER BY ts DESC LIMIT ?`,
      [limit]
    );

    const visits = rows.map((r) => ({
      id: r.id,
      ts: r.ts instanceof Date ? r.ts.toISOString() : r.ts,
      event: r.event_type,
      page: r.page,
      referrer: r.referrer,
      ua: r.ua,
      lang: r.lang,
      user: r.user_name,
      session: r.session_id,
      vw: r.vw,
      vh: r.vh,
      module: r.module,
      extra: r.extra ? (typeof r.extra === "string" ? JSON.parse(r.extra) : r.extra) : null
    }));

    const today = new Date().toISOString().slice(0, 10);
    let todayCount = 0;
    const byPage = {};
    const byEvent = {};
    const byUser = {};

    visits.forEach((v) => {
      byPage[v.page] = (byPage[v.page] || 0) + 1;
      byEvent[v.event || "pageview"] = (byEvent[v.event || "pageview"] || 0) + 1;
      if (v.user) byUser[v.user] = (byUser[v.user] || 0) + 1;
      if (v.ts && v.ts.startsWith(today)) todayCount++;
    });

    const topPages = Object.entries(byPage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([page, count]) => ({ page, count }));

    const eventCounts = Object.entries(byEvent)
      .sort((a, b) => b[1] - a[1])
      .map(([event, count]) => ({ event, count }));

    const topUsers = Object.entries(byUser)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([user, count]) => ({ user, count }));

    res.json({
      totalStored,
      returned: visits.length,
      todayCount,
      topPages,
      eventCounts,
      topUsers,
      visits
    });
  } catch (e) {
    console.error("stats error", e.message);
    res.status(503).json({ error: "storage_unavailable", hint: e.message });
  }
});

module.exports = router;
