/* 站点配置 — GitHub Pages / Netlify 前端 + 独立 API 后端 */

const SiteConfig = {
  /**
   * 优先走本站同源 /api/*（Netlify 服务端反代 → Vercel，大陆用户浏览器不直连 Vercel）。
   * 留空 apiBase 且 sameOriginApi=true 时，请求发往当前域名下的 /api/…
   */
  sameOriginApi: true,

  /** 显式 API 根地址（非空时优先于同源，一般留空即可） */
  apiBase: "",

  /**
   * 备用 API（按顺序尝试）。可在 Zeabur 香港/新加坡再部署一份 server/ 后填入。
   * 例: "https://ielts-api-xxx.zeabur.app"
   */
  apiMirrors: ["https://ielts-task1.vercel.app"],

  API_BASE_CACHE_KEY: "ielts-api-base-cache",

  /** 可选：爱发电/赞赏外链 */
  rewardLink: "",

  apiEnabled() {
    return !!(this.sameOriginApi || (this.apiBase || "").trim() || (this.apiMirrors || []).length);
  },

  allApiBases() {
    const bases = [];
    const add = (b) => {
      const norm = b === "" ? "" : String(b).replace(/\/$/, "");
      if (!bases.includes(norm)) bases.push(norm);
    };

    try {
      const cached = localStorage.getItem(this.API_BASE_CACHE_KEY);
      if (cached !== null) add(cached === "__same__" ? "" : cached);
    } catch { /* ignore */ }

    if ((this.apiBase || "").trim()) add(this.apiBase);
    else if (this.sameOriginApi) add("");

    (this.apiMirrors || []).forEach(add);
    return bases;
  },

  cacheApiBase(base) {
    try {
      localStorage.setItem(this.API_BASE_CACHE_KEY, base === "" ? "__same__" : base);
    } catch { /* ignore */ }
  },

  clearApiBaseCache() {
    try { localStorage.removeItem(this.API_BASE_CACHE_KEY); } catch { /* ignore */ }
  },

  apiUrl(path, base) {
    const p = path.startsWith("/") ? path : `/${path}`;
    const b = base !== undefined ? base : (this.allApiBases()[0] ?? "");
    if (!b) return p;
    return `${b}${p}`;
  }
};
