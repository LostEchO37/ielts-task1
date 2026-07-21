const { getStore, connectLambda } = require("@netlify/blobs");

exports.handler = connectLambda(async (event) => {
  const token = process.env.ADMIN_STATS_TOKEN;
  if (!token) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "ADMIN_STATS_TOKEN not configured on Netlify" })
    };
  }

  const auth = event.headers.authorization || event.headers.Authorization || "";
  const queryToken = event.queryStringParameters?.token || "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : queryToken;

  if (provided !== token) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Unauthorized" })
    };
  }

  const limit = Math.min(parseInt(event.queryStringParameters?.limit || "200", 10), 500);

  try {
    const store = getStore("site-visits");
    const index = (await store.get("visit-index", { type: "json" })) || [];
    const ids = index.slice(0, limit);
    const visits = [];
    for (const id of ids) {
      const row = await store.get(id, { type: "json" });
      if (row) visits.push(row);
    }

    const byPage = {};
    const today = new Date().toISOString().slice(0, 10);
    let todayCount = 0;
    visits.forEach((v) => {
      byPage[v.page] = (byPage[v.page] || 0) + 1;
      if (v.ts && v.ts.startsWith(today)) todayCount++;
    });

    const topPages = Object.entries(byPage)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([page, count]) => ({ page, count }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        totalStored: index.length,
        returned: visits.length,
        todayCount,
        topPages,
        visits
      })
    };
  } catch {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "storage_unavailable",
        hint: "Redeploy the site after functions update. Blobs store appears here after first visit is recorded."
      })
    };
  }
});
