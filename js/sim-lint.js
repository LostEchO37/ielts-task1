/* 模拟写作 · 拼写 / 语法 / 重复词检查（规则引擎，非 AI） */

const SimLint = {
  dict: null,

  /* 常见拼写错误 → 正确形式（含笔记里的典型错） */
  KNOWN_TYPOS: {
    dramatical: "dramatic / dramatically",
    substant: "substantial / substantially",
    significent: "significant / significantly",
    occured: "occurred",
    occuring: "occurring",
    recieve: "receive",
    seperate: "separate",
    definately: "definitely",
    goverment: "government",
    enviroment: "environment",
    develope: "develop",
    increas: "increase",
    decreas: "decrease",
    flucuate: "fluctuate",
    comparision: "comparison",
    similiar: "similar",
    similiarly: "similarly",
    althrough: "although",
    throught: "through / throughout",
    untilization: "utilisation",
    employement: "employment",
    popluation: "population",
    electicity: "electricity",
    producation: "production",
    consumpation: "consumption",
    expeniture: "expenditure",
    houshold: "household",
    significally: "significantly",
    gradualy: "gradually",
    steadyly: "steadily",
    sharpely: "sharply",
    approximatey: "approximately",
    respectivly: "respectively"
  },

  WHITELIST: new Set([
    "ielts", "uk", "gdp", "kwh", "percent", "percentile",
    "country", "countries", "city", "cities", "bro"
  ]),

  STOP_WORDS: new Set([
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "as", "is", "was", "were", "be", "been", "being", "have", "has", "had",
    "do", "does", "did", "will", "would", "could", "should", "may", "might", "must",
    "that", "this", "these", "those", "it", "its", "they", "them", "their", "there",
    "which", "who", "whom", "what", "when", "where", "while", "whereas", "however",
    "than", "then", "also", "both", "each", "other", "into", "over", "during", "between",
    "after", "before", "about", "through", "under", "above", "below", "not", "no", "nor",
    "so", "if", "up", "out", "all", "any", "some", "such", "only", "own", "same", "too",
    "very", "just", "can", "are", "am", "i", "we", "you", "he", "she", "his", "her", "our"
  ]),

  SYNONYMS: {
    increase: ["rise", "grow", "climb", "surge", "gain"],
    increased: ["rose", "grew", "climbed", "surged", "gained"],
    decrease: ["fall", "drop", "decline", "dip", "reduce"],
    decreased: ["fell", "dropped", "declined", "dipped", "reduced"],
    show: ["illustrate", "depict", "present", "demonstrate", "display"],
    shows: ["illustrates", "depicts", "presents", "demonstrates"],
    showed: ["illustrated", "depicted", "presented"],
    significant: ["considerable", "notable", "marked", "substantial"],
    significantly: ["considerably", "notably", "markedly", "substantially"],
    steady: ["stable", "consistent", "constant"],
    steadily: ["gradually", "consistently", "progressively"],
    sharply: ["dramatically", "rapidly", "steeply", "markedly"],
    slightly: ["marginally", "modestly", "somewhat"],
    highest: ["greatest", "largest", "peak", "top", "maximum"],
    lowest: ["smallest", "least", "minimum", "bottom"],
    period: ["timeframe", "span", "interval"],
    compared: ["relative to", "in comparison with"],
    however: ["nevertheless", "by contrast", "on the other hand"],
    overall: ["in general", "generally", "on the whole"],
    approximately: ["around", "roughly", "about", "some"]
  },

  GRAMMAR_RULES: [
    {
      re: /\bslowly\s+(rise|rose|increase|increased|grow|grew|fall|fell|decline|declined)\b/gi,
      msgKey: "sim.fb.slowlyErr"
    },
    {
      re: /\ba\s+slowly\b/gi,
      msgKey: "sim.fb.slowlyErr"
    },
    {
      re: /\b\d+\s+(millions|thousands|billions)\b/gi,
      msgKey: "sim.fb.pluralErr"
    },
    {
      re: /\bproduced\s+in\s+per\b|\bin\s+per\s+year\s+in\b/gi,
      msgKey: "sim.fb.inErr"
    },
    {
      re: /\bmore\s+(higher|lower|greater|less|larger|smaller)\b/gi,
      msgKey: "sim.fb.moreHigher"
    },
    {
      re: /\b(a|an)\s+(increase|decrease|rise|fall|growth|decline|drop|peak)\b/gi,
      msgKey: "sim.fb.articleTrend"
    },
    {
      re: /\bbetween\s+\d{4}\s+to\s+\d{4}\b/gi,
      msgKey: "sim.fb.betweenTo"
    },
    {
      re: /\bfrom\s+\d{4}\s+until\s+\d{4}\b/gi,
      msgKey: "sim.fb.fromUntil"
    },
    {
      re: /\b(increase|decrease|rise|fall|grow|decline)\s+(significant|dramatic|slight|steady|sharp|gradual)\b/gi,
      msgKey: "sim.fb.adjAfterVerb"
    },
    {
      re: /\b(there\s+is|there\s+was)\s+(increase|decrease|rise|fall)\b/gi,
      msgKey: "sim.fb.thereIsTrend"
    },
    {
      re: /\bdata\s+were\b/gi,
      msgKey: "sim.fb.dataWas"
    },
    {
      re: /\bamount\s+of\s+\w+\s+were\b/gi,
      msgKey: "sim.fb.amountWere"
    },
    {
      re: /\b(comparing|compare)\s+with\s+the\b/gi,
      msgKey: "sim.fb.compareWith"
    },
    {
      re: /\bit\s+can\s+be\s+seen\s+that\s+that\b/gi,
      msgKey: "sim.fb.doubleThat"
    },
    {
      re: /\b(in|on|at)\s+the\s+(\d{4})\s+year\b/gi,
      msgKey: "sim.fb.inTheYear"
    }
  ],

  /* 主谓一致 — 典型错误（I has / he have / they was 等） */
  SV_RULES: [
    { re: /\bi\s+has\b/gi, msgKey: "sim.fb.svIHas" },
    { re: /\bi\s+is\b/gi, msgKey: "sim.fb.svIIs" },
    { re: /\bi\s+are\b/gi, msgKey: "sim.fb.svIAre" },
    { re: /\bi\s+were\b/gi, msgKey: "sim.fb.svIWere" },
    { re: /\bi\s+does\b/gi, msgKey: "sim.fb.svIDoes" },
    { re: /\bi\s+doesn't\b/gi, msgKey: "sim.fb.svIDoesnt" },
    { re: /\bhe\s+have\b/gi, msgKey: "sim.fb.svHeHave" },
    { re: /\bhe\s+are\b/gi, msgKey: "sim.fb.svHeAre" },
    { re: /\bhe\s+were\b/gi, msgKey: "sim.fb.svHeWere" },
    { re: /\bshe\s+have\b/gi, msgKey: "sim.fb.svSheHave" },
    { re: /\bshe\s+are\b/gi, msgKey: "sim.fb.svSheAre" },
    { re: /\bshe\s+were\b/gi, msgKey: "sim.fb.svSheWere" },
    { re: /\bit\s+have\b/gi, msgKey: "sim.fb.svItHave" },
    { re: /\bit\s+are\b/gi, msgKey: "sim.fb.svItAre" },
    { re: /\bit\s+were\b/gi, msgKey: "sim.fb.svItWere" },
    { re: /\bthey\s+has\b/gi, msgKey: "sim.fb.svTheyHas" },
    { re: /\bthey\s+is\b/gi, msgKey: "sim.fb.svTheyIs" },
    { re: /\bthey\s+was\b/gi, msgKey: "sim.fb.svTheyWas" },
    { re: /\bwe\s+has\b/gi, msgKey: "sim.fb.svWeHas" },
    { re: /\bwe\s+is\b/gi, msgKey: "sim.fb.svWeIs" },
    { re: /\bwe\s+was\b/gi, msgKey: "sim.fb.svWeWas" },
    { re: /\byou\s+has\b/gi, msgKey: "sim.fb.svYouHas" },
    { re: /\byou\s+is\b/gi, msgKey: "sim.fb.svYouIs" },
    { re: /\byou\s+was\b/gi, msgKey: "sim.fb.svYouWas" },
    { re: /\b(graph|chart|figure|table|diagram|line graph)\s+(show|illustrate|depict|present|compare|give)\b(?!s)/gi, msgKey: "sim.fb.svGraphShow" },
    { re: /\b(coal|gas|oil|hydro|nuclear|population|electricity|spending|consumption|production)\s+have\b/gi, msgKey: "sim.fb.svSingularHave" },
    { re: /\b(figures|categories|countries|cities|sources|fuels|households)\s+has\b/gi, msgKey: "sim.fb.svPluralHas" },
    { re: /\bnumber\s+of\s+\w+\s+have\b/gi, msgKey: "sim.fb.svNumberHave" },
    { re: /\bpercentage\s+of\s+\w+\s+have\b/gi, msgKey: "sim.fb.svNumberHave" },
    { re: /\bamount\s+of\s+\w+\s+have\b/gi, msgKey: "sim.fb.svNumberHave" },
    { re: /\bdoesn't\s+(increased|decreased|rose|fell|grew|declined|changed)\b/gi, msgKey: "sim.fb.svDoesntPast" },
    { re: /\bdidn't\s+(increases|decreases|rises|falls|grows|declines)\b/gi, msgKey: "sim.fb.svDidntBase" },
    { re: /\bhas\s+(increase|decrease|rise|fall|grow|decline)\b/gi, msgKey: "sim.fb.svHasBase" },
    { re: /\bhave\s+(increases|decreases|shows|illustrates)\b/gi, msgKey: "sim.fb.svHaveThird" }
  ],

  initDict() {
    if (this.dict) return;
    const words = typeof SIM_DICT_WORDS !== "undefined" ? SIM_DICT_WORDS : [];
    this.dict = new Set(words.map((w) => w.toLowerCase()));
    this.WHITELIST.forEach((w) => this.dict.add(w));
  },

  levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    if (!m) return n;
    if (!n) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  },

  suggest(word) {
    this.initDict();
    const w = word.toLowerCase();
    if (this.KNOWN_TYPOS[w]) return this.KNOWN_TYPOS[w];
    let best = null;
    let bestDist = 3;
    for (const candidate of this.dict) {
      if (Math.abs(candidate.length - w.length) > 2) continue;
      if (candidate[0] !== w[0] && this.levenshtein(w, candidate) > 1) continue;
      const d = this.levenshtein(w, candidate);
      if (d < bestDist) {
        bestDist = d;
        best = candidate;
        if (d === 0) break;
      }
    }
    return best && bestDist <= 2 ? best : null;
  },

  tokenize(text) {
    return text.match(/[a-zA-Z']+/g) || [];
  },

  checkSpelling(text) {
    this.initDict();
    const seen = new Map();
    const errors = [];

    this.tokenize(text).forEach((raw) => {
      const clean = raw.toLowerCase().replace(/'/g, "");
      if (clean.length < 3 || /^\d+$/.test(clean)) return;
      if (this.WHITELIST.has(clean) || this.dict.has(clean)) return;
      if (this.KNOWN_TYPOS[clean]) {
        if (!seen.has(clean)) {
          seen.set(clean, true);
          errors.push({ word: raw, suggestion: this.KNOWN_TYPOS[clean], known: true });
        }
        return;
      }
      const sug = this.suggest(clean);
      if (sug && sug !== clean) {
        if (!seen.has(clean)) {
          seen.set(clean, true);
          errors.push({ word: raw, suggestion: sug, known: false });
        }
      }
    });

    return errors.slice(0, 12);
  },

  checkRepetition(text) {
    const freq = new Map();
    this.tokenize(text).forEach((raw) => {
      const w = raw.toLowerCase();
      if (w.length < 4 || this.STOP_WORDS.has(w)) return;
      freq.set(w, (freq.get(w) || 0) + 1);
    });

    const repeated = [];
    freq.forEach((count, word) => {
      if (count >= 4) {
        const alts = (this.SYNONYMS[word] || []).filter((a) => !freq.has(a.split(" ")[0]));
        repeated.push({ word, count, alternatives: alts.slice(0, 4) });
      }
    });

    return repeated.sort((a, b) => b.count - a.count).slice(0, 6);
  },

  checkGrammar(text) {
    const lower = text.toLowerCase();
    const items = [];
    const seen = new Set();

    const applyRules = (rules) => {
      rules.forEach(({ re, msgKey }) => {
        re.lastIndex = 0;
        let m;
        while ((m = re.exec(lower)) !== null) {
          const key = msgKey + m[0];
          if (!seen.has(key)) {
            seen.add(key);
            items.push(t(msgKey));
          }
        }
      });
    };

    applyRules(this.GRAMMAR_RULES);
    applyRules(this.SV_RULES);

    if (/\bdramatical\b/i.test(text)) items.push(t("sim.fb.dramatical"));
    if (/\bsubstant\b/i.test(text)) items.push(t("sim.fb.substant"));

    return items;
  },

  run(text) {
    return {
      spelling: this.checkSpelling(text),
      repetition: this.checkRepetition(text),
      grammar: this.checkGrammar(text)
    };
  }
};
