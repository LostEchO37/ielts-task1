/* 练习引擎 — 我会了 */

const QUIZ_MODULE_KEYS = {
  step1: "nav.step1", step2: "nav.step2", step3: "nav.step3",
  language: "nav.language", bonus: "nav.bonus", formulas: "nav.formulas",
  static_step1: "static.nav.step1", static_step2: "static.nav.step2",
  static_step3: "static.nav.step3", static_bonus: "static.nav.bonus",
  static_formulas: "static.nav.formulas",
  t2_method: "task2.nav.method"
};

function quizMeme(type, id) {
  const pool = (type === "wrong"
    ? ["🤡💦", "🫠📉", "😭👍", "🙃🪤", "💀📝", "🐶❓", "😅🔥", "🥲🫠", "🐱❌", "😵‍💫"]
    : ["🐶👍", "💀🫡", "🔥✨", "🗿👍", "😎🎉", "🥹❤️", "✨🫵", "👑🐸", "🐱👍", "💯🫡"]);
  let emoji;
  if (typeof MemePool !== "undefined") {
    emoji = MemePool.pick(type, id);
  } else {
    let idx = Math.floor(Math.random() * pool.length);
    if (id) {
      let h = 0;
      for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
      idx = h % pool.length;
    }
    emoji = pool[idx];
  }
  return `<div class="fb-meme" aria-hidden="true">${emoji}</div>`;
}

