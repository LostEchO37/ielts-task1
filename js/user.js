/* 用户 · 答题历史 · 错题本 · 勋章（每知识点全难度通关 = 1 枚） */

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
  }
};

const MODULE_IDS = BADGE_COLLECTIONS.task1_dynamic.moduleIds;

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

    const col = BADGE_COLLECTIONS.task1_dynamic.key;

    u.badges = u.badges.filter((b) => {
      const p = parseBadgeId(b);
      if (p.legacyTier) return false;
      if (p.isMaster) return b === badgeId(col, "all_modules");
      return p.moduleId && MODULE_IDS.includes(p.moduleId);
    });
    u.badgeWall = u.badgeWall.filter((id) => u.badges.includes(id));

    if (typeof QUIZ_BANK !== "undefined") {
      MODULE_IDS.forEach((m) => {
        const id = moduleBadgeId(col, m);
        if (this.isModuleFullyMasteredFromData(u, m)) {
          u.masteredModules[m] = true;
          if (!u.badges.includes(id)) u.badges.push(id);
        }
      });

      if (MODULE_IDS.every((m) => u.badges.includes(moduleBadgeId(col, m)))) {
        const master = badgeId(col, "all_modules");
        if (!u.badges.includes(master)) u.badges.push(master);
      }
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
    u.badges.forEach((b) => {
      if (!u.badgeWall.includes(b)) u.badgeWall.push(b);
    });
    u.badgeWall = u.badgeWall.filter((id) => u.badges.includes(id));
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
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
    data.users[id] = {
      id, name: trimmed,
      createdAt: new Date().toISOString(),
      history: [], wrongBook: {}, mastered: {}, masteredModules: {},
      badges: [], badgeWall: [], simulations: {}
    };
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
    if (moduleId === "all_modules") return u.badges.includes(badgeId(BADGE_COLLECTIONS.task1_dynamic.key, "all_modules"));
    return u.badges.includes(moduleBadgeId(BADGE_COLLECTIONS.task1_dynamic.key, moduleId));
  },

  awardModuleBadge(moduleId) {
    const col = BADGE_COLLECTIONS.task1_dynamic;
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
    if (newly) this.tryAwardMaster();
    return newly ? fullId : null;
  },

  tryAwardMaster() {
    const col = BADGE_COLLECTIONS.task1_dynamic;
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
    const master = this.tryAwardMaster();
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
    if (p.isMaster) return t("badge.all_modules.title");
    const keys = { step1: "nav.step1", step2: "nav.step2", step3: "nav.step3", language: "nav.language", bonus: "nav.bonus", formulas: "nav.formulas" };
    return t(`badge.${p.moduleId}.title`) || t(keys[p.moduleId] || p.moduleId);
  },

  getBadgeDesc(fullId) {
    const p = parseBadgeId(fullId);
    if (p.isMaster) return t("badge.all_modules.desc");
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
