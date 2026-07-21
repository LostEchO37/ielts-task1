/* 勋章墙 — 简化版 */

const QUIZ_MODULE_KEYS = {
  step1: "nav.step1", step2: "nav.step2", step3: "nav.step3",
  language: "nav.language", bonus: "nav.bonus", formulas: "nav.formulas",
  static_step1: "static.nav.step1", static_step2: "static.nav.step2",
  static_step3: "static.nav.step3", static_bonus: "static.nav.bonus",
  static_formulas: "static.nav.formulas"
};

function renderCollection(u, colKey) {
  const col = BADGE_COLLECTIONS[colKey];
  const moduleCards = col.moduleIds.map((modId) => {
    const fullId = moduleBadgeId(colKey, modId);
    const earned = u.badges.includes(fullId);
    const prog = UserStore.getModuleProgress(modId);
    const progressHtml = earned
      ? `<span class="badge-progress done">${t("badge.unlocked")}</span>`
      : `<span class="badge-progress">${prog.done}/${prog.total} ${t("badge.questions")}</span>`;
    return `<div class="badge-module-row">
      ${UserUI.badgeCardHtml(fullId, earned, u.badgeWall.includes(fullId))}
      ${progressHtml}
    </div>`;
  }).join("");

  const masterId = badgeId(colKey, "all_modules");
  const masterEarned = u.badges.includes(masterId);
  const masterLabel = colKey === "task1_static"
    ? t("badge.static_all_modules.masterLabel")
    : t("badge.all_modules.masterLabel");

  return `
    <div class="card">
      <h2>📁 <span data-i18n="collection.${colKey}">${t(col.titleKey)}</span></h2>
      <p class="badge-collection-desc" data-i18n="collection.${colKey}.desc">${t(col.titleKey + ".desc")}</p>
      <div class="badge-modules-list">${moduleCards}</div>
      <div class="badge-collection-master">
        <p class="badge-master-label">${masterLabel}</p>
        ${UserUI.badgeCardHtml(masterId, masterEarned, u.badgeWall.includes(masterId))}
      </div>
    </div>`;
}

function renderProfile() {
  const el = document.getElementById("profile-content");
  let u = UserStore.current();

  if (!u) {
    el.innerHTML = `
      <div class="card empty-state">
        <span>👤</span>
        <p data-i18n="profile.noUser">请先创建用户</p>
        <button class="user-onboard-btn" style="max-width:200px;margin:1rem auto 0;" data-i18n="profile.goCreate">去创建</button>
      </div>`;
    el.querySelector("button").onclick = () => UserUI.showOnboarding(() => renderProfile());
    Settings.apply();
    return;
  }

  UserStore.update((user) => UserStore.syncBadgeWall(user));
  u = UserStore.current();

  const colKey = "task1_dynamic";
  const col = BADGE_COLLECTIONS[colKey];

  const onWall = u.badgeWall.filter((id) => u.badges.includes(id));
  const wallHtml = onWall.length
    ? onWall.map((id) => UserUI.badgeCardHtml(id, true, true)).join("")
    : `<p class="wall-empty" data-i18n="profile.wallEmpty">还没有勋章上墙。在下方练完各知识点全部题目解锁后，点击勋章即可展示。</p>`;

  const collectionsHtml = Object.keys(BADGE_COLLECTIONS).map((key) => renderCollection(u, key)).join("");

  const histHtml = (u.history || []).slice(0, 8).map((h) => {
    const modTitle = t(QUIZ_MODULE_KEYS[h.moduleId] || h.moduleId);
    const date = new Date(h.at).toLocaleDateString();
    return `<li><span>${date} · ${modTitle}</span><span class="${h.perfect ? "hist-perfect" : "hist-score"}">${h.score}/${h.total}</span></li>`;
  }).join("");

  el.innerHTML = `
    <div class="card">
      <h2>👋 ${u.name}</h2>
      <p class="page-desc" style="margin-bottom:1rem;" data-i18n="profile.sub">每个知识点在「我会了」中答对全部题目（入门 / 进阶 / 挑战各难度）后解锁 1 枚勋章。</p>
      <div class="stats-row">
        <div class="stat-box"><strong>${u.history?.length || 0}</strong><span data-i18n="profile.sessions">练习次数</span></div>
        <div class="stat-box"><strong>${u.badges.length}</strong><span data-i18n="profile.badges">已获得</span></div>
      </div>
      <div class="user-actions">
        <button type="button" class="primary" id="btn-switch-user" data-i18n="user.switch">切换用户</button>
        <button type="button" id="btn-new-user" data-i18n="user.newUser">新建用户</button>
      </div>
    </div>

    <div class="card">
      <h2 data-i18n="profile.wallTitle">展示墙</h2>
      <p class="badge-collection-desc" data-i18n="profile.wallHint">已获得的勋章默认展示在此；点击可下架/重新上墙</p>
      <div class="badge-grid badge-wall-grid" id="badge-wall-display">${wallHtml}</div>
    </div>

    ${collectionsHtml}

    <div class="card">
      <h2 data-i18n="profile.history">最近练习</h2>
      <ul class="history-list">${histHtml || `<li style="color:var(--muted)">—</li>`}</ul>
    </div>`;

  Settings.apply();

  const btnSwitch = document.getElementById("btn-switch-user");
  const btnNew = document.getElementById("btn-new-user");
  if (btnSwitch) btnSwitch.onclick = () => showUserSwitcher();
  if (btnNew) btnNew.onclick = () => UserUI.showOnboarding(() => renderProfile());

  el.querySelectorAll(".badge-card.earned[data-badge]").forEach((card) => {
    card.onclick = () => {
      UserStore.toggleBadgeWall(card.dataset.badge);
      renderProfile();
    };
  });
}

function showUserSwitcher() {
  const users = UserStore.listUsers().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const pick = prompt(t("user.switch") + ":\n" + users.map((u, i) => `${i + 1}. ${u.name}`).join("\n"));
  if (!pick) return;
  const idx = parseInt(pick, 10) - 1;
  if (users[idx]) {
    UserStore.switchUser(users[idx].id);
    UserUI.refreshSidebar();
    renderProfile();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!UserStore.current()) UserUI.showOnboarding(() => renderProfile());
  else renderProfile();
});
