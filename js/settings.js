/* 设置 — 简繁切换 · 深浅色 · 趣味反馈 · 全页繁体 */

(function () {
  try {
    const s = JSON.parse(localStorage.getItem("ielts-settings") || "{}");
    if (s.theme) document.documentElement.setAttribute("data-theme", s.theme);
    if (s.lang) document.documentElement.lang = s.lang === "zh-TW" ? "zh-Hant" : "zh-CN";
  } catch { /* ignore */ }
})();

const Settings = {
  defaults: { lang: "zh-CN", theme: "light", meme: true },

  rootPrefix() {
    const p = location.pathname;
    if (p.includes("/static/") || p.includes("/task2/") || p.includes("/handbook/")) return "../";
    return "";
  },

  get(key) {
    try {
      const s = JSON.parse(localStorage.getItem("ielts-settings") || "{}");
      return s[key] !== undefined ? s[key] : this.defaults[key];
    } catch { return this.defaults[key]; }
  },

  set(key, val) {
    const s = JSON.parse(localStorage.getItem("ielts-settings") || "{}");
    s[key] = val;
    localStorage.setItem("ielts-settings", JSON.stringify(s));
    this.apply();
  },

  convertHtmlToTraditional(html) {
    if (typeof toTraditional !== "function") return html;
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    const walk = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = toTraditional(node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains("en") || node.dataset.s2tSkip !== undefined) return;
        node.childNodes.forEach(walk);
      }
    };
    walk(wrap);
    return wrap.innerHTML;
  },

  localizeScope(scope) {
    if (!scope) return;
    const lang = this.get("lang");
    const preserved = [];
    scope.querySelectorAll("[data-dynamic-content]").forEach((el) => {
      if (el.innerHTML) preserved.push({ id: el.id, html: el.innerHTML });
    });

    if (!scope.dataset.s2tOriginal) scope.dataset.s2tOriginal = scope.innerHTML;
    scope.innerHTML = lang === "zh-TW"
      ? this.convertHtmlToTraditional(scope.dataset.s2tOriginal)
      : scope.dataset.s2tOriginal;

    preserved.forEach(({ id, html }) => {
      const el = scope.querySelector("#" + id);
      if (el) el.innerHTML = html;
    });
  },

  apply() {
    const lang = this.get("lang");
    const theme = this.get("theme");
    document.documentElement.lang = lang === "zh-TW" ? "zh-Hant" : "zh-CN";
    document.documentElement.setAttribute("data-theme", theme);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (key === "brand") {
        el.innerHTML = `${t("brand.line1")}<br><span style="font-size:0.82rem;font-weight:400;opacity:0.8;">${t("brand.line2")}</span>`;
      } else if (el.dataset.i18nHtml !== undefined) {
        el.innerHTML = t(key);
      } else {
        el.textContent = t(key);
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    const pageTitle = document.querySelector("title[data-i18n]");
    if (pageTitle) pageTitle.textContent = t(pageTitle.dataset.i18n);

    document.querySelectorAll("[data-s2t-scope]").forEach((scope) => this.localizeScope(scope));

    const fab = document.querySelector(".quiz-fab");
    if (fab) fab.textContent = t("quiz.fab");

    const mt = document.querySelector(".mobile-toggle");
    if (mt) {
      mt.setAttribute("aria-label", t("common.menuAria"));
      mt.textContent = t("common.menuBtn");
    }

    const setBtn = document.querySelector(".settings-btn");
    if (setBtn) setBtn.textContent = t("settings.btn");
    if (setBtn) setBtn.title = t("settings.title");

    const rewardBtn = document.querySelector(".reward-btn");
    if (rewardBtn) {
      rewardBtn.textContent = t("reward.btn");
      rewardBtn.title = t("reward.title");
    }

    const feedbackBtn = document.querySelector(".feedback-btn");
    if (feedbackBtn) {
      feedbackBtn.textContent = t("feedback.btn");
      feedbackBtn.title = t("feedback.title");
    }

    const disc = document.querySelector(".page-disclaimer");
    if (disc) disc.textContent = t("disclaimer");

    document.dispatchEvent(new CustomEvent("ielts:langchange", { detail: { lang } }));
  },

  injectChrome() {
    if (!document.querySelector(".page-chrome")) {
      const wrap = document.createElement("div");
      wrap.className = "page-chrome";
      wrap.innerHTML = `
        <button type="button" class="settings-btn" title="">⚙</button>
        <button type="button" class="reward-btn" title="">赏</button>
        <button type="button" class="feedback-btn" title="">馈</button>`;
      wrap.querySelector(".settings-btn").onclick = () => this.openPanel();
      wrap.querySelector(".reward-btn").onclick = () => this.openReward();
      wrap.querySelector(".feedback-btn").onclick = () => {
        if (typeof Feedback !== "undefined") Feedback.open();
      };
      document.body.appendChild(wrap);
    }
    if (!document.querySelector(".page-disclaimer")) {
      const d = document.createElement("div");
      d.className = "page-disclaimer";
      d.dataset.i18n = "disclaimer";
      d.textContent = t("disclaimer");
      document.body.appendChild(d);
    }
    if (!document.querySelector("script[data-site-config]")) {
      const cfg = document.createElement("script");
      cfg.src = `${this.rootPrefix()}js/site-config.js`;
      cfg.dataset.siteConfig = "1";
      document.body.appendChild(cfg);
    }
    if (!document.querySelector("script[data-analytics]")) {
      const s = document.createElement("script");
      s.src = `${this.rootPrefix()}js/analytics.js`;
      s.dataset.analytics = "1";
      s.defer = true;
      document.body.appendChild(s);
    }
    if (!document.querySelector("script[data-feedback]")) {
      const fb = document.createElement("script");
      fb.src = `${this.rootPrefix()}js/feedback.js`;
      fb.dataset.feedback = "1";
      document.body.appendChild(fb);
    }
    if (!document.querySelector('link[href*="feedback.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `${this.rootPrefix()}css/feedback.css`;
      document.head.appendChild(link);
    }
  },

  openReward() {
    let panel = document.getElementById("reward-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "reward-panel";
      document.body.appendChild(panel);
    }
    const qrSrc = `${this.rootPrefix()}assets/wechat-reward.jpg`;
    const rewardLink = (typeof SiteConfig !== "undefined" && SiteConfig.rewardLink) || "";
    const inWechat = /MicroMessenger/i.test(navigator.userAgent);
    panel.innerHTML = `
      <div class="reward-backdrop"></div>
      <div class="reward-sheet">
        <button type="button" class="reward-close" aria-label="close">&times;</button>
        <h3 data-i18n="reward.title">${t("reward.title")}</h3>
        ${rewardLink ? `<a class="reward-quick-link" href="${rewardLink}" target="_blank" rel="noopener noreferrer" data-i18n="reward.quickLink">${t("reward.quickLink")}</a>` : ""}
        <p class="reward-caption reward-caption-top" data-i18n="reward.caption">${t("reward.caption")}</p>
        <img class="reward-qr" src="${qrSrc}" alt="微信收款码">
        <button type="button" class="reward-save-btn" data-i18n="reward.saveBtn">${t("reward.saveBtn")}</button>
        <ol class="reward-steps">
          <li data-i18n="reward.step1">${t("reward.step1")}</li>
          <li data-i18n="reward.step2">${t("reward.step2")}</li>
          <li data-i18n="reward.step3">${t("reward.step3")}</li>
        </ol>
        ${inWechat ? `<p class="reward-wechat-tip" data-i18n="reward.wechatTip">${t("reward.wechatTip")}</p>` : ""}
      </div>`;
    panel.classList.add("open");
    panel.querySelector(".reward-backdrop").onclick = () => this.closeReward();
    panel.querySelector(".reward-close").onclick = () => this.closeReward();
    panel.querySelector(".reward-save-btn").onclick = () => this.saveRewardQr(qrSrc);
  },

  async saveRewardQr(src) {
    const btn = document.querySelector(".reward-save-btn");
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "037-wechat-reward.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = t("reward.saved");
        setTimeout(() => { btn.textContent = orig; }, 2000);
      }
    } catch {
      window.open(src, "_blank");
    }
  },

  closeReward() {
    const panel = document.getElementById("reward-panel");
    if (panel) panel.classList.remove("open");
  },

  openPanel() {
    let panel = document.getElementById("settings-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "settings-panel";
      document.body.appendChild(panel);
    }
    const lang = this.get("lang");
    const theme = this.get("theme");
    const meme = this.get("meme");
    panel.innerHTML = `
      <div class="settings-backdrop"></div>
      <div class="settings-sheet">
        <h3>${t("settings.title")}</h3>
        <label class="settings-row">
          <span>${t("settings.lang")}</span>
          <select id="set-lang">
            <option value="zh-CN" ${lang === "zh-CN" ? "selected" : ""}>${t("settings.lang.cn")}</option>
            <option value="zh-TW" ${lang === "zh-TW" ? "selected" : ""}>${t("settings.lang.tw")}</option>
          </select>
        </label>
        <label class="settings-row">
          <span>${t("settings.theme")}</span>
          <select id="set-theme">
            <option value="light" ${theme === "light" ? "selected" : ""}>${t("settings.theme.light")}</option>
            <option value="dark" ${theme === "dark" ? "selected" : ""}>${t("settings.theme.dark")}</option>
          </select>
        </label>
        <label class="settings-row">
          <span>${t("settings.meme")}</span>
          <select id="set-meme">
            <option value="1" ${meme ? "selected" : ""}>${t("settings.meme.on")}</option>
            <option value="0" ${!meme ? "selected" : ""}>${t("settings.meme.off")}</option>
          </select>
        </label>
        <button class="settings-close-btn">${t("settings.close")}</button>
      </div>`;
    panel.classList.add("open");
    panel.querySelector(".settings-backdrop").onclick = () => this.closePanel();
    panel.querySelector(".settings-close-btn").onclick = () => this.closePanel();
    panel.querySelector("#set-lang").onchange = (e) => {
      this.set("lang", e.target.value);
      this.closePanel();
    };
    panel.querySelector("#set-theme").onchange = (e) => this.set("theme", e.target.value);
    panel.querySelector("#set-meme").onchange = (e) => this.set("meme", e.target.value === "1");
  },

  closePanel() {
    const panel = document.getElementById("settings-panel");
    if (panel) panel.classList.remove("open");
  },

  init() {
    this.injectPageTransition();
    this.injectChrome();
    this.apply();
  },

  injectPageTransition() {
    const root = this.rootPrefix();

    if (!document.querySelector('link[href*="page-transition.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `${root}css/page-transition.css`;
      link.dataset.pageTransition = "1";
      document.head.appendChild(link);
    }

    if (typeof PageTransition !== "undefined") {
      PageTransition.initEnter();
      PageTransition.initBackFix();
      return;
    }

    if (document.querySelector("script[data-page-transition]")) return;

    const script = document.createElement("script");
    script.src = `${root}js/page-transition.js`;
    script.dataset.pageTransition = "1";
    script.onload = () => {
      PageTransition.initEnter();
      PageTransition.initBackFix();
    };
    script.onerror = () => {
      document.documentElement.classList.remove("ielts-enter-boot");
      document.body.classList.remove("page-entering", "page-enter-active");
      document.querySelector(".page-enter-veil")?.remove();
    };
    document.body.appendChild(script);
  }
};

document.addEventListener("DOMContentLoaded", () => Settings.init());
