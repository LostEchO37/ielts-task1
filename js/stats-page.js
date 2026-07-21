/* 访问统计管理页 */

(function () {
  const TOKEN_KEY = "ielts-stats-token";
  const tokenInput = document.getElementById("stats-token");
  const errEl = document.getElementById("stats-err");
  const bodyEl = document.getElementById("stats-body");

  const saved = sessionStorage.getItem(TOKEN_KEY);
  if (saved) tokenInput.value = saved;

  function showErr(msg) {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
    bodyEl.classList.add("hidden");
  }

  function uaShort(ua) {
    if (!ua) return "—";
    if (/iPhone|iPad/i.test(ua)) return "iOS";
    if (/Android/i.test(ua)) return "Android";
    if (/Mac OS X/i.test(ua)) return "Mac";
    if (/Windows/i.test(ua)) return "Windows";
    return ua.slice(0, 40);
  }

  async function load() {
    const token = tokenInput.value.trim();
    if (!token) {
      showErr("请输入管理口令");
      return;
    }
    errEl.classList.add("hidden");
    try {
      const res = await fetch("/api/stats?limit=200", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        showErr(data.hint || data.error || `加载失败 (${res.status})`);
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, token);
      bodyEl.classList.remove("hidden");
      document.getElementById("kpi-total").textContent = data.totalStored;
      document.getElementById("kpi-today").textContent = data.todayCount;
      document.getElementById("kpi-shown").textContent = data.returned;

      const topTb = document.querySelector("#top-pages tbody");
      topTb.innerHTML = data.topPages.map((r) =>
        `<tr><td>${r.page}</td><td>${r.count}</td></tr>`
      ).join("") || `<tr><td colspan="2">暂无数据</td></tr>`;

      const logTb = document.querySelector("#visit-log tbody");
      logTb.innerHTML = data.visits.map((v) => {
        const t = v.ts ? v.ts.replace("T", " ").slice(0, 19) : "—";
        const ref = v.referrer ? v.referrer.replace(/^https?:\/\//, "").slice(0, 48) : "直接访问";
        return `<tr><td>${t}</td><td>${v.page}</td><td>${ref}</td><td>${uaShort(v.ua)}</td></tr>`;
      }).join("") || `<tr><td colspan="4">暂无记录</td></tr>`;
    } catch {
      showErr("存储未就绪 (storage_unavailable)。请在 Netlify 开启 Blobs 并配置 NETLIFY_BLOB_READ_WRITE_TOKEN，然后重新部署。");
    }
  }

  document.getElementById("stats-load").onclick = load;
  tokenInput.addEventListener("keydown", (e) => { if (e.key === "Enter") load(); });
  if (saved) load();
})();
