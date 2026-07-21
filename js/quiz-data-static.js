/* 静态图题库 — 合并至 QUIZ_BANK */

(function () {
  const STATIC_QUIZ = {
    static_step1: {
      title: "静态图 · 第一步 · 三要素",
      questions: [
        {
          id: "st-s1-1", difficulty: 1, type: "choice",
          chart: "../assets/charts/static/quiz/q-step1-bar.png",
          question: "看上图（无时间轴的柱状图），描述数据时最稳妥的时态是？",
          options: ["一般现在时", "一般过去时", "将来时", "现在完成进行时"],
          answer: 0,
          explain: "笔记（红）：静态图<strong>无时间用现在</strong>。",
          feedbackCorrect: "无时间轴 → 现在时，稳 🎯",
          feedbackWrong: "静态图没给年份，别乱用过去时 ⏰"
        },
        {
          id: "st-s1-2", difficulty: 1, type: "judge",
          question: "静态图找三要素（时态、单位、主语）与动态图基本一致。",
          answer: true,
          explain: "笔记：步① 时态+单位+主语，与动态图基本一致。",
          feedbackCorrect: "基本功一样，只是时态默认不同 ✓",
          feedbackWrong: "笔记写了「基本一致」哦 📒"
        },
        {
          id: "st-s1-3", difficulty: 2, type: "choice",
          chart: "../assets/charts/static/quiz/q-step1-bar.png",
          question: "上图 Y 轴为 Percentage (%)，写作时应？",
          options: ["忽略单位只写数字", "交代 percentage / proportion 等单位", "一律写 per year", "只写 thousand"],
          answer: 1,
          explain: "单位看轴/表头，与动态图相同。",
          feedbackCorrect: "单位是数字的身份证 🪪",
          feedbackWrong: "百分比图要说明是 % 或 proportion 📊"
        },
        {
          id: "st-s1-4", difficulty: 2, type: "fill",
          chart: "../assets/charts/static/quiz/q-step1-bar.png",
          question: "题干 The bar chart ______ the preferred transport modes… 主语常在 show/illustrates 附近找，此处核心对象是______。",
          answer: ["transport", "transport modes", "modes"],
          explain: "主语在 show 后或小标题里找。",
          feedbackCorrect: "transport modes 抓对了 🚌",
          feedbackWrong: "回题干找 show 后面的核心名词 👀"
        },
        {
          id: "st-s1-5", difficulty: 3, type: "choice",
          chart: "../assets/charts/static/quiz/q-step1-bar.png",
          question: "【陷阱】静态图只有单一年份 2023，能否写 over a span of 20 years？",
          options: ["不能，无时间跨度", "可以，随便写", "必须写将来时", "只能写 table"],
          answer: 0,
          explain: "无时间变化不写跨度；静态图用现在时描述当下比例/数量。",
          feedbackCorrect: "没跨度别硬编 years 🚫",
          feedbackWrong: "单一时间点 ≠ 20 年跨度 🪤"
        }
      ]
    },

    static_step2: {
      title: "静态图 · 第二步 · 主体分段",
      questions: [
        {
          id: "st-s2-1", difficulty: 1, type: "choice",
          chart: "../assets/charts/static/quiz/q-step2-table.png",
          question: "笔记表格：Gender 2 项，Age 3 项。应按哪一类分段？",
          options: ["按 Age（3 段）", "按 Gender 男/女（2 段）", "每个格子一段", "只写最高"],
          answer: 1,
          explain: "笔记（☆）：主体分段按<strong>少的项目</strong> → 按男/女，一类一段。",
          feedbackCorrect: "少的项目分段，男 1 段女 1 段 ⭐",
          feedbackWrong: "2 项 vs 3 项 → 选 2 项那个分段 📐"
        },
        {
          id: "st-s2-2", difficulty: 1, type: "judge",
          chart: "../assets/charts/static/quiz/q-step2-table.png",
          question: "按 Gender 分段时：男段写 Male 各行数据，女段写 Female 各行数据。",
          answer: true,
          explain: "例：男 1 段（<20、20–30、>30 都在男段内分析），女 1 段同理。",
          feedbackCorrect: "一类一段，段内再配对 ✓",
          feedbackWrong: "按性别分段 = 段内写该性别所有年龄 📋"
        },
        {
          id: "st-s2-3", difficulty: 2, type: "choice",
          chart: "../assets/charts/static/quiz/q-step2-table.png",
          question: "Male 在 <20 与 20–30 均为 20，在 >30 为 10。分段后这些数字应写在？",
          options: ["男段（第一段）", "女段", "开头段", "不写具体数"],
          answer: 0,
          explain: "按少的项目分段后，该类别所有数据在同一段分析。",
          feedbackCorrect: "男的数据归男段 👨",
          feedbackWrong: "数字跟着分段走，别散 📍"
        },
        {
          id: "st-s2-4", difficulty: 2, type: "judge",
          chart: "../assets/charts/static/quiz/q-step2-table.png",
          question: "若 Transport 4 项、Region 2 项，应按 Region 分 2 段。",
          answer: true,
          explain: "始终选项目少的那一维分段。",
          feedbackCorrect: "2 < 4，按 Region ✓",
          feedbackWrong: "少的项目 — 2 项那段维度 🧭"
        },
        {
          id: "st-s2-5", difficulty: 3, type: "choice",
          chart: "../assets/charts/static/quiz/q-step2-table.png",
          question: "【陷阱】能否按 Age 分 3 段、每段里再比男女？",
          options: ["可以但笔记推荐按少的项目", "笔记禁止", "只能写一段", "必须 pie chart"],
          answer: 0,
          explain: "笔记强调按少的项目；按 Age 3 段不是首选写法。",
          feedbackCorrect: "能写但笔记首推按 Gender 2 段 🎯",
          feedbackWrong: "笔记星标：按少的项目 ⭐"
        }
      ]
    },

    static_step3: {
      title: "静态图 · 第三步 · 数据分析",
      questions: [
        {
          id: "st-s3-1", difficulty: 1, type: "choice",
          chart: "../assets/charts/static/quiz/q-step3-table.png",
          question: "静态图步③核心方法是？",
          options: ["先比起点再比趋势", "配对 + 找联系（最值/相似/相差/倍数）", "只写最高", "只写 Overall"],
          answer: 1,
          explain: "笔记：配对+找联系（最值/相似/相差/倍数）。",
          feedbackCorrect: "配对找联系，静态图灵魂 🔗",
          feedbackWrong: "那是动态图步③，静态要配对 📊"
        },
        {
          id: "st-s3-2", difficulty: 1, type: "judge",
          chart: "../assets/charts/static/quiz/q-step3-table.png",
          question: "笔记（红）：尽量将全部数据相互关联，并要有具体数字。",
          answer: true,
          explain: "红字强调：相互关联 + 具体数字。",
          feedbackCorrect: "关联+数字，分析才密 🔢",
          feedbackWrong: "红字两条都要满足 ❗"
        },
        {
          id: "st-s3-3", difficulty: 2, type: "choice",
          chart: "../assets/charts/static/quiz/q-step3-table.png",
          question: "男段：<20 与 20–30 均为 20，>30 为 10。最贴笔记的写法？",
          options: ["男里 <20 与 20–30 相等为 20，为 >30 的 2 倍", "男里都在上升", "男里最高", "不写数字"],
          answer: 0,
          explain: "笔记例：相等 + 倍数关系，带具体数字。",
          feedbackCorrect: "相等+两倍，笔记范例 📝",
          feedbackWrong: "看笔记例句：20 与 20 相等，是 10 的 2 倍"
        },
        {
          id: "st-s3-4", difficulty: 2, type: "choice",
          chart: "../assets/charts/static/quiz/q-step3-table.png",
          question: "女段：20–30 岁 11 人，>30 岁 9 人，关系是？",
          options: ["相似（11 和 9）", "完全相等", "无法比较", "男段内容"],
          answer: 0,
          explain: "笔记例：20~30 与 >30 相似，分别为 11 和 9。",
          feedbackCorrect: "11 与 9 → 相似 ✓",
          feedbackWrong: "笔记写了「相似，分别为 11 和 9」"
        },
        {
          id: "st-s3-5", difficulty: 3, type: "judge",
          chart: "../assets/charts/static/quiz/q-step3-table.png",
          question: "【陷阱】静态图段内只写「A is higher than B」而不给数字也可以。",
          answer: false,
          explain: "笔记红字：要有具体数字。",
          feedbackCorrect: "没数字 = 没踩中笔记 🎯",
          feedbackWrong: "红字：要有具体数字！🔴"
        }
      ]
    },

    static_bonus: {
      title: "静态图 · 五大加分点",
      questions: [
        {
          id: "st-b1-1", difficulty: 1, type: "judge",
          question: "静态图主语多样性：照抄+同替+万能+数字，与动态图一致。",
          answer: true,
          explain: "加分点1：与动态图一致。",
          feedbackCorrect: "主语四套打法通用 ✓",
          feedbackWrong: "笔记写与动态图一致 📒"
        },
        {
          id: "st-b1-2", difficulty: 1, type: "choice",
          question: "静态图<strong>不能</strong>用动态图哪类主语写法？",
          options: ["the figure for …", "照抄题干主语", "时间句大法（The xx-year period witnessed…）", "数字作主语"],
          answer: 2,
          explain: "笔记（红）：无时间变化，无法使用时间句大法。",
          feedbackCorrect: "没时间轴就别 witnessed 了 ⏰🚫",
          feedbackWrong: "红字：无时间变化 → 不用时间句"
        },
        {
          id: "st-b2-1", difficulty: 2, type: "fill",
          chart: "../assets/charts/static/quiz/q-bonus-grouped.png",
          question: "A and B shared ______ figures in spending, at 22 and 26 respectively.",
          answer: ["similar", "comparable"],
          explain: "相似：shared similar/comparable figures… at xx and xx respectively.",
          feedbackCorrect: "similar / comparable 双杀 🤝",
          feedbackWrong: "笔记：shared similar/comparable figures"
        },
        {
          id: "st-b3-1", difficulty: 2, type: "choice",
          chart: "../assets/charts/static/quiz/q-bonus-grouped.png",
          question: "A is 40, B is 20。倍数句正确的是？",
          options: ["A is double that of B", "A is double than B", "A double B", "A is more double"],
          answer: 0,
          explain: "笔记：which is double/triple/quadruple/xx times that (of) B",
          feedbackCorrect: "double that (of) B ✓",
          feedbackWrong: "笔记模板：double that (of) B"
        },
        {
          id: "st-b4-1", difficulty: 2, type: "choice",
          question: "段间衔接（主2段）笔记推荐开头？",
          options: ["In terms of xxx, it is apparent that…", "In 1990,", "The graph increased", "Firstly secondly"],
          answer: 0,
          explain: "段间衔接：主2段 In terms of xxx…",
          feedbackCorrect: "In terms of — 主2段万能 🔗",
          feedbackWrong: "主2段公式：In terms of xxx…"
        },
        {
          id: "st-b5-1", difficulty: 3, type: "choice",
          chart: "../assets/charts/static/quiz/q-bonus-pie.png",
          question: "占比表达笔记<strong>推荐（荐）</strong>用？",
          options: ["taking up xx% (of ~)", "increased sharply", "over 20 years", "witnessed a rise"],
          answer: 0,
          explain: "占比（荐）：taking up xx% (of ~)",
          feedbackCorrect: "taking up xx% — 笔记荐 ⭐",
          feedbackWrong: "红圈荐：taking up xx%"
        }
      ]
    },

    static_formulas: {
      title: "静态图 · 公式段",
      questions: [
        {
          id: "st-f1-1", difficulty: 1, type: "judge",
          question: "静态图开头段应照搬动态图的 the changes in … over a span of xx years。",
          answer: false,
          explain: "静态图开头用 differences between / shows / compares 描述对比，勿写 changes in（除非题干明确有时间跨度）。",
          feedbackCorrect: "静态图勿照搬 changes in ✓",
          feedbackWrong: "静态图开头写 differences between，不是 changes in"
        },
        {
          id: "st-f1-2", difficulty: 1, type: "choice",
          question: "笔记推荐整文结构顺序？",
          options: ["先写开头（一段）+ 总结（一段），再写主体段", "先主体后开头", "只写主体", "先结尾后开头"],
          answer: 0,
          explain: "推荐先写开头（一段）和总结（一段），再写主体段以求保险。",
          feedbackCorrect: "开头段 + 总结段先写，再主体 🛡️",
          feedbackWrong: "另注：先写开头段和总结段，再写主体段"
        },
        {
          id: "st-f1-3", difficulty: 2, type: "judge",
          chart: "../assets/charts/static/quiz/q-formulas-table.png",
          question: "静态 table 开头可用：The table illustrates the amount of milk produced in four countries.",
          answer: true,
          explain: "静态 table 用 illustrates/shows 描述各国数据对比，不写 changes in over years。",
          feedbackCorrect: "table illustrates 描述对比 ✓",
          feedbackWrong: "静态 table 写 illustrates … in four countries"
        },
        {
          id: "st-f1-4", difficulty: 2, type: "choice",
          question: "静态 bar chart（无年份）开头更贴笔记的是？",
          options: ["The bar chart shows the percentage of transport modes in City X.", "The bar chart illustrates the changes in transport over 20 years.", "The bar chart will increase.", "The bar chart witnessed a rise."],
          answer: 0,
          explain: "无时间变化用 shows/illustrates 描述当下数据，不用 changes in / changes over years。",
          feedbackCorrect: "shows 当下比例，稳 📊",
          feedbackWrong: "没跨度别写 changes in / changes over years"
        },
        {
          id: "st-f1-5", difficulty: 3, type: "choice",
          question: "静态图 Overall 段应优先写？",
          options: ["明显占比或最大差值（最高/最低/差距）", "总体 upward/downward trend", "with the exception of … which declined", "over a span of 20 years"],
          answer: 0,
          explain: "静态图无趋势；Overall 写占比（taking up xx% / largest proportion）或最大差值（gap / nearly double）。",
          feedbackCorrect: "占比或最大差值，不是趋势 🏁",
          feedbackWrong: "静态 Overall 写占比/最大差值，勿写 trend"
        }
      ]
    }
  };

  Object.assign(QUIZ_BANK, STATIC_QUIZ);
})();
