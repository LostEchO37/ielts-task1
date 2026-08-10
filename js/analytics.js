/* 访问统计 — 上报至 MySQL API（GitHub Pages + Render 等） */

const SiteAnalytics = {
  sessionKey: "ielts-analytics-session",

  sessionId() {
    let id = sessionStorage.getItem(this.sessionKey);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(this.sessionKey, id);
    }
    return id;
  },

  currentUserName() {
    try {
      if (typeof UserStore !== "undefined" && UserStore.current()) {
        return UserStore.current().name || "";
      }
      const data = JSON.parse(localStorage.getItem("ielts-users-v1") || "{}");
      const id = data.currentUserId;
      if (id && data.users && data.users[id]) return data.users[id].name || "";
    } catch { /* ignore */ }
    return "";
  },

  detectModule() {
    const p = location.pathname;
    if (p.includes("/static/")) return "static";
    return "dynamic";
  },

  apiUrl(path) {
    if (typeof SiteConfig !== "undefined" && SiteConfig.apiUrl) {
      return SiteConfig.apiUrl(path);
    }
    return path.startsWith("/") ? path : `/${path}`;
  },

  send(payload) {
    if (typeof SiteConfig === "undefined" || !SiteConfig.apiEnabled?.()) return;
    const url = this.apiUrl("/api/track");
    const body = JSON.stringify(payload);
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      mode: "cors"
    }).catch(() => {});
  },

  trackEvent(eventType, extra) {
    this.send({
      event: eventType,
      page: location.pathname + location.search,
      referrer: document.referrer || "",
      lang: navigator.language || "",
      vw: window.innerWidth,
      vh: window.innerHeight,
      session: this.sessionId(),
      user: this.currentUserName(),
      module: this.detectModule(),
      extra: extra || null
    });
  },

  track() {
    this.trackEvent("pageview");
  },

  init() {
    if (location.pathname.endsWith("stats.html")) return;
    if (location.pathname.endsWith("feedback-admin.html")) return;
    if (document.visibilityState === "prerender") return;
    if (typeof SiteConfig === "undefined" || !SiteConfig.apiEnabled?.()) return;
    const run = () => this.track();
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
  }
};

function bootSiteAnalytics() {
  if (typeof SiteConfig !== "undefined" && SiteConfig.apiEnabled?.()) {
    SiteAnalytics.init();
    return;
  }
  window.addEventListener("load", () => {
    if (typeof SiteConfig !== "undefined" && SiteConfig.apiEnabled?.()) {
      SiteAnalytics.init();
    }
  }, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootSiteAnalytics);
} else {
  bootSiteAnalytics();
}