const QuizEngine = {
  module: null,
  moduleId: null,
  difficulty: null,
  mode: "normal",
  questions: [],
  index: 0,
  score: 0,
  sessionWrong: [],
  newBadges: [],
  _bound: false,

  title() {
    return t(QUIZ_MODULE_KEYS[this.moduleId] || "quiz.fab");
  },

  init(moduleId, opts) {
    if (!UserStore.current()) {
      UserUI.requireUser(() => this.init(moduleId, opts));
      return;
    }
    this.moduleId = moduleId;
    this.module = QUIZ_BANK[moduleId];
    if (!this.module) return;
    if (opts && opts.mode === "wrongbook") {
      this.startWrongBook(opts.questionIds);
      return;
    }
    this.mode = "normal";
    this.showPicker();
  },

  showPicker() {
    const wrongN = UserStore.wrongCount(this.moduleId);
    const wrongBtn = wrongN
      ? `<button class="quiz-wrongbook-btn">📕 ${t("quiz.wrongbook")} (${wrongN})</button>` : "";

    const overlay = document.getElementById("quiz-overlay");
    if (!overlay) return;
    overlay.classList.add("open");
    overlay.innerHTML = `
      <div class="quiz-panel">
        <button class="quiz-close" aria-label="close">&times;</button>
        <h2 class="quiz-title">${this.title()}</h2>
        <p class="quiz-sub">${t("quiz.pickDiff")}</p>
        <div class="quiz-difficulty">
          <button data-d="1" class="diff-btn"><span class="stars">★</span><span>${t("quiz.diff1")}</span></button>
          <button data-d="2" class="diff-btn"><span class="stars">★★</span><span>${t("quiz.diff2")}</span></button>
          <button data-d="3" class="diff-btn"><span class="stars">★★★</span><span>${t("quiz.diff3")}</span></button>
        </div>
        ${wrongBtn}
        <p class="quiz-tip">${t("quiz.tip")}</p>
      </div>`;
    overlay.querySelector(".quiz-close").onclick = () => this.close();
    overlay.querySelectorAll(".diff-btn").forEach((btn) => {
      btn.onclick = () => this.start(parseInt(btn.dataset.d, 10));
    });
    const wb = overlay.querySelector(".quiz-wrongbook-btn");
    if (wb) wb.onclick = () => this.startWrongBook();
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };
  },

  startWrongBook(questionIds) {
    this.mode = "wrongbook";
    this.difficulty = 0;
    const overlay = document.getElementById("quiz-overlay");
    if (!overlay) return;
    const list = UserStore.getWrongList(this.moduleId);
    const ids = questionIds || list.map((w) => w.questionId);
    this.questions = ids
      .map((id) => UserStore.findQuestion(this.moduleId, id))
      .filter(Boolean);
    if (!this.questions.length) {
      alert(t("wrongbook.emptyModule"));
      if (this.module) this.showPicker();
      return;
    }
    overlay.classList.add("open");
    this.questions = this.shuffle(this.questions);
    this.index = 0;
    this.score = 0;
    this.sessionWrong = [];
    this.newBadges = [];
    this.renderQuestion();
  },

  start(difficulty) {
    this.mode = "normal";
    this.difficulty = difficulty;
    const pool = this.module.questions.filter((q) => q.difficulty === difficulty);
    this.questions = this.shuffle(pool).slice(0, Math.min(5, pool.length));
    if (!this.questions.length) {
      this.questions = this.shuffle(this.module.questions).slice(0, 4);
    }
    this.index = 0;
    this.score = 0;
    this.sessionWrong = [];
    this.newBadges = [];
    this.renderQuestion();
  },

  renderQuestion() {
    const q = this.questions[this.index];
    const total = this.questions.length;
    const overlay = document.getElementById("quiz-overlay");
    if (!overlay) return;
    overlay.classList.add("open");
    const modeTag = this.mode === "wrongbook"
      ? `<div class="quiz-mode-tag">📕 ${t("quiz.wrongMode")}</div>` : "";
    const chartHtml = q.chart
      ? `<div class="quiz-chart"><img src="${q.chart}" alt="chart"></div>` : "";

    let inputHtml = "";
    if (q.type === "choice") {
      inputHtml = `<div class="quiz-options">${q.options.map((o, i) =>
        `<label class="quiz-option"><input type="radio" name="ans" value="${i}"><span>${loc(o)}</span></label>`
      ).join("")}</div>`;
    } else if (q.type === "judge") {
      inputHtml = `<div class="quiz-options judge">
        <label class="quiz-option"><input type="radio" name="ans" value="true"><span>${t("quiz.judge.true")}</span></label>
        <label class="quiz-option"><input type="radio" name="ans" value="false"><span>${t("quiz.judge.false")}</span></label>
      </div>`;
    } else if (q.type === "fill") {
      inputHtml = `<input type="text" class="quiz-fill" placeholder="${t("quiz.fillPh")}" autocomplete="off">`;
    }

    const diffStars = this.difficulty ? " " + "★".repeat(this.difficulty) : "";

    overlay.innerHTML = `
      <div class="quiz-panel quiz-active">
        <button class="quiz-close">&times;</button>
        ${modeTag}
        <div class="quiz-progress">${t("quiz.progress", { n: this.index + 1, t: total })}${diffStars}</div>
        ${chartHtml}
        <div class="quiz-question">${Settings.get("lang") === "zh-TW" ? Settings.convertHtmlToTraditional(q.question) : q.question}</div>
        ${inputHtml}
        <button class="quiz-submit">${t("quiz.submit")}</button>
        <div class="quiz-feedback hidden"></div>
      </div>`;

    overlay.querySelector(".quiz-close").onclick = () => this.close();
    overlay.querySelector(".quiz-submit").onclick = () => this.checkAnswer(q);
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };

    const fill = overlay.querySelector(".quiz-fill");
    if (fill) fill.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.checkAnswer(q);
    });
  },

  checkAnswer(q) {
    const fb = document.querySelector(".quiz-feedback");
    const submit = document.querySelector(".quiz-submit");
    let correct = false;

    if (q.type === "choice") {
      const sel = document.querySelector('input[name="ans"]:checked');
      if (!sel) {
        fb.className = "quiz-feedback show warn";
        fb.innerHTML = `${quizMeme("wrong", "warn")}<div class="fb-text">${t("quiz.warn.pick")}</div>`;
        return;
      }
      correct = parseInt(sel.value, 10) === q.answer;
    } else if (q.type === "judge") {
      const sel = document.querySelector('input[name="ans"]:checked');
      if (!sel) {
        fb.className = "quiz-feedback show warn";
        fb.innerHTML = `${quizMeme("wrong", "warn2")}<div class="fb-text">${t("quiz.warn.judge")}</div>`;
        return;
      }
      correct = (sel.value === "true") === q.answer;
    } else if (q.type === "fill") {
      const userVal = document.querySelector(".quiz-fill").value.trim().toLowerCase();
      if (!userVal) {
        fb.className = "quiz-feedback show warn";
        fb.innerHTML = `${quizMeme("wrong", "warn3")}<div class="fb-text">${t("quiz.warn.fill")}</div>`;
        return;
      }
      const answers = Array.isArray(q.answer) ? q.answer : [q.answer];
      correct = answers.some((a) => userVal.includes(a.toLowerCase()));
    }

    if (correct) {
      this.score++;
      UserStore.removeWrong(this.moduleId, q.id);
      UserStore.markQuestionMastered(this.moduleId, q.id);
      UserStore.checkAndAwardBadges(this.moduleId).forEach((id) => {
        if (!this.newBadges.includes(id)) this.newBadges.push(id);
      });
    } else {
      UserStore.addWrong(this.moduleId, q.id);
      this.sessionWrong.push(q.id);
    }
    UserUI.refreshSidebar();

    const memeHtml = quizMeme(correct ? "correct" : "wrong", q.id);
    const msg = loc(correct ? q.feedbackCorrect : q.feedbackWrong);
    const explain = Settings.get("lang") === "zh-TW"
      ? Settings.convertHtmlToTraditional(q.explain) : q.explain;
    fb.className = `quiz-feedback show ${correct ? "ok" : "fail"}`;
    fb.innerHTML = `
      ${memeHtml}
      <div class="fb-text">${msg}</div>
      <div class="fb-explain">${explain}</div>`;

    submit.textContent = this.index < this.questions.length - 1 ? t("quiz.next") : t("quiz.result");
    submit.onclick = () => {
      if (this.index < this.questions.length - 1) {
        this.index++;
        this.renderQuestion();
      } else {
        this.showResult();
      }
    };

    document.querySelectorAll(".quiz-option input, .quiz-fill").forEach((el) => { el.disabled = true; });
  },

  showResult() {
    const total = this.questions.length;
    const pct = Math.round((this.score / total) * 100);
    const qIds = this.questions.map((q) => q.id);

    UserStore.recordSession(this.moduleId, this.difficulty, this.score, total, qIds);

    if (typeof SiteAnalytics !== "undefined") {
      SiteAnalytics.trackEvent("quiz_complete", {
        moduleId: this.moduleId,
        difficulty: this.difficulty,
        score: this.score,
        total,
        pct
      });
    }

    let msgKey = "quiz.result.low";
    if (pct === 100) msgKey = "quiz.result.perfect";
    else if (pct >= 75) msgKey = "quiz.result.good";
    else if (pct >= 50) msgKey = "quiz.result.mid";

    const memeHtml = quizMeme(pct >= 75 ? "correct" : "wrong", "result-" + pct);
    const badgeHtml = this.newBadges.length
      ? `<div class="result-badges">${this.newBadges.map((k) => {
          const meta = UserStore.getBadgeMeta(k);
          if (!meta) return "";
          return `<div class="result-badge-item"><span>${meta.icon}</span><strong>${UserStore.getBadgeTitle(k)}</strong><p>${t("badge.newUnlock")}</p></div>`;
        }).join("")}</div>`
      : `<p class="result-badge-hint">${t("quiz.badgeProgress", {
        done: UserStore.getModuleProgress(this.moduleId).done,
        total: UserStore.getModuleProgress(this.moduleId).total
      })}</p>`;

    const overlay = document.getElementById("quiz-overlay");
    overlay.innerHTML = `
      <div class="quiz-panel quiz-result">
        <button class="quiz-close">&times;</button>
        ${memeHtml}
        <h2>${this.score} / ${total} ${t("quiz.score")}</h2>
        <p>${t(msgKey)}</p>
        ${badgeHtml}
        <div class="result-actions">
          <button class="quiz-retry">${t("quiz.retry")}</button>
          <button class="quiz-done">${t("quiz.done")}</button>
        </div>
      </div>`;
    overlay.querySelector(".quiz-close").onclick = () => this.close();
    overlay.querySelector(".quiz-done").onclick = () => this.close();
    overlay.querySelector(".quiz-retry").onclick = () => {
      if (this.mode === "wrongbook") this.startWrongBook();
      else this.showPicker();
    };
    overlay.onclick = (e) => { if (e.target === overlay) this.close(); };
    UserUI.refreshSidebar();
  },

  close() {
    document.getElementById("quiz-overlay").classList.remove("open");
  },

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
};

