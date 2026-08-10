/* 用户 · 答题历史 · 错题本 · 勋章（每知识点全难度通关 = 1 枚） */

if (typeof SiteConfig === "undefined") {
  window.SiteConfig = {
    apiBase: "",
    apiUrl(path) {
      const p = path.startsWith("/") ? path : `/${path}`;
      const base = (this.apiBase || "").replace(/\/$/, "");
      return base ? `${base}${p}` : p;
    }
  };
}

const UserAuth = {
  TOKEN_KEY: "ielts-auth-token",

  cloudEnabled() {
    return !!(SiteConfig.apiBase || "").trim();
  },

  getToken() {
    try { return localStorage.getItem(this.TOKEN_KEY) || ""; } catch { return ""; }
  },

  setToken(token) {
    try {
      if (token) localStorage.setItem(this.TOKEN_KEY, token);
      else localStorage.removeItem(this.TOKEN_KEY);
    } catch { /* ignore */ }
  },

  authHeaders() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
  },

  async request(path, options = {}, timeoutMs = 20000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(SiteConfig.apiUrl(path), {
        ...options,
        signal: controller.signal,
        headers: { ...this.authHeaders(), ...(options.headers || {}) }
      });
      let body = null;
      try { body = await res.json(); } catch { body = null; }
      if (!res.ok) {
        const err = new Error(body?.message || body?.error || `HTTP ${res.status}`);
        err.code = body?.error || "request_failed";
        err.status = res.status;
        throw err;
      }
      return body;
    } catch (e) {
      if (e.name === "AbortError") {
        const err = new Error("request timeout");
        err.code = "request_timeout";
        throw err;
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  },

  async register(username, password) {
    const res = await this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    this.setToken(res.token);
    return res;
  },

  async login(username, password) {
    const res = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    this.setToken(res.token);
    return res;
  },

  async fetchRemoteData() {
    const res = await this.request("/api/auth/data");
    return res.data || {};
  },

  async pushRemoteData(data) {
    await this.request("/api/auth/data", {
      method: "PUT",
      body: JSON.stringify({ data })
    });
  },

  logout() {
    this.setToken("");
  }
};

const BADGE_COLLECTIONS = {
  task1_dynamic: {
    key: "task1_dynamic",
    titleKey: "collection.task1_dynamic",
    moduleIds: ["step1", "step2", "step3", "language", "bonus", "formulas"],
    badges: {
      step1: { icon: "🎯", color: "#1e4d6b" },
      step2: { icon: "📊", color: "#2a6f8f" },
      step3: { icon: "📈", color: "#c45c3e" },
      language: { icon: "📝", color: "#5c6478" },
      bonus: { icon: "⭐", color: "#e8a838" },
      formulas: { icon: "🏆", color: "#6b4d9e" },
      all_modules: { icon: "👑", color: "#d4af37" }
    }
  },
  task1_static: {
    key: "task1_static",
    titleKey: "collection.task1_static",
    moduleIds: ["static_step1", "static_step2", "static_step3", "static_bonus", "static_formulas"],
    badges: {
      static_step1: { icon: "🎯", color: "#1e4d6b" },
      static_step2: { icon: "📊", color: "#2a6f8f" },
      static_step3: { icon: "📈", color: "#c45c3e" },
      static_bonus: { icon: "⭐", color: "#e8a838" },
      static_formulas: { icon: "🏆", color: "#6b4d9e" },
      all_modules: { icon: "👑", color: "#d4af37" }
    }
  },
  task2_type1: {
    key: "task2_type1",
    titleKey: "collection.task2_type1",
    moduleIds: ["t2_method"],
    badges: {
      t2_method: { icon: "⚖️", color: "#5b4d8a" },
      all_modules: { icon: "👑", color: "#d4af37" }
    }
  }
};

const MODULE_IDS = BADGE_COLLECTIONS.task1_dynamic.moduleIds;

