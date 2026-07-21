/* 用户界面 — 注册弹窗 · 侧边栏 · 导航注入 */

const UserUI = {
  rootPrefix() {
    return location.pathname.includes("/static/") ? "../" : "";
  },

  injectSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const nav = document.querySelector(".sidebar nav");
    if (!sidebar || sidebar.querySelector(".sidebar-user")) return;

    const root = this.rootPrefix();
    const userBar = document.createElement("div");
    userBar.className = "sidebar-user";
    userBar.innerHTML = `<span class="sidebar-user-label" data-i18n="user.greeting">你好，</span><strong id="sidebar-username">—</strong>`;
    sidebar.insertBefore(userBar, nav);

    if (nav && !nav.querySelector("[data-nav-profile]")) {
      const block = document.createElement("div");
      block.innerHTML = `
        <div class="nav-section" data-i18n="nav.my">我的</div>
        <a class="nav-link" href="${root}profile.html" data-nav-profile data-i18n="nav.profile">勋章墙</a>
        <a class="nav-link" href="${root}wrongbook.html" data-i18n="nav.wrongbook">错题本 <span class="nav-badge wrong-count hidden" id="nav-wrong-count">0</span></a>`;
      nav.appendChild(block);
    }

    this.refreshSidebar();
  },

  refreshSidebar() {
    const nameEl = document.getElementById("sidebar-username");
    const badge = document.getElementById("nav-wrong-count");
    const u = UserStore.current();
    if (nameEl) nameEl.textContent = u ? u.name : "—";
    if (badge) {
      const n = UserStore.wrongCount();
      badge.textContent = n;
      badge.classList.toggle("hidden", !n);
    }
    if (typeof Settings !== "undefined") Settings.apply();
  },

  showOnboarding(onDone) {
    let modal = document.getElementById("user-onboard");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "user-onboard";
      document.body.appendChild(modal);
    }
    modal.className = "user-onboard open";
    modal.innerHTML = `
      <div class="user-onboard-backdrop"></div>
      <div class="user-onboard-sheet">
        <div class="user-onboard-emoji">🎓</div>
        <h2 data-i18n="user.welcome">欢迎来到雅思作文教程</h2>
        <p class="user-onboard-sub" data-i18n="user.welcomeSub">先给自己取个昵称，记录练习进度和勋章</p>
        <label class="user-onboard-label" data-i18n="user.nickname">昵称</label>
        <input type="text" class="user-onboard-input" maxlength="16" placeholder="" autocomplete="off" data-i18n-placeholder="user.nicknamePh">
        <p class="user-onboard-hint" data-i18n="user.noRealName">⚠️ 请勿使用真实姓名</p>
        <p class="user-onboard-error hidden"></p>
        <button type="button" class="user-onboard-btn" data-i18n="user.create">创建用户，开始学习</button>
      </div>`;

    Settings.apply();

    const input = modal.querySelector(".user-onboard-input");
    const err = modal.querySelector(".user-onboard-error");
    const submit = () => {
      const res = UserStore.create(input.value);
      if (!res.ok) {
        err.textContent = t("user.invalid");
        err.classList.remove("hidden");
        return;
      }
      modal.classList.remove("open");
      this.refreshSidebar();
      if (typeof SiteAnalytics !== "undefined") SiteAnalytics.track();
      if (onDone) onDone(res.user);
    };

    modal.querySelector(".user-onboard-btn").onclick = submit;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    input.focus();
  },

  requireUser(onReady) {
    if (UserStore.current()) {
      if (onReady) onReady();
      return true;
    }
    this.showOnboarding(onReady);
    return false;
  },

  badgeCardHtml(fullId, earned, onWall) {
    const meta = UserStore.getBadgeMeta(fullId);
    if (!meta) {
      return `<div class="badge-card locked" data-badge="${fullId}"><div class="badge-name">${fullId}</div></div>`;
    }
    const title = UserStore.getBadgeTitle(fullId);
    const desc = UserStore.getBadgeDesc(fullId);
    const cls = ["badge-card", earned ? "earned" : "locked", onWall ? "on-wall" : ""].filter(Boolean).join(" ");
    return `
      <div class="${cls}" data-badge="${fullId}" title="${desc}">
        <div class="badge-icon" style="--badge-color:${meta.color}">${meta.icon}</div>
        <div class="badge-name">${title}</div>
        ${earned
          ? `<div class="badge-wall-toggle">${onWall ? t("badge.onWall") : t("badge.offWall")}</div>`
          : `<div class="badge-lock">${t("badge.locked")}</div>`}
      </div>`;
  },

  init() {
    this.injectSidebar();
    if (typeof Settings !== "undefined") Settings.apply();
  }
};

document.addEventListener("DOMContentLoaded", () => {
  UserUI.init();
});

document.addEventListener("ielts:langchange", () => {
  if (typeof renderProfile === "function") renderProfile();
  if (typeof renderWrongbook === "function") renderWrongbook();
});
