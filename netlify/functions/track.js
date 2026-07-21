const { getStore } = require("@netlify/blobs");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const MAX_VISITS = 5000;

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: "Method Not Allowed" };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: CORS, body: "Invalid JSON" };
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const record = {
    id,
    ts: new Date().toISOString(),
    page: String(body.page || "/").slice(0, 200),
    referrer: String(body.referrer || "").slice(0, 300),
    ua: (event.headers["user-agent"] || event.headers["User-Agent"] || "").slice(0, 160),
    lang: String(body.lang || "").slice(0, 32),
    vw: Number(body.vw) || 0,
    vh: Number(body.vh) || 0
  };

  try {
    const store = getStore("site-visits");
    await store.setJSON(id, record);
    const index = (await store.get("visit-index", { type: "json" })) || [];
    index.unshift(id);
    if (index.length > MAX_VISITS) index.length = MAX_VISITS;
    await store.setJSON("visit-index", index);
  } catch (err) {
    return {
      statusCode: 503,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: false, error: "storage_unavailable" })
    };
  }

  return {
    statusCode: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true })
  };
};
