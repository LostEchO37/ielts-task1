/* 访问统计管理页 */

(function () {
  const TOKEN_KEY = "ielts-stats-token";
  const tokenInput = document.getElementById("stats-token");
  const errEl = document.getElementById("stats-err");
  const bodyEl = document.getElementById("stats-body");

  const saved = sessionStorage.getItem(TOKEN_KEY);
  if (saved) tokenInput.value = saved;

  function apiUrl(path) {
    if (typeof SiteConfig !== "undefined" && SiteConfig.apiUrl) {
      return SiteConfig.apiUrl(path);
    }
    return path;
  }

  function showErr(msg) {
    errEl.textContent = msg;
    errEl.classList.remove("hidden");
    bodyEl.classList.add("hidden");
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
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
    if (typeof SiteConfig !== "undefined" && !SiteConfig.apiBase) {
      showErr("请先在 js/site-config.js 中配置 apiBase（Render API 地址）");
      return;
    }
    errEl.classList.add("hidden");
    try {
      const res = await fetch(apiUrl("/api/stats?limit=200"), {
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
        `<tr><td>${esc(r.page)}</td><td>${r.count}</td></tr>`
      ).join("") || `<tr><td colspan="2">暂无数据</td></tr>`;

      const evTb = document.querySelector("#event-counts tbody");
      if (evTb && data.eventCounts) {
        evTb.innerHTML = data.eventCounts.map((r) =>
          `<tr><td>${esc(r.event)}</td><td>${r.count}</td></tr>`
        ).join("") || `<tr><td colspan="2">暂无</td></tr>`;
      }

      const userTb = document.querySelector("#top-users tbody");
      if (userTb && data.topUsers) {
        userTb.innerHTML = data.topUsers.map((r) =>
          `<tr><td>${esc(r.user)}</td><td>${r.count}</td></tr>`
        ).join("") || `<tr><td colspan="2">暂无</td></tr>`;
      }

      const logTb = document.querySelector("#visit-log tbody");
      logTb.innerHTML = data.visits.map((v) => {
        const t = v.ts ? v.ts.replace("T", " ").slice(0, 19) : "—";
        const ref = v.referrer ? v.referrer.replace(/^https?:\/\//, "").slice(0, 48) : "直接访问";
        const user = v.user ? esc(v.user) : "未登录";
        const ev = v.event ? esc(v.event) : "pageview";
        return `<tr><td>${t}</td><td>${ev}</td><td>${esc(v.page)}</td><td>${esc(ref)}</td><td>${uaShort(v.ua)}</td><td>${user}</td></tr>`;
      }).join("") || `<tr><td colspan="6">暂无记录</td></tr>`;
    } catch {
      showErr("无法连接 API。请确认 Render 服务已启动、MySQL 已配置，且 site-config.js 中 apiBase 正确。");
    }
  }

  document.getElementById("stats-load").onclick = load;
  tokenInput.addEventListener("keydown", (e) => { if (e.key === "Enter") load(); });
  if (saved) load();
})();
