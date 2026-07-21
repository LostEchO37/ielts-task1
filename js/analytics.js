/* 访问统计 — 上报至 Netlify Function（本地开发时静默失败） */

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

  track() {
    const payload = {
      page: location.pathname + location.search,
      referrer: document.referrer || "",
      lang: navigator.language || "",
      vw: window.innerWidth,
      vh: window.innerHeight,
      session: this.sessionId()
    };
    const url = "/api/track";
    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(url, blob)) return;
      }
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(() => {});
    } catch { /* ignore */ }
  },

  init() {
    if (location.pathname.endsWith("stats.html")) return;
    if (document.visibilityState === "prerender") return;
    if (document.readyState === "complete") this.track();
    else window.addEventListener("load", () => this.track(), { once: true });
  }
};

SiteAnalytics.init();
