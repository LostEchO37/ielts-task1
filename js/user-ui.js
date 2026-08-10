/* 用户界面 — 登录/注册弹窗 · 侧边栏 · 导航注入 */

const UserUI = {
  rootPrefix() {
    const p = location.pathname;
    if (p.includes("/static/") || p.includes("/task2/") || p.includes("/handbook/")) return "../";
    return "";
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

  errorText(code, fallback) {
    const map = {
      invalid_username: t("auth.errUsername"),
      invalid_password: t("auth.errPassword"),
      username_taken: t("auth.errTaken"),
      invalid_credentials: t("auth.errCredentials"),
      user_not_found: t("auth.errNotFound"),
      register_failed: t("auth.errServer"),
      login_failed: t("auth.errServer"),
      request_failed: t("auth.errServer"),
      request_timeout: t("auth.errTimeout"),
      storage_unavailable: t("auth.errStorage")
    };
    return map[code] || fallback || t("auth.errServer");
  },

  showAuth(mode = "login", onDone) {
    let modal = document.getElementById("user-onboard");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "user-onboard";
      document.body.appendChild(modal);
    }

    const cloud = UserAuth.cloudEnabled();
    modal.className = "user-onboard open";
    modal.innerHTML = `
      <div class="user-onboard-backdrop"></div>
      <div class="user-onboard-sheet">
        <div class="user-onboard-emoji">${cloud ? "🔐" : "🎓"}</div>
        <h2 data-i18n="${cloud ? "auth.title" : "user.welcome"}">${cloud ? t("auth.title") : t("user.welcome")}</h2>
        <p class="user-onboard-sub" data-i18n="${cloud ? "auth.sub" : "user.welcomeSub"}">${cloud ? t("auth.sub") : t("user.welcomeSub")}</p>
        ${cloud ? `
        <div class="auth-tabs">
          <button type="button" class="auth-tab ${mode === "login" ? "active" : ""}" data-mode="login" data-i18n="auth.login">登录</button>
          <button type="button" class="auth-tab ${mode === "register" ? "active" : ""}" data-mode="register" data-i18n="auth.register">注册</button>
        </div>` : ""}
        <label class="user-onboard-label" data-i18n="${cloud ? "auth.username" : "user.nickname"}">${cloud ? t("auth.username") : t("user.nickname")}</label>
        <input type="text" class="user-onboard-input auth-username" maxlength="16" autocomplete="username" data-i18n-placeholder="${cloud ? "auth.usernamePh" : "user.nicknamePh"}">
        ${cloud ? `
        <label class="user-onboard-label" data-i18n="auth.password">密码</label>
        <input type="password" class="user-onboard-input auth-password" maxlength="64" autocomplete="${mode === "register" ? "new-password" : "current-password"}" data-i18n-placeholder="auth.passwordPh">
        <p class="user-onboard-hint" data-i18n="user.noRealName">⚠️ 请勿使用真实姓名</p>` : `
        <p class="user-onboard-hint" data-i18n="user.noRealName">⚠️ 请勿使用真实姓名</p>`}
        <p class="user-onboard-error hidden"></p>
        <button type="button" class="user-onboard-btn auth-submit" data-i18n="${cloud ? (mode === "register" ? "auth.createAccount" : "auth.loginBtn") : "user.create"}">${cloud ? (mode === "register" ? t("auth.createAccount") : t("auth.loginBtn")) : t("user.create")}</button>
      </div>`;

    Settings.apply();

    let currentMode = mode;
    const usernameInput = modal.querySelector(".auth-username");
    const passwordInput = modal.querySelector(".auth-password");
    const err = modal.querySelector(".user-onboard-error");
    const submitBtn = modal.querySelector(".auth-submit");

    const setMode = (next) => {
      currentMode = next;
      modal.querySelectorAll(".auth-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.mode === next);
      });
      if (passwordInput) {
        passwordInput.autocomplete = next === "register" ? "new-password" : "current-password";
      }
      submitBtn.textContent = next === "register" ? t("auth.createAccount") : (cloud ? t("auth.loginBtn") : t("user.create"));
      submitBtn.dataset.i18n = next === "register" ? "auth.createAccount" : (cloud ? "auth.loginBtn" : "user.create");
      err.classList.add("hidden");
    };

    modal.querySelectorAll(".auth-tab").forEach((tab) => {
      tab.onclick = () => setMode(tab.dataset.mode);
    });

    const submit = async () => {
      err.classList.add("hidden");
      submitBtn.disabled = true;
      submitBtn.textContent = t("auth.loading");

      try {
        let res;
        if (cloud) {
          const username = usernameInput.value.trim();
          const password = passwordInput?.value || "";
          res = currentMode === "register"
            ? await UserStore.registerAccount(username, password)
            : await UserStore.loginAccount(username, password);
        } else {
          res = UserStore.create(usernameInput.value);
        }

        if (!res.ok) {
          err.textContent = this.errorText(res.error, res.message);
          err.classList.remove("hidden");
          return;
        }

        modal.classList.remove("open");
        this.refreshSidebar();
        if (typeof SiteAnalytics !== "undefined") SiteAnalytics.track();
        if (onDone) onDone(res.user);
      } catch (e) {
        err.textContent = this.errorText(e.code || "request_failed", e.message);
        err.classList.remove("hidden");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = currentMode === "register"
          ? t("auth.createAccount")
          : (cloud ? t("auth.loginBtn") : t("user.create"));
      }
    };

    submitBtn.onclick = submit;
    usernameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (cloud && passwordInput) passwordInput.focus();
        else submit();
      }
    });
    passwordInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
    usernameInput.focus();
  },

  showOnboarding(onDone) {
    this.showAuth(UserAuth.cloudEnabled() ? "login" : "register", onDone);
  },

  requireUser(onReady) {
    if (UserStore.current()) {
      if (onReady) onReady();
      return true;
    }
    this.showAuth("login", onReady);
    return false;
  },

  confirmLogout(onDone) {
    if (!confirm(t("auth.logoutConfirm"))) return;
    UserStore.logout();
    this.refreshSidebar();
    if (onDone) onDone();
    else location.reload();
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

  async init() {
    if (UserAuth.cloudEnabled() && UserAuth.getToken()) {
      await UserStore.restoreSession();
    }
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

window.addEventListener("beforeunload", () => {
  if (typeof UserStore !== "undefined" && UserStore.flushSync) {
    UserStore.flushSync();
  }
});