function collectionForModule(moduleId) {
  if (!moduleId) return BADGE_COLLECTIONS.task1_dynamic;
  if (moduleId.startsWith("t2_")) return BADGE_COLLECTIONS.task2_type1;
  if (moduleId.startsWith("static_")) return BADGE_COLLECTIONS.task1_static;
  return BADGE_COLLECTIONS.task1_dynamic;
}

function moduleBadgeId(collectionKey, moduleId) {
  return `${collectionKey}.${moduleId}`;
}

function parseBadgeId(fullId) {
  if (!fullId || typeof fullId !== "string") {
    return { collection: "task1_dynamic", moduleId: null, isMaster: false };
  }
  if (fullId.endsWith(".all_modules")) {
    return { collection: fullId.split(".")[0], moduleId: "all_modules", isMaster: true };
  }
  const tier = fullId.match(/^([^.]+)\.([^.]+)\.d[123]$/);
  if (tier) return { collection: tier[1], moduleId: tier[2], isMaster: false, legacyTier: true };
  const simple = fullId.match(/^([^.]+)\.([^.]+)$/);
  if (simple) return { collection: simple[1], moduleId: simple[2], isMaster: false };
  return { collection: "task1_dynamic", moduleId: fullId, isMaster: false };
}

function badgeId(collectionKey, badgeKey) {
  return `${collectionKey}.${badgeKey}`;
}

