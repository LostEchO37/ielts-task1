/* 综合模拟 — 写作反馈（不给分数，只查语法/知识点运用） */

const SimEngine = {
  currentId: null,
  _bound: false,

  simLabel(sim, index) {
    if (sim.isTask2 && sim.typeKey) {
      const n = SIMULATIONS.filter((s) => s.typeKey === sim.typeKey).indexOf(sim) + 1;
      return t("task2.sim.promptLabel", { n });
    }
    if (sim.isTask2) return t("task2.sim.label");
    if (sim.isStatic) return t("static.sim.label");
    return t("sim.label");
  },

  task2TypeTitle(typeKey) {
    const type = typeof TASK2_SIM_TYPES !== "undefined"
      ? TASK2_SIM_TYPES.find((x) => x.id === typeKey)
      : null;
    return type ? t(type.titleKey) : typeKey;
  },

  simSubtitle(title) {
    return title.replace(/^(?:Static )?Sim(?:ulation)? \d+ · /i, "");
  },

  simHeading(sim, index) {
    if (sim.isTask2 && sim.typeKey) {
      return `${this.task2TypeTitle(sim.typeKey)} · ${this.simSubtitle(sim.title)}`;
    }
    return `${this.simLabel(sim, index)} ${index + 1} · ${this.simSubtitle(sim.title)}`;
  },

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
    const hash = location.hash.replace(/^#/, "");
    if (hash && SIMULATIONS.some((s) => s.id === hash)) {
      this.openSim(hash);
    }
  },

  renderPicker() {
    this.currentId = null;
    const el = document.getElementById("sim-content");
    if (!el) return;
    if (SIMULATIONS[0]?.isTask2 && typeof TASK2_SIM_TYPES !== "undefined") {
      this.renderTask2Picker(el);
      return;
    }
    el.innerHTML = `
      <div class="card">
        <h2 data-i18n="sim.pick">选择一套模拟题</h2>
        <p class="sim-note" data-i18n="${SIMULATIONS[0]?.isTask2 ? "task2.sim.note" : "sim.note"}">${SIMULATIONS[0]?.isTask2 ? t("task2.sim.note") : t("sim.note")}</p>
        <div class="sim-picker">${SIMULATIONS.map((s, i) => `
          <button type="button" class="sim-pick-btn" data-id="${s.id}">
            <strong>${SimEngine.simLabel(s, i)} ${i + 1}</strong>
            <span>${SimEngine.simSubtitle(s.title)}</span>
          </button>`).join("")}
        </div>
      </div>`;
    Settings.apply();
  },

  renderTask2Picker(el) {
    const groups = TASK2_SIM_TYPES.map((type) => {
      const sims = SIMULATIONS.filter((s) => s.typeKey === type.id);
      if (!sims.length) return "";
      const tag = type.live
        ? `<span class="module-tag live">${t("cover.live")}</span>`
        : `<span class="module-tag pending">${t("cover.pending")}</span>`;
      const btns = sims.map((s, i) => `
        <button type="button" class="sim-pick-btn" data-id="${s.id}">
          <strong>${t("task2.sim.promptLabel", { n: i + 1 })}</strong>
          <span>${SimEngine.simSubtitle(s.title)}</span>
        </button>`).join("");
      return `
        <div class="sim-type-group" id="sim-type-${type.id}">
          <div class="sim-type-head">${tag}<h3>${t(type.titleKey)}</h3></div>
          <div class="sim-picker">${btns}</div>
        </div>`;
    }).join("");

    el.innerHTML = `
      <div class="card">
        <h2 data-i18n="sim.pick">选择一套模拟题</h2>
        <p class="sim-note" data-i18n="task2.sim.note">${t("task2.sim.note")}</p>
        <div class="sim-type-groups">${groups}</div>
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
    const simIndex = SIMULATIONS.findIndex((s) => s.id === id);
    el.innerHTML = `
      <div class="card sim-task">
        <button type="button" class="sim-back" id="sim-back">← ${t("sim.back")}</button>
        <h2>${this.simHeading(sim, simIndex)}</h2>
        <div class="sim-prompt en-block">${sim.prompt.replace(/\n/g, "<br>")}</div>
        ${sim.chart ? `<div class="chart-wrap sim-chart"><img src="${sim.chart}" alt="${sim.chartAlt || ""}"></div>` : ""}
        <label class="sim-write-label" data-i18n="sim.write">你的作文（英文）</label>
        <textarea class="sim-textarea" id="sim-text" rows="14" spellcheck="true" lang="en" placeholder="${sim.isTask2 ? t("task2.sim.placeholder") : t("sim.placeholder")}">${draft}</textarea>
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
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (typeof SiteAnalytics !== "undefined") {
      SiteAnalytics.trackEvent("sim_review", {
        simId: sim.id,
        wordCount: words,
        isStatic: !!sim.isStatic
      });
    }
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
    if (sim.isTask2) return this.analyseTask2(text, sim);
    if (sim.isStatic) return this.analyseStatic(text, sim);
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
  },

  analyseStatic(text, sim) {
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
    const changesMisuse = /changes in|over a span of|over the period|over \d+ years/.test(lower);
    if (hasOpen && !changesMisuse) openItems.push(t("static.sim.fb.openOk"));
    else if (changesMisuse) openItems.push(t("static.sim.fb.changesMisuse"));
    else openItems.push(t("static.sim.fb.openMiss"));
    const hasOverall = /overall|in general|generally|it can be observed|it is also evident/.test(lower);
    const overallTrendMisuse = /upward trend|downward trend|with the exception of.*(?:declin|increas|rose|fell)/.test(lower);
    if (hasOverall && !overallTrendMisuse) openItems.push(t("static.sim.fb.overallOk"));
    else if (overallTrendMisuse) openItems.push(t("static.sim.fb.overallTrendMisuse"));
    else openItems.push(t("static.sim.fb.overallMiss"));
    sections.push({ icon: "📝", title: t("sim.fb.structure"), ok: hasOpen && !changesMisuse, items: openItems });

    const tenseItems = [];
    const present = (lower.match(/\b(is|are|was|were|accounts for|stands at|represents|constitutes)\b/g) || []).length;
    if (/shows|illustrates|depicts/.test(lower) && !/increased|decreased|rose|fell/.test(lower)) {
      tenseItems.push(t("static.sim.fb.presentOk"));
    } else if (/increased|decreased|rose|fell|over the period|between \d{4}/.test(lower)) {
      tenseItems.push(t("static.sim.fb.trendMisuse"));
    } else tenseItems.push(t("static.sim.fb.presentMiss"));
    sections.push({ icon: "⏰", title: t("sim.fb.tense"), ok: present >= 2, items: tenseItems });

    const bonusItems = [];
    if (/prominent features|in terms of|what also stands out/.test(lower)) {
      bonusItems.push(t("static.sim.fb.linkOk"));
    } else bonusItems.push(t("static.sim.fb.linkMiss"));
    if (/similar|comparable|respectively|double|triple|times that|percentage points|taking up|standing at|%/.test(lower)) {
      bonusItems.push(t("static.sim.fb.compareOk"));
    } else bonusItems.push(t("static.sim.fb.compareMiss"));
    sections.push({ icon: "⭐", title: t("static.sim.fb.bonus"), ok: bonusItems.length >= 2, items: bonusItems });

    const gramItems = SimLint.checkGrammar(raw);
    const gramOk = gramItems.length === 0;
    if (gramOk) gramItems.push(t("sim.fb.grammarClean"));
    sections.push({ icon: "✏️", title: t("sim.fb.grammar"), ok: gramOk, items: gramItems });

    const spellErrors = SimLint.checkSpelling(raw);
    const spellItems = spellErrors.length ? spellErrors.map((e) =>
      e.suggestion ? t("sim.fb.spellErr", { word: e.word, sug: e.suggestion }) : t("sim.fb.spellUnknown", { word: e.word })
    ) : [t("sim.fb.spellOk")];
    sections.push({ icon: "🔤", title: t("sim.fb.spelling"), ok: !spellErrors.length, items: spellItems });

    const numItems = [];
    if (/\d+/.test(raw)) numItems.push(t("static.sim.fb.numOk"));
    else numItems.push(t("static.sim.fb.numMiss"));
    sections.push({ icon: "🔢", title: t("static.sim.fb.numbers"), ok: /\d+/.test(raw), items: numItems });

    return sections;
  },

  analyseTask2(text, sim) {
    const key = sim.typeKey || "211";
    if (key === "212") return this.analyseTask2_212(text, sim);
    if (key === "221") return this.analyseTask2_221(text, sim);
    if (key === "222") return this.analyseTask2_222(text, sim);
    if (key === "23") return this.analyseTask2_23(text, sim);
    return this.analyseTask2_211(text, sim);
  },

  task2BaseSections(text, sim) {
    const raw = text.trim();
    const lower = raw.toLowerCase();
    const wc = raw.split(/\s+/).filter(Boolean).length;
    const minW = sim.minWords || 250;
    const sections = [];

    const lengthItems = [];
    if (wc < minW - 30) lengthItems.push(t("task2.sim.fb.tooShort", { n: minW }));
    else if (wc < minW) lengthItems.push(t("task2.sim.fb.nearMin", { n: wc, min: minW }));
    else lengthItems.push(t("task2.sim.fb.lengthOk", { n: wc }));
    sections.push({ icon: "📏", title: t("sim.fb.length"), ok: wc >= minW, items: lengthItems });

    const gramItems = SimLint.checkGrammar(raw);
    const gramOk = gramItems.length === 0;
    if (gramOk) gramItems.push(t("sim.fb.grammarClean"));
    sections.push({ icon: "✏️", title: t("sim.fb.grammar"), ok: gramOk, items: gramItems });

    const spellErrors = SimLint.checkSpelling(raw);
    const spellItems = spellErrors.length
      ? spellErrors.map((e) => e.suggestion ? t("sim.fb.spellErr", { word: e.word, sug: e.suggestion }) : t("sim.fb.spellUnknown", { word: e.word }))
      : [t("sim.fb.spellOk")];
    sections.push({ icon: "🔤", title: t("sim.fb.spelling"), ok: !spellErrors.length, items: spellItems });

    const topicHits = (sim.topics || []).filter((w) => lower.includes(w.toLowerCase()));
    const topicItems = topicHits.length >= 2
      ? [t("task2.sim.fb.topicOk", { n: topicHits.length })]
      : [t("task2.sim.fb.topicMiss")];
    sections.push({ icon: "🎯", title: t("task2.sim.fb.topic"), ok: topicHits.length >= 2, items: topicItems });

    return { sections, raw, lower, wc };
  },

  analyseTask2_211(text, sim) {
    const { sections, lower } = this.task2BaseSections(text, sim);

    const thesisItems = [];
    const hasThesis = /i would argue|i believe|in my opinion|it is argued|from my perspective|i am convinced/.test(lower);
    const hasBothViews = /some people|others believe|while others|on the one hand|on the other hand|discuss both/.test(lower);
    if (hasThesis) thesisItems.push(t("task2.sim.fb.thesisOk"));
    else thesisItems.push(t("task2.sim.fb.thesisMiss"));
    if (hasBothViews) thesisItems.push(t("task2.sim.fb.viewsOk"));
    else thesisItems.push(t("task2.sim.fb.viewsMiss"));
    sections.splice(1, 0, { icon: "📝", title: t("task2.sim.fb.position"), ok: hasThesis, items: thesisItems });

    const structItems = [];
    const concede = /undeniably|admittedly|it is true that|while it is/.test(lower);
    const turn = /nevertheless|however|on the other hand|yet|still/.test(lower);
    const add = /in addition|furthermore|moreover|what is more/.test(lower);
    if (concede) structItems.push(t("task2.sim.fb.concedeOk"));
    else structItems.push(t("task2.sim.fb.concedeMiss"));
    if (turn) structItems.push(t("task2.sim.fb.turnOk"));
    else structItems.push(t("task2.sim.fb.turnMiss"));
    if (add) structItems.push(t("task2.sim.fb.addOk"));
    else structItems.push(t("task2.sim.fb.addMiss"));
    sections.splice(2, 0, { icon: "⚖️", title: t("task2.sim.fb.structure"), ok: concede && turn, items: structItems });

    const argItems = [];
    const hasChain = /(if|by|through|therefore|thus|as a result|lead to|result in)/.test(lower);
    const hasRebut = /(little relevance|cannot deliver|short-term|consume.*time|however|whereas|while)/.test(lower);
    if (hasChain) argItems.push(t("task2.sim.fb.chainOk"));
    else argItems.push(t("task2.sim.fb.chainMiss"));
    if (hasRebut) argItems.push(t("task2.sim.fb.rebutOk"));
    else argItems.push(t("task2.sim.fb.rebutMiss"));
    sections.splice(3, 0, { icon: "🔗", title: t("task2.sim.fb.argument"), ok: hasChain && hasRebut, items: argItems });

    return sections;
  },

  analyseTask2_212(text, sim) {
    const { sections, lower } = this.task2BaseSections(text, sim);
    const items = [];
    const bothSides = /on the one hand|on the other hand|both|each|equally|merit|value|benefit/.test(lower);
    const noExtreme = !/completely wrong|entirely useless|only one|must choose/i.test(lower);
    if (bothSides) items.push(t("task2.sim.fb212.bothOk"));
    else items.push(t("task2.sim.fb212.bothMiss"));
    if (noExtreme) items.push(t("task2.sim.fb212.balanceOk"));
    else items.push(t("task2.sim.fb212.balanceMiss"));
    sections.splice(1, 0, { icon: "⚖️", title: t("task2.sim.fb212.title"), ok: bothSides && noExtreme, items });
    return sections;
  },

  analyseTask2_221(text, sim) {
    const { sections, lower } = this.task2BaseSections(text, sim);
    const items = [];
    const hasStance = /i (?:strongly )?(?:agree|disagree|partly agree|partly disagree)|to a large extent|to some extent|in my opinion|i believe/.test(lower);
    const hasReason = /because|since|therefore|thus|as a result|lead to|for example|for instance/.test(lower);
    if (hasStance) items.push(t("task2.sim.fb221.stanceOk"));
    else items.push(t("task2.sim.fb221.stanceMiss"));
    if (hasReason) items.push(t("task2.sim.fb221.reasonOk"));
    else items.push(t("task2.sim.fb221.reasonMiss"));
    sections.splice(1, 0, { icon: "📝", title: t("task2.sim.fb221.title"), ok: hasStance && hasReason, items });
    return sections;
  },

  analyseTask2_222(text, sim) {
    const { sections, lower } = this.task2BaseSections(text, sim);
    const items = [];
    const hasAdv = /advantage|benefit|positive|helpful|convenient|enable/.test(lower);
    const hasDis = /disadvantage|drawback|negative|problem|harm|risk|concern/.test(lower);
    const hasJudge = /outweigh|balance|overall|on balance|more significant|less important/.test(lower);
    if (hasAdv) items.push(t("task2.sim.fb222.advOk"));
    else items.push(t("task2.sim.fb222.advMiss"));
    if (hasDis) items.push(t("task2.sim.fb222.disOk"));
    else items.push(t("task2.sim.fb222.disMiss"));
    if (hasJudge) items.push(t("task2.sim.fb222.judgeOk"));
    else items.push(t("task2.sim.fb222.judgeMiss"));
    sections.splice(1, 0, { icon: "⚖️", title: t("task2.sim.fb222.title"), ok: hasAdv && hasDis && hasJudge, items });
    return sections;
  },

  analyseTask2_23(text, sim) {
    const { sections, lower } = this.task2BaseSections(text, sim);
    const items = [];
    const hasCause = /cause|reason|because|due to|result from|lead to|factor/.test(lower);
    const hasSolution = /solution|measure|suggest|should|could|need to|action|policy|way to/.test(lower);
    const hasTwoPart = /first|second|on the one hand|causes|solutions|measures|problems/.test(lower);
    if (hasCause) items.push(t("task2.sim.fb23.causeOk"));
    else items.push(t("task2.sim.fb23.causeMiss"));
    if (hasSolution) items.push(t("task2.sim.fb23.solutionOk"));
    else items.push(t("task2.sim.fb23.solutionMiss"));
    if (hasTwoPart) items.push(t("task2.sim.fb23.twoPartOk"));
    else items.push(t("task2.sim.fb23.twoPartMiss"));
    sections.splice(1, 0, { icon: "📋", title: t("task2.sim.fb23.title"), ok: hasCause && hasSolution, items });
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
