/* 错题本页面 */

const WB_MODULE_KEYS = {
  step1: "nav.step1", step2: "nav.step2", step3: "nav.step3",
  language: "nav.language", bonus: "nav.bonus", formulas: "nav.formulas"
};

function stripHtml(html) {
  const d = document.createElement("div");
  d.innerHTML = html;
  return d.textContent || d.innerText || "";
}

function renderWrongbook() {
  const el = document.getElementById("wrongbook-content");
  const u = UserStore.current();

  if (!u) {
    el.innerHTML = `
      <div class="card empty-state">
        <span>📕</span>
        <p data-i18n="profile.noUser">请先创建用户</p>
        <button class="user-onboard-btn" style="max-width:200px;margin:1rem auto 0;" data-i18n="profile.goCreate">去创建</button>
      </div>`;
    el.querySelector("button").onclick = () => UserUI.showOnboarding(() => renderWrongbook());
    return;
  }

  const all = UserStore.getWrongList();
  if (!all.length) {
    el.innerHTML = `
      <div class="card empty-state">
        <span>🎉</span>
        <p data-i18n="wrongbook.empty">暂无错题，继续保持！</p>
      </div>`;
    document.querySelectorAll("#wrongbook-content [data-i18n]").forEach((n) => {
      n.textContent = t(n.dataset.i18n);
    });
    return;
  }

  const byModule = {};
  all.forEach((w) => {
    if (!byModule[w.moduleId]) byModule[w.moduleId] = [];
    byModule[w.moduleId].push(w);
  });

  let html = `<div class="card wrong-list">`;
  Object.keys(byModule).forEach((modId) => {
    const items = byModule[modId];
    const modTitle = t(WB_MODULE_KEYS[modId] || modId);
    html += `
      <div class="wrong-module" data-module="${modId}">
        <div class="wrong-module-head">
          <h3>${modTitle} (${items.length})</h3>
          <button type="button" class="wb-practice-btn" data-module="${modId}">${t("wrongbook.practice")}</button>
        </div>`;
    items.forEach((w) => {
      const q = UserStore.findQuestion(w.moduleId, w.questionId);
      const qText = q ? loc(stripHtml(q.question)).slice(0, 80) + (stripHtml(q.question).length > 80 ? "…" : "") : w.questionId;
      html += `
        <div class="wrong-item">
          <div class="wrong-item-q">${qText}</div>
          <div class="wrong-item-meta">${t("wrongbook.wrongTimes", { n: w.count })}</div>
        </div>`;
    });
    html += `</div>`;
  });
  html += `</div>`;

  el.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", () => {
  if (!UserStore.current()) UserUI.showOnboarding(() => renderWrongbook());
  else renderWrongbook();
});