const UserStore = {
  KEY: "ielts-users-v1",
  _syncTimer: null,
  _syncPending: false,

  emptyUser(id, name) {
    return {
      id, name,
      createdAt: new Date().toISOString(),
      history: [], wrongBook: {}, mastered: {}, masteredModules: {},
      badges: [], badgeWall: [], simulations: {}
    };
  },

  extractData(u) {
    return {
      history: u.history || [],
      wrongBook: u.wrongBook || {},
      mastered: u.mastered || {},
      masteredModules: u.masteredModules || {},
      badges: u.badges || [],
      badgeWall: u.badgeWall || [],
      simulations: u.simulations || {}
    };
  },

  applyData(u, data) {
    u.history = data.history || [];
    u.wrongBook = data.wrongBook || {};
    u.mastered = data.mastered || {};
    u.masteredModules = data.masteredModules || {};
    u.badges = data.badges || [];
    u.badgeWall = data.badgeWall || [];
    u.simulations = data.simulations || {};
  },

  scheduleSync() {
    if (!UserAuth.cloudEnabled() || !UserAuth.getToken()) return;
    this._syncPending = true;
    clearTimeout(this._syncTimer);
    this._syncTimer = setTimeout(() => this.flushSync(), 800);
  },

  async flushSync() {
    if (!this._syncPending || !UserAuth.cloudEnabled() || !UserAuth.getToken()) return;
    const u = this.current();
    if (!u) return;
    this._syncPending = false;
    try {
      await UserAuth.pushRemoteData(this.extractData(u));
    } catch (e) {
      console.warn("User sync failed:", e.message);
      this._syncPending = true;
    }
  },

  async restoreSession() {
    if (!UserAuth.cloudEnabled() || !UserAuth.getToken()) return false;
    try {
      const me = await UserAuth.request("/api/auth/me");
      const remote = await UserAuth.fetchRemoteData();
      const data = this.load();
      if (!data.users) data.users = {};
      const user = this.emptyUser(me.user.id, me.user.name);
      if (me.user.createdAt) user.createdAt = me.user.createdAt;
      this.applyData(user, remote);
      data.users[me.user.id] = user;
      data.currentUserId = me.user.id;
      this.migrateUser(user);
      clearTimeout(this._syncTimer);
      this._syncPending = false;
      localStorage.setItem(this.KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      if (e.status === 401) UserAuth.logout();
      return false;
    }
  },

  async registerAccount(username, password) {
    const trimmed = (username || "").trim();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 16) {
      return { ok: false, error: "invalid_username" };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: "invalid_password" };
    }

    if (UserAuth.cloudEnabled()) {
      try {
        const res = await UserAuth.register(trimmed, password);
        const data = this.load();
        if (!data.users) data.users = {};
        const localData = this.current() ? this.extractData(this.current()) : {};
        const user = this.emptyUser(res.user.id, res.user.name);
        this.applyData(user, localData);
        data.users[res.user.id] = user;
        data.currentUserId = res.user.id;
        this.migrateUser(user);
        this.save(data);
        await UserAuth.pushRemoteData(this.extractData(user));
        return { ok: true, user };
      } catch (e) {
        return { ok: false, error: e.code || "register_failed", message: e.message };
      }
    }

    return this.create(trimmed);
  },

  async loginAccount(username, password) {
    const trimmed = (username || "").trim();
    if (!trimmed || !password) return { ok: false, error: "invalid_credentials" };

    if (UserAuth.cloudEnabled()) {
      try {
        const res = await UserAuth.login(trimmed, password);
        const remote = await UserAuth.fetchRemoteData();
        const data = this.load();
        if (!data.users) data.users = {};
        data.users[res.user.id] = this.emptyUser(res.user.id, res.user.name);
        this.applyData(data.users[res.user.id], remote);
        data.currentUserId = res.user.id;
        this.migrateUser(data.users[res.user.id]);
        this.save(data);
        return { ok: true, user: data.users[res.user.id] };
      } catch (e) {
        return { ok: false, error: e.code || "login_failed", message: e.message };
      }
    }

    const match = this.listUsers().find((u) => u.name === trimmed);
    if (match) {
      this.switchUser(match.id);
      return { ok: true, user: match };
    }
    return { ok: false, error: "user_not_found" };
  },

  logout() {
    UserAuth.logout();
    const data = this.load();
    data.currentUserId = null;
    this.save(data);
  },

  isCloudUser() {
    return UserAuth.cloudEnabled() && !!UserAuth.getToken();
  },

  load() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEY) || "{}");
      if (data.users) Object.values(data.users).forEach((u) => this.migrateUser(u));
      return data;
    } catch {
      return {};
    }
  },

  migrateUser(u) {
    if (!u.badges) u.badges = [];
    if (!u.badgeWall) u.badgeWall = [];
    if (!u.mastered) u.mastered = {};
    if (!u.masteredModules) u.masteredModules = {};

    const validIds = new Set();
    Object.values(BADGE_COLLECTIONS).forEach((col) => {
      col.moduleIds.forEach((m) => validIds.add(moduleBadgeId(col.key, m)));
      validIds.add(badgeId(col.key, "all_modules"));
    });

    u.badges = u.badges.filter((b) => {
      const p = parseBadgeId(b);
      if (p.legacyTier) return false;
      return validIds.has(b);
    });
    u.badgeWall = u.badgeWall.filter((id) => u.badges.includes(id));

    if (typeof QUIZ_BANK !== "undefined") {
      Object.values(BADGE_COLLECTIONS).forEach((col) => {
        col.moduleIds.forEach((m) => {
          const id = moduleBadgeId(col.key, m);
          if (this.isModuleFullyMasteredFromData(u, m)) {
            u.masteredModules[m] = true;
            if (!u.badges.includes(id)) u.badges.push(id);
          }
        });

        if (col.moduleIds.every((m) => u.badges.includes(moduleBadgeId(col.key, m)))) {
          const master = badgeId(col.key, "all_modules");
          if (!u.badges.includes(master)) u.badges.push(master);
        }
      });
    }

    if (u.badges.length && !u.badgeWall.length) u.badgeWall = [...u.badges];
    this.syncBadgeWall(u);
  },

  isModuleFullyMasteredFromData(u, moduleId) {
    if (!moduleId || moduleId === "all_modules") return false;
    if (u.masteredModules && u.masteredModules[moduleId]) return true;
    const mod = typeof QUIZ_BANK !== "undefined" ? QUIZ_BANK[moduleId] : null;
    if (!mod) return false;
    const done = new Set(u.mastered?.[moduleId] || []);
    return mod.questions.length > 0 && mod.questions.every((q) => done.has(q.id));
  },

  syncBadgeWall(u) {
    if (!u.badgeWall) u.badgeWall = [];
    // 只移除已失效的 id；不自动把全部勋章加回墙（用户可手动下架）
    u.badgeWall = u.badgeWall.filter((id) => u.badges.includes(id));
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
    this.scheduleSync();
  },

  currentId() {
    return this.load().currentUserId || null;
  },

  current() {
    const data = this.load();
    return data.currentUserId ? data.users[data.currentUserId] : null;
  },

  create(name) {
    const trimmed = (name || "").trim();
    if (!trimmed || trimmed.length > 16) return { ok: false, error: "invalid" };
    const data = this.load();
    if (!data.users) data.users = {};
    const id = "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    data.users[id] = this.emptyUser(id, trimmed);
    data.currentUserId = id;
    this.save(data);
    return { ok: true, user: data.users[id] };
  },

  switchUser(id) {
    const data = this.load();
    if (!data.users[id]) return false;
    data.currentUserId = id;
    this.save(data);
    return true;
  },

  listUsers() {
    return Object.values(this.load().users || {});
  },

  update(fn) {
    const data = this.load();
    const id = data.currentUserId;
    if (!id || !data.users[id]) return null;
    fn(data.users[id]);
    this.migrateUser(data.users[id]);
    this.save(data);
    return data.users[id];
  },

  markQuestionMastered(moduleId, questionId) {
    this.update((u) => {
      if (!u.mastered) u.mastered = {};
      if (!u.mastered[moduleId]) u.mastered[moduleId] = [];
      if (!u.mastered[moduleId].includes(questionId)) u.mastered[moduleId].push(questionId);
    });
  },

  isModuleFullyMastered(moduleId) {
    return this.isModuleFullyMasteredFromData(this.current() || {}, moduleId);
  },

  getModuleProgress(moduleId) {
    const u = this.current();
    const mod = typeof QUIZ_BANK !== "undefined" ? QUIZ_BANK[moduleId] : null;
    if (!u || !mod) return { done: 0, total: 0 };
    const done = (u.mastered?.[moduleId] || []).length;
    return { done, total: mod.questions.length };
  },

  hasBadge(moduleId) {
    const u = this.current();
    if (!u) return false;
    const col = collectionForModule(moduleId);
    if (moduleId === "all_modules") return u.badges.includes(badgeId(col.key, "all_modules"));
    return u.badges.includes(moduleBadgeId(col.key, moduleId));
  },

  awardModuleBadge(moduleId) {
    const col = collectionForModule(moduleId);
    const fullId = moduleBadgeId(col.key, moduleId);
    let newly = false;
    this.update((u) => {
      if (!this.isModuleFullyMasteredFromData(u, moduleId)) return;
      if (!u.badges.includes(fullId)) {
        u.badges.push(fullId);
        u.badgeWall.push(fullId);
        u.masteredModules = u.masteredModules || {};
        u.masteredModules[moduleId] = true;
        newly = true;
      }
    });
    if (newly) this.tryAwardMaster(moduleId);
    return newly ? fullId : null;
  },

  tryAwardMaster(moduleId) {
    const col = collectionForModule(moduleId);
    const u = this.current();
    if (!u) return null;
    if (!col.moduleIds.every((m) => u.badges.includes(moduleBadgeId(col.key, m)))) return null;
    const master = badgeId(col.key, "all_modules");
    let newly = false;
    this.update((u2) => {
      if (!u2.badges.includes(master)) {
        u2.badges.push(master);
        u2.badgeWall.push(master);
        newly = true;
      }
    });
    return newly ? master : null;
  },

  checkAndAwardBadges(moduleId) {
    const earned = [];
    const id = this.awardModuleBadge(moduleId);
    if (id) earned.push(id);
    const master = this.tryAwardMaster(moduleId);
    if (master && !earned.includes(master)) earned.push(master);
    return earned;
  },

  recordSession(moduleId, difficulty, score, total, questionIds) {
    return this.update((u) => {
      u.history.unshift({
        moduleId, difficulty, score, total, questionIds,
        perfect: score === total, at: new Date().toISOString()
      });
      if (u.history.length > 80) u.history.length = 80;
    });
  },

  addWrong(moduleId, questionId) {
    const key = `${moduleId}:${questionId}`;
    return this.update((u) => {
      if (!u.wrongBook[key]) u.wrongBook[key] = { moduleId, questionId, count: 0, lastAt: null };
      u.wrongBook[key].count++;
      u.wrongBook[key].lastAt = new Date().toISOString();
    });
  },

  removeWrong(moduleId, questionId) {
    return this.update((u) => { delete u.wrongBook[`${moduleId}:${questionId}`]; });
  },

  getWrongList(moduleId) {
    const u = this.current();
    if (!u) return [];
    return Object.values(u.wrongBook)
      .filter((w) => !moduleId || w.moduleId === moduleId)
      .sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));
  },

  wrongCount(moduleId) {
    return this.getWrongList(moduleId).length;
  },

  toggleBadgeWall(fullBadgeId) {
    return this.update((u) => {
      if (!u.badges.includes(fullBadgeId)) return;
      const i = u.badgeWall.indexOf(fullBadgeId);
      if (i >= 0) u.badgeWall.splice(i, 1);
      else u.badgeWall.push(fullBadgeId);
    });
  },

  findQuestion(moduleId, questionId) {
    const mod = QUIZ_BANK?.[moduleId];
    return mod?.questions.find((q) => q.id === questionId) || null;
  },

  getBadgeMeta(fullId) {
    const p = parseBadgeId(fullId);
    const col = BADGE_COLLECTIONS[p.collection];
    if (!col) return null;
    if (p.isMaster) return { ...col.badges.all_modules, isMaster: true, moduleId: "all_modules" };
    const base = col.badges[p.moduleId];
    if (!base) return null;
    return { ...base, moduleId: p.moduleId, isMaster: false };
  },

  getBadgeTitle(fullId) {
    const p = parseBadgeId(fullId);
    if (p.isMaster) {
      if (p.collection === "task1_static") return t("badge.static_all_modules.title");
      if (p.collection === "task2_type1") return t("badge.t2_all_modules.title");
      return t("badge.all_modules.title");
    }
    const keys = {
      step1: "nav.step1", step2: "nav.step2", step3: "nav.step3",
      language: "nav.language", bonus: "nav.bonus", formulas: "nav.formulas",
      static_step1: "static.nav.step1", static_step2: "static.nav.step2",
      static_step3: "static.nav.step3", static_bonus: "static.nav.bonus",
      static_formulas: "static.nav.formulas",
      t2_method: "task2.nav.method"
    };
    return t(`badge.${p.moduleId}.title`) || t(keys[p.moduleId] || p.moduleId);
  },

  getBadgeDesc(fullId) {
    const p = parseBadgeId(fullId);
    if (p.isMaster) {
      if (p.collection === "task1_static") return t("badge.static_all_modules.desc");
      if (p.collection === "task2_type1") return t("badge.t2_all_modules.desc");
      return t("badge.all_modules.desc");
    }
    return t(`badge.${p.moduleId}.desc`) || t("badge.module.desc");
  },

  saveSimulationDraft(simId, text) {
    this.update((u) => {
      if (!u.simulations) u.simulations = {};
      u.simulations[simId] = { text, savedAt: new Date().toISOString() };
    });
  },

  getSimulationDraft(simId) {
    return this.current()?.simulations?.[simId]?.text || "";
  }
};

const MODULE_BADGES = BADGE_COLLECTIONS.task1_dynamic.badges;
