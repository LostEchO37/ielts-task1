/* 评价反馈 — 展示墙 + 提交（需 apiBase） */

const Feedback = {
  sessionKey: "ielts-feedback-session",

  rootPrefix() {
    if (typeof Settings !== "undefined" && Settings.rootPrefix) {
      return Settings.rootPrefix();
    }
    const p = location.pathname;
    if (p.includes("/static/") || p.includes("/task2/") || p.includes("/handbook/")) return "../";
    return "";
  },

  apiEnabled() {
    return !!(typeof SiteConfig !== "undefined" && SiteConfig.apiEnabled?.());
  },

  apiUrl(path) {
    if (typeof SiteConfig !== "undefined" && SiteConfig.apiUrl) {
      return SiteConfig.apiUrl(path);
    }
    const p = path.startsWith("/") ? path : `/${path}`;
    return p;
  },

  sessionId() {
    let id = sessionStorage.getItem(this.sessionKey);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(this.sessionKey, id);
    }
    return id;
  },

  userName() {
    try {
      if (typeof UserStore !== "undefined" && UserStore.current()) {
        return UserStore.current().name || "";
      }
    } catch { /* ignore */ }
    return "";
  },

  starsHtml(rating, interactive = false) {
    const r = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
    if (!interactive) {
      return `<span class="feedback-stars" aria-label="${r} 星">${"★".repeat(r)}${"☆".repeat(5 - r)}</span>`;
    }
    return `<span class="feedback-stars feedback-stars-input" role="radiogroup" aria-label="评分">
      ${[1, 2, 3, 4, 5].map((n) =>
        `<button type="button" class="feedback-star-btn${n <= r ? " active" : ""}" data-star="${n}" aria-label="${n} 星">★</button>`
      ).join("")}
    </span>`;
  },

  cardHtml(item) {
    const name = item.name || t("feedback.anonymous");
    const content = String(item.content || "").replace(/</g, "&lt;");
    return `<article class="feedback-card">
      ${this.starsHtml(item.rating)}
      <p class="feedback-card-text">${content}</p>
      <footer class="feedback-card-meta">— ${name.replace(/</g, "&lt;")}</footer>
    </article>`;
  },

  async apiFetch(path, options = {}) {
    const bases = typeof SiteConfig.allApiBases === "function"
      ? SiteConfig.allApiBases()
      : [((SiteConfig.apiBase || "").replace(/\/$/, "") || "")];
    let lastRes = null;
    for (let i = 0; i < bases.length; i++) {
      const base = bases[i];
      try {
        const res = await fetch(SiteConfig.apiUrl(path, base), options);
        if (res.ok) {
          if (typeof SiteConfig.cacheApiBase === "function") SiteConfig.cacheApiBase(base);
          return res;
        }
        const failover = typeof SiteConfig.shouldFailoverStatus === "function"
          ? SiteConfig.shouldFailoverStatus(res.status)
          : (res.status >= 500);
        if (!failover || i === bases.length - 1) return res;
        lastRes = res;
      } catch (e) {
        if (i === bases.length - 1) throw e;
      }
    }
    if (lastRes) return lastRes;
    throw new Error("request failed");
  },

  async loadWall() {
    if (this.apiEnabled()) {
      try {
        const res = await this.apiFetch("/api/feedback/wall");
        if (res.ok) {
          const data = await res.json();
          const items = (data.items || []).map((x) => ({
            name: x.name,
            rating: x.rating,
            content: x.content
          }));
          return { items, offline: false };
        }
      } catch { /* fallback below */ }
    }
    try {
      const res = await fetch(`${this.rootPrefix()}js/feedback-wall.json`);
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items) && items.length) {
          return { items, offline: true };
        }
      }
    } catch { /* ignore */ }
    return { items: [], offline: false };
  },

  renderWall(container, result) {
    const items = result?.items || result || [];
    const offline = result?.offline;
    if (!items.length) {
      const msg = offline ? t("feedback.wallOffline") : t("feedback.wallEmpty");
      container.innerHTML = `<p class="feedback-wall-empty" data-i18n="${offline ? "feedback.wallOffline" : "feedback.wallEmpty"}">${msg}</p>`;
      return;
    }
    container.innerHTML = items.map((item) => this.cardHtml(item)).join("");
  },

  bindStarInput(panel, setRating) {
    panel.querySelectorAll(".feedback-star-btn").forEach((btn) => {
      btn.onclick = () => {
        const n = parseInt(btn.dataset.star, 10);
        setRating(n);
        panel.querySelectorAll(".feedback-star-btn").forEach((b) => {
          b.classList.toggle("active", parseInt(b.dataset.star, 10) <= n);
        });
      };
    });
  },

  async open() {
    let panel = document.getElementById("feedback-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "feedback-panel";
      document.body.appendChild(panel);
    }

    let rating = 5;
    const wall = await this.loadWall();
    const canSubmit = this.apiEnabled();
    const user = this.userName();

    panel.innerHTML = `
      <div class="feedback-backdrop"></div>
      <div class="feedback-sheet">
        <button type="button" class="feedback-close" aria-label="close">&times;</button>
        <h3 data-i18n="feedback.title">${t("feedback.title")}</h3>
        <section class="feedback-section">
          <h4 data-i18n="feedback.wallTitle">${t("feedback.wallTitle")}</h4>
          <div class="feedback-wall" id="feedback-wall-list"></div>
        </section>
        <section class="feedback-section">
          <h4 data-i18n="feedback.formTitle">${t("feedback.formTitle")}</h4>
          ${canSubmit
            ? `<form class="feedback-form" id="feedback-form">
                <label class="feedback-label" data-i18n="feedback.ratingLabel">${t("feedback.ratingLabel")}</label>
                ${this.starsHtml(rating, true)}
                <label class="feedback-label" for="feedback-content" data-i18n="feedback.contentLabel">${t("feedback.contentLabel")}</label>
                <textarea id="feedback-content" maxlength="500" rows="4" placeholder="${t("feedback.contentPh")}"></textarea>
                <label class="feedback-check">
                  <input type="checkbox" id="feedback-allow-wall" checked>
                  <span data-i18n="feedback.allowWall">${t("feedback.allowWall")}</span>
                </label>
                ${user
                  ? `<p class="feedback-name-hint">${t("feedback.nameHint")} <strong>${user.replace(/</g, "&lt;")}</strong></p>`
                  : `<label class="feedback-label" for="feedback-nickname" data-i18n="feedback.nicknameLabel">${t("feedback.nicknameLabel")}</label>
                     <input type="text" id="feedback-nickname" maxlength="16" placeholder="${t("feedback.nicknamePh")}">`}
                <button type="submit" class="feedback-submit" data-i18n="feedback.submit">${t("feedback.submit")}</button>
                <p class="feedback-msg hidden" id="feedback-msg"></p>
              </form>`
            : `<p class="feedback-offline" data-i18n="feedback.offline">${t("feedback.offline")}</p>`}
        </section>
      </div>`;

    panel.classList.add("open");
    this.renderWall(panel.querySelector("#feedback-wall-list"), wall);

    panel.querySelector(".feedback-backdrop").onclick = () => this.close();
    panel.querySelector(".feedback-close").onclick = () => this.close();

    if (canSubmit) {
      this.bindStarInput(panel, (n) => { rating = n; });
      const form = panel.querySelector("#feedback-form");
      const msg = panel.querySelector("#feedback-msg");
      form.onsubmit = async (e) => {
        e.preventDefault();
        const content = panel.querySelector("#feedback-content").value.trim();
        const allowWall = panel.querySelector("#feedback-allow-wall").checked;
        const nicknameEl = panel.querySelector("#feedback-nickname");
        const displayName = user || (nicknameEl ? nicknameEl.value.trim() : "");
        msg.classList.add("hidden");
        try {
          const res = await this.apiFetch("/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content,
              rating,
              user: user,
              displayName: allowWall ? (displayName || t("feedback.anonymous")) : "",
              allowWall,
              session: this.sessionId()
            })
          });
          const body = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(body.message || body.error || `HTTP ${res.status}`);
          msg.textContent = t("feedback.thanks");
          msg.className = "feedback-msg feedback-msg-ok";
          form.querySelector("textarea").value = "";
        } catch (err) {
          msg.textContent = err.message || t("feedback.fail");
          msg.className = "feedback-msg feedback-msg-err";
        }
      };
    }

    if (typeof Settings !== "undefined") Settings.apply();
  },

  close() {
    const panel = document.getElementById("feedback-panel");
    if (panel) panel.classList.remove("open");
  },

  attachButton() {
    const btn = document.querySelector(".feedback-btn");
    if (btn && !btn.dataset.bound) {
      btn.dataset.bound = "1";
      btn.onclick = () => this.open();
    }
  }
};

document.addEventListener("DOMContentLoaded", () => Feedback.attachButton());
