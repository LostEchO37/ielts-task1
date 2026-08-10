/* 站点配置 — GitHub Pages / Netlify 前端 + 独立 API 后端 */

const SiteConfig = {
  /**
   * Netlify 部署时优先走同源 /api/*（服务端反代 → Vercel，大陆用户不直连 vercel.app）。
   * GitHub Pages 纯静态，不支持 POST /api/*，运行时自动跳过同源。
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

  supportsSameOriginApi() {
    if (typeof location === "undefined") return false;
    const h = location.hostname.toLowerCase();
    return h.endsWith(".netlify.app") || h === "netlify.app";
  },

  shouldFailoverStatus(status) {
    return status === 404 || status === 405 || status === 408 || status === 429
      || status === 502 || status === 503 || status === 504 || status >= 500;
  },

  apiEnabled() {
    return !!(this.sameOriginApi || (this.apiBase || "").trim() || (this.apiMirrors || []).length);
  },

  allApiBases() {
    const bases = [];
    const add = (b) => {
      const norm = b === "" ? "" : String(b).replace(/\/$/, "");
      if (!bases.includes(norm)) bases.push(norm);
    };

    const canSameOrigin = this.sameOriginApi && this.supportsSameOriginApi();

    try {
      const cached = localStorage.getItem(this.API_BASE_CACHE_KEY);
      if (cached !== null) {
        const cachedBase = cached === "__same__" ? "" : cached;
        if (cachedBase === "" && !canSameOrigin) {
          this.clearApiBaseCache();
        } else {
          add(cachedBase);
        }
      }
    } catch { /* ignore */ }

    if (canSameOrigin) {
      if ((this.apiBase || "").trim()) add(this.apiBase);
      else add("");
      (this.apiMirrors || []).forEach(add);
    } else {
      if ((this.apiBase || "").trim()) add(this.apiBase);
      (this.apiMirrors || []).forEach(add);
    }

    return bases;
  },

  cacheApiBase(base) {
    if (base === "" && !this.supportsSameOriginApi()) return;
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
