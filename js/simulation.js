/* 综合模拟 — 写作反馈（不给分数，只查语法/知识点运用） */

const SimEngine = {
  currentId: null,
  _bound: false,

  bindEvents() {
    if (this._bound) return;
    this._bound = true;

    document.addEventListener("click", (e) => {
      if (!document.getElementById("sim-content")) return;
      const pick = e.target.closest(".sim-pick-btn");
      if (pick && pick.closest("#sim-content")) {
        e.preventDefault();
        e.stopPropagation();
        SimEngine.openSim(pick.dataset.id);
        return;
      }
      if (e.target.closest("#sim-back")) {
        e.preventDefault();
        SimEngine.renderPicker();
        return;
      }
      if (e.target.closest("#sim-submit")) {
        e.preventDefault();
        const sim = SIMULATIONS.find((s) => s.id === SimEngine.currentId);
        const ta = document.getElementById("sim-text");
        if (sim && ta) SimEngine.review(sim, ta.value);
      }
    }, true);

    document.addEventListener("input", (e) => {
      if (e.target.id !== "sim-text" || !SimEngine.currentId) return;
      UserStore.saveSimulationDraft(SimEngine.currentId, e.target.value);
      const wcEl = document.getElementById("sim-wc");
      if (wcEl) {
        wcEl.textContent = e.target.value.trim().split(/\s+/).filter(Boolean).length;
      }
    });
  },

  init() {
    this.bindEvents();
    if (!UserStore.current()) {
      UserUI.requireUser(() => this.init());
      return;
    }
    this.renderPicker();
  },

  renderPicker() {
    this.currentId = null;
    const el = document.getElementById("sim-content");
    if (!el) return;
    el.innerHTML = `
      <div class="card">
        <h2 data-i18n="sim.pick">选择一套模拟题</h2>
        <p class="sim-note" data-i18n="sim.note">含真实图表 · 仿雅思题干 · 提交后获得语法与笔记知识点改进建议（不估分）</p>
        <div class="sim-picker">${SIMULATIONS.map((s, i) => `
          <button type="button" class="sim-pick-btn" data-id="${s.id}">
            <strong>${t("sim.label")} ${i + 1}</strong>
            <span>${s.title.replace(/^Simulation \d · /, "")}</span>
          </button>`).join("")}
        </div>
      </div>`;
    Settings.apply();
  },

  openSim(id) {
    const sim = SIMULATIONS.find((s) => s.id === id);
    if (!sim) return;
    this.currentId = id;
    const draft = UserStore.getSimulationDraft(id);
    const el = document.getElementById("sim-content");
    if (!el) return;
    el.innerHTML = `
      <div class="card sim-task">
        <button type="button" class="sim-back" id="sim-back">← ${t("sim.back")}</button>
        <h2>${sim.title}</h2>
        <div class="sim-prompt en-block">${sim.prompt.replace(/\n/g, "<br>")}</div>
        <div class="chart-wrap sim-chart">
          <img src="${sim.chart}" alt="${sim.chartAlt}">
        </div>
        <label class="sim-write-label" data-i18n="sim.write">你的作文（英文）</label>
        <textarea class="sim-textarea" id="sim-text" rows="14" spellcheck="true" lang="en" placeholder="${t("sim.placeholder")}">${draft}</textarea>
        <div class="sim-wordcount"><span id="sim-wc">0</span> ${t("sim.words")}</div>
        <p class="sim-save-hint">${t("sim.saveHint")}</p>
        <button type="button" class="sim-submit" id="sim-submit">${t("sim.review")}</button>
      </div>
      <div id="sim-feedback"></div>`;

    Settings.apply();
    const ta = document.getElementById("sim-text");
    const wcEl = document.getElementById("sim-wc");
    if (ta && wcEl) {
      wcEl.textContent = ta.value.trim().split(/\s+/).filter(Boolean).length;
    }
  },

  review(sim, text) {
    const fb = document.getElementById("sim-feedback");
    if (!fb) return;
    const report = this.analyse(text, sim);
    fb.innerHTML = `
      <div class="card sim-feedback">
        <h2>${t("sim.feedbackTitle")}</h2>
        <p class="sim-no-score">${t("sim.noScore")}</p>
        <p class="sim-rule-note">${t("sim.ruleNote")}</p>
        <p class="sim-save-hint sim-save-hint--feedback">${t("sim.saveHintFeedback")}</p>
        ${report.map((sec) => `
          <div class="sim-fb-section ${sec.ok ? "ok" : "warn"}">
            <h3>${sec.icon} ${sec.title}</h3>
            <ul>${sec.items.map((it) => `<li>${it}</li>`).join("")}</ul>
          </div>`).join("")}
      </div>`;
    fb.scrollIntoView({ behavior: "smooth", block: "start" });
  },

  analyse(text, sim) {
    const raw = text.trim();
    const lower = raw.toLowerCase();
    const words = raw.split(/\s+/).filter(Boolean);
    const wc = words.length;
    const sections = [];

    const lengthItems = [];
    if (wc < 120) lengthItems.push(t("sim.fb.tooShort"));
    else if (wc < 150) lengthItems.push(t("sim.fb.near150"));
    else lengthItems.push(t("sim.fb.lengthOk", { n: wc }));
    sections.push({ icon: "📏", title: t("sim.fb.length"), ok: wc >= 150, items: lengthItems });

    const openItems = [];
    const hasOpen = /illustrates|shows|compares|depicts|presents|gives information/.test(lower);
    if (hasOpen) openItems.push(t("sim.fb.openOk"));
    else openItems.push(t("sim.fb.openMiss"));
    if (/overall|in general|generally/.test(lower)) openItems.push(t("sim.fb.overallOk"));
    else openItems.push(t("sim.fb.overallMiss"));
    sections.push({ icon: "📝", title: t("sim.fb.structure"), ok: hasOpen, items: openItems });

    const tenseItems = [];
    const pastVerbs = (lower.match(/\b(increased|decreased|rose|fell|grew|declined|climbed|dropped|remained|stood)\b/g) || []).length;
    if (pastVerbs >= 2) tenseItems.push(t("sim.fb.pastOk"));
    else tenseItems.push(t("sim.fb.pastMiss"));
    if (sim.timeRange && lower.includes("20")) tenseItems.push(t("sim.fb.timeHint", { range: sim.timeRange }));
    sections.push({ icon: "⏰", title: t("sim.fb.tense"), ok: pastVerbs >= 2, items: tenseItems });

    const trendItems = [];
    const trends = ["increase", "decrease", "rise", "fall", "grow", "decline", "fluctuat", "peak", "remain", "stable", "steady"];
    const found = trends.filter((w) => lower.includes(w));
    if (found.length >= 3) trendItems.push(t("sim.fb.trendOk", { n: found.length }));
    else trendItems.push(t("sim.fb.trendMiss"));
    if (/sharply|dramatically|significantly|slightly|gradually|steadily/.test(lower)) trendItems.push(t("sim.fb.adverbOk"));
    else trendItems.push(t("sim.fb.adverbMiss"));
    sections.push({ icon: "📈", title: t("sim.fb.language"), ok: found.length >= 3, items: trendItems });

    const linkItems = [];
    const links = ["similarly", "likewise", "in contrast", "by contrast", "however", "whereas", "while", "respectively"];
    const linksFound = links.filter((w) => lower.includes(w));
    if (linksFound.length) linkItems.push(t("sim.fb.linkOk", { w: linksFound.join(", ") }));
    else linkItems.push(t("sim.fb.linkMiss"));
    sections.push({ icon: "🔗", title: t("sim.fb.links"), ok: linksFound.length > 0, items: linkItems });

    const gramItems = SimLint.checkGrammar(raw);
    const gramOk = gramItems.length === 0;
    if (gramOk) gramItems.push(t("sim.fb.grammarClean"));
    sections.push({
      icon: "✏️",
      title: t("sim.fb.grammar"),
      ok: gramOk,
      items: gramItems
    });

    const spellErrors = SimLint.checkSpelling(raw);
    const spellItems = [];
    if (!spellErrors.length) {
      spellItems.push(t("sim.fb.spellOk"));
    } else {
      spellErrors.forEach((e) => {
        if (e.suggestion) {
          spellItems.push(t("sim.fb.spellErr", { word: e.word, sug: e.suggestion }));
        } else {
          spellItems.push(t("sim.fb.spellUnknown", { word: e.word }));
        }
      });
    }
    sections.push({
      icon: "🔤",
      title: t("sim.fb.spelling"),
      ok: !spellErrors.length,
      items: spellItems
    });

    const repeated = SimLint.checkRepetition(raw);
    const repItems = [];
    if (!repeated.length) {
      repItems.push(t("sim.fb.repeatOk"));
    } else {
      repeated.forEach((r) => {
        if (r.alternatives.length) {
          repItems.push(t("sim.fb.repeatAlt", { word: r.word, n: r.count, alts: r.alternatives.join(", ") }));
        } else {
          repItems.push(t("sim.fb.repeatWarn", { word: r.word, n: r.count }));
        }
      });
    }
    sections.push({
      icon: "🔁",
      title: t("sim.fb.repetition"),
      ok: !repeated.length,
      items: repItems
    });

    const compareItems = [];
    if (/compared to|comparison|higher than|lower than|the most|the least|respectively/.test(lower)) {
      compareItems.push(t("sim.fb.compareOk"));
    } else compareItems.push(t("sim.fb.compareMiss"));
    if (/at the beginning|at the end|by \d{4}|in \d{4}|over the period|during/.test(lower)) {
      compareItems.push(t("sim.fb.timePhraseOk"));
    } else compareItems.push(t("sim.fb.timePhraseMiss"));
    sections.push({ icon: "📊", title: t("sim.fb.data"), ok: /compared|higher|lower|most|least/.test(lower), items: compareItems });

    return sections;
  }
};

SimEngine.bindEvents();

document.addEventListener("DOMContentLoaded", () => SimEngine.init());

document.addEventListener("ielts:langchange", () => {
  if (!document.getElementById("sim-content")) return;
  const fb = document.getElementById("sim-feedback");
  if (fb && fb.innerHTML.trim()) return;
  if (SimEngine.currentId) SimEngine.openSim(SimEngine.currentId);
  else SimEngine.renderPicker();
});