(function initQuizUi() {
  if (!document.getElementById("quiz-overlay")) {
    document.body.insertAdjacentHTML("beforeend", '<div id="quiz-overlay"></div>');
  }

  if (QuizEngine._bound) return;
  QuizEngine._bound = true;

  document.addEventListener("click", (e) => {
    const fab = e.target.closest(".quiz-fab");
    if (fab && fab.dataset.module) {
      e.preventDefault();
      QuizEngine.init(fab.dataset.module);
      return;
    }

    const wbPractice = e.target.closest(".wb-practice-btn");
    if (wbPractice && wbPractice.dataset.module && document.getElementById("wrongbook-content")) {
      e.preventDefault();
      QuizEngine.init(wbPractice.dataset.module, { mode: "wrongbook" });
      return;
    }

    const overlay = document.getElementById("quiz-overlay");
    if (!overlay || !overlay.classList.contains("open")) return;

    if (e.target.closest(".quiz-close")) {
      e.preventDefault();
      QuizEngine.close();
      return;
    }
    if (e.target === overlay) {
      QuizEngine.close();
      return;
    }

    const diffBtn = e.target.closest(".diff-btn");
    if (diffBtn) {
      e.preventDefault();
      QuizEngine.start(parseInt(diffBtn.dataset.d, 10));
      return;
    }
    if (e.target.closest(".quiz-wrongbook-btn")) {
      e.preventDefault();
      QuizEngine.startWrongBook();
      return;
    }
    if (e.target.closest(".quiz-retry")) {
      e.preventDefault();
      if (QuizEngine.mode === "wrongbook") QuizEngine.startWrongBook();
      else QuizEngine.showPicker();
      return;
    }
    if (e.target.closest(".quiz-done")) {
      e.preventDefault();
      QuizEngine.close();
    }
  }, true);
})();
