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

    const disc = document.querySelector(".page-disclaimer");
    if (disc) disc.textContent = t("disclaimer");

    document.dispatchEvent(new CustomEvent("ielts:langchange", { detail: { lang } }));
  },

  injectChrome() {
    if (!document.querySelector(".settings-btn")) {
      const btn = document.createElement("button");
      btn.className = "settings-btn";
      btn.type = "button";
      btn.onclick = () => this.openPanel();
      document.body.appendChild(btn);
    }
    if (!document.querySelector(".page-disclaimer")) {
      const d = document.createElement("div");
      d.className = "page-disclaimer";
      d.dataset.i18n = "disclaimer";
      d.textContent = t("disclaimer");
      document.body.appendChild(d);
    }
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
    this.injectChrome();
    this.apply();
  }
};

document.addEventListener("DOMContentLoaded", () => Settings.init());
