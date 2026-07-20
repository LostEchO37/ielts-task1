/* 题库 — 内容均来自笔记，不含自编知识点 */

const QUIZ_BANK = {
  step1: {
    title: "第一步 · 三要素",
    questions: [
      {
        id: "s1-1", difficulty: 1, type: "choice",
        chart: "assets/charts/quiz/q-step1-read.png",
        question: "看上图，<strong>时态</strong>应根据什么来判断？",
        options: ["图表标题的颜色", "图表上的时间信息", "图例字母个数", "Y 轴最大值"],
        answer: 1,
        explain: "笔记：时态 → 根据图表时间判断。",
        feedbackCorrect: "稳！时间轴就是你的时态指南针 🧭",
        feedbackWrong: "时态看时间，不是看颜色啦……回去瞄一眼 X 轴 ⏰"
      },
      {
        id: "s1-2", difficulty: 1, type: "judge",
        question: "笔记写法：<em>7 thousands</em> 是正确的数量表达。",
        answer: false,
        explain: "批注：7 thousand (million) <strong>没有 s</strong>。",
        feedbackCorrect: "哈！这个陷阱被你识破了 🕵️",
        feedbackWrong: "千/百万后面不加 s，考官看了想扶额 🤦"
      },
      {
        id: "s1-3", difficulty: 2, type: "choice",
        chart: "assets/charts/quiz/q-step1-read.png",
        question: "结合上图，主语通常在哪里找？",
        options: ['题干 "show" 之后', "Y 轴刻度旁", "图例最后一项", "随机选一个类别"],
        answer: 0,
        explain: "笔记：主语在 \"show\" 后或小标题里找。",
        feedbackCorrect: "show 后面藏着的往往是主语线索 ✨",
        feedbackWrong: "别跟 Y 轴刻度私奔了，回题干找 show 👀"
      },
      {
        id: "s1-4", difficulty: 2, type: "fill",
        chart: "assets/charts/quiz/q-step1-read.png",
        question: "看上图 Y 轴标注 thousands。若 Y 轴从 100 到 1000，写作时应把数值与______一起交代清楚。",
        answer: ["单位", "unit"],
        explain: "笔记：单位 — 如 100 → 1000（看图表轴/表头）。",
        feedbackCorrect: "单位不写，数字就像裸奔 🏃",
        feedbackWrong: "数字要穿衣服——单位别漏 👔"
      },
      {
        id: "s1-5", difficulty: 3, type: "choice",
        chart: "assets/charts/quiz/q-time-1990.png",
        question: "【陷阱】上图时间为 1990–2010，描述 2005 年数据时，最稳妥的时态策略是？",
        options: ["全部用将来时", "根据具体时间用过去时/现在完成等", "一律现在时", "不用动词"],
        answer: 1,
        explain: "动态图时态随图表时间而定，过去时间多用过去时。",
        feedbackCorrect: "时态拿捏了，考官点头如捣蒜 🫡",
        feedbackWrong: "1990–2010 不是未来预告片啊 🎬"
      }
    ]
  },

  step2: {
    title: "第二步 · 主体分段",
    questions: [
      {
        id: "s2-1", difficulty: 1, type: "choice",
        chart: "assets/charts/quiz/q-mixed-trend.png",
        question: "按<strong>法 1（总趋势）</strong>，练习图 A 中 P、Q 应如何分段？",
        options: ["P Q 各写一段", "P Q 同为上升 → 一段", "P Q 不能写在一起", "只看 2000 年"],
        answer: 1,
        explain: "法1：AB 上升为一段，CD 下降为一段（只看起终点趋势）。",
        feedbackCorrect: "PQ 手拉手，同升一段走 🚶‍♂️🚶‍♀️",
        feedbackWrong: "PQ 都往上爬呢，别拆散它们 💔"
      },
      {
        id: "s2-2", difficulty: 1, type: "judge",
        chart: "assets/charts/quiz/q-mixed-trend.png",
        question: "法 1 分段时，R 和 S 可以合并为一段（均为下降趋势）。",
        answer: true,
        explain: "法1：CD — 一段（降）。",
        feedbackCorrect: "双降合璧，一段搞定 ✅",
        feedbackWrong: "R S 都往下溜，笔记说合成一段 📉"
      },
      {
        id: "s2-3", difficulty: 2, type: "choice",
        chart: "assets/charts/quiz/q-interval-1.png",
        question: "按<strong>法 2（区间）</strong>，练习图 B 中哪一组应单独成段？",
        options: ["B 和 C（中间波动）", "A 最高 & D 最低", "只有 A", "四条线各一段"],
        answer: 1,
        explain: "例1：段1 A 最高、D 最低；段2 B C 差不多。",
        feedbackCorrect: "最高最低站 C 位，BC 中间缠缠绵绵 🎯",
        feedbackWrong: "法2 例1：先抓一直最高和一直最低 👑"
      },
      {
        id: "s2-4", difficulty: 2, type: "choice",
        chart: "assets/charts/quiz/q-interval-2.png",
        question: "练习图 C 符合笔记中哪种分段示例？",
        options: ["例1：A 最高 D 最低", "例2：AB 较高，CD 较低", "法1：按总趋势", "无法分段"],
        answer: 1,
        explain: "例2：AB 在 60~100，CD 在 0~40。",
        feedbackCorrect: "AB 高 CD 低，例2 对号入座 🪑",
        feedbackWrong: "看图：上面 AB 扎堆高，下面 CD 趴窝低 📊"
      },
      {
        id: "s2-5", difficulty: 3, type: "judge",
        chart: "assets/charts/quiz/q-trap-flat.png",
        question: "【陷阱】练习图 E 中，因为 A、C、D 几乎平坦，所以应按法 1 把 ACD 合成「上升段」。",
        answer: false,
        explain: "法1 看起终点总趋势；ACD 起终点接近，并非明显上升；B 才是明显上升。",
        feedbackCorrect: "没被骗！平坦不是上升，别硬凑 🧠",
        feedbackWrong: "平坦线说上升，图表会哭的 😭"
      },
      {
        id: "s2-6", difficulty: 3, type: "choice",
        question: "笔记说「选哪个都行」指的是？",
        options: ["法1 和 法2 二选一", "时态随便写", "不用分段", "图表随便画"],
        answer: 0,
        explain: "批注：选哪个都行 — 指法1 或 法2。",
        feedbackCorrect: "法1 法2 随心 pick，但别混成法3 🎲",
        feedbackWrong: "说的是分段方法，不是时态放飞自我 🙃"
      }
    ]
  },

  step3: {
    title: "第三步 · 数据分析",
    questions: [
      {
        id: "s3-1", difficulty: 1, type: "choice",
        chart: "assets/charts/quiz/q-step3-group.png",
        question: "看上图，段内项目超过 2 个时，笔记建议？",
        options: ["全部写一句带过", "段内再分组（如 ABE / CD）", "只写最高的", "跳过不写"],
        answer: 1,
        explain: "批注：若一段内有大于 2 个项目，则段内分组（如 ABE）。",
        feedbackCorrect: "分组操作，清晰得像开了导航 🗺️",
        feedbackWrong: "超过 2 个要分组，别一锅炖 🍲"
      },
      {
        id: "s3-2", difficulty: 1, type: "judge",
        question: "描述数据时，应先比起点，再比趋势。",
        answer: true,
        explain: "第三步：先比起点，再比趋势。",
        feedbackCorrect: "起点→趋势，顺序不能乱 🎬",
        feedbackWrong: "笔记铁律：先起点后趋势，别倒挂 🔄"
      },
      {
        id: "s3-3", difficulty: 2, type: "choice",
        chart: "assets/charts/quiz/q-step3-group.png",
        question: "练习图 D 中，较高组应包含哪些？",
        options: ["C 和 D", "A、B、E", "只有 A", "全部"],
        answer: 1,
        explain: "例：较高组 A、B、E；较低组 C、D。",
        feedbackCorrect: "ABE 高，CD 低，分组满分 💯",
        feedbackWrong: "看位置：ABE 在 60~100，CD 在 0~40 📏"
      },
      {
        id: "s3-4", difficulty: 2, type: "fill",
        chart: "assets/charts/quiz/q-step3-group.png",
        question: "以 CD 为例：a 年先比______，a→b 再比趋势。",
        answer: ["起点", "起始点", "起点值"],
        explain: "先比起点：在 a 年，C = xx，D = xx。",
        feedbackCorrect: "起点先锁死，趋势再展开 🔐",
        feedbackWrong: "第一步叫「比起点」，别跳步 🪜"
      },
      {
        id: "s3-5", difficulty: 3, type: "choice",
        chart: "assets/charts/quiz/q-step3-group.png",
        question: "【陷阱】A 线大幅波动，写作时应？",
        options: ["忽略波动只写平均值", "单独强调其变化形式", "与其他线合并不写", "只写最后一个点"],
        answer: 1,
        explain: "批注：先升后降单说 → 强调变化形式（如 A）。",
        feedbackCorrect: "A 线戏多，值得单独给镜头 🎭",
        feedbackWrong: "大幅波动要单说，别帮它删戏 ✂️"
      }
    ]
  },

  language: {
    title: "6 大语言点",
    questions: [
      {
        id: "l-1", difficulty: 1, type: "choice",
        question: "下列哪个是笔记中的<strong>上升</strong>动词？",
        options: ["plummet", "increase", "decline", "plunge"],
        answer: 1,
        explain: "上升动词：increase / rise / grow / climb。",
        feedbackCorrect: "increase 向上冲！📈",
        feedbackWrong: "plummet 是骤降，方向反了 🙃"
      },
      {
        id: "l-2", difficulty: 1, type: "judge",
        question: "a slowly rise 是笔记推荐的标准写法。",
        answer: false,
        explain: "批注：a slowly rise → a slow rise（a/an 后加形容词）。",
        feedbackCorrect: "副词退散，形容词上岗 👔",
        feedbackWrong: "slowly 是副词，这里要 slow 形容词 🚫"
      },
      {
        id: "l-3", difficulty: 2, type: "choice",
        question: "【陷阱】体验大幅上升，应写？",
        options: ["experience a dramatical rise", "experience a dramatic rise", "experience a dramat rise", "experience dramatical rise"],
        answer: 1,
        explain: "易错：dramatical ✗ → dramatic ✓",
        feedbackCorrect: "dramatic 不是 dramatical，记住了 🎓",
        feedbackWrong: "dramatical？考官的 red pen 已饥渴难耐 ✍️"
      },
      {
        id: "l-4", difficulty: 2, type: "choice",
        question: "程度词中，表示「大幅地」且可表翻倍的是？",
        options: ["slightly", "sharply / dramatically / substantially", "marginally", "gradually"],
        answer: 1,
        explain: "大幅地：sharply — dramatically = substantially（翻倍）。",
        feedbackCorrect: "sharp dramatic substantial 三件套 💥",
        feedbackWrong: "slightly 是稍微，大幅得找 sharply 那帮 🔍"
      },
      {
        id: "l-5", difficulty: 2, type: "judge",
        question: "there is a substant rise in … 是正确表达。",
        answer: false,
        explain: "易错：substant ✗ → substantial ✓",
        feedbackCorrect: "substant 截短了，substantial 才完整 🧩",
        feedbackWrong: "substant 像半成品，补全 substantial 🛠️"
      },
      {
        id: "l-6", difficulty: 3, type: "fill",
        question: "保持稳定可用：remain steady at … 或 remain ______ at …",
        answer: ["static"],
        explain: "③ 保持稳定：remain steady at … / remain static at …",
        feedbackCorrect: "steady static 双静止大师 🧘",
        feedbackWrong: "另一个叫 static，笔记里有的 📒"
      },
      {
        id: "l-7", difficulty: 3, type: "choice",
        question: "【陷阱】「明显」程度词（不翻倍）应选？",
        options: ["dramatically", "markedly / noticeably", "substantially", "sharply"],
        answer: 1,
        explain: "明显地：markedly — noticeably（不翻倍）。",
        feedbackCorrect: "不翻倍选 markedly，别选 substantial 🎯",
        feedbackWrong: "substantially 是翻倍大幅，这题是「明显」 📐"
      }
    ]
  },

  bonus: {
    title: "6 大加分点",
    questions: [
      {
        id: "b-1", difficulty: 1, type: "choice",
        question: "万能主语公式是？",
        options: ["the number of + 动词", "the figure for + 表头类别", "I think that", "the graph is"],
        answer: 1,
        explain: "c) the figure for + 表头类别",
        feedbackCorrect: "figure for 万能主语，省时神器 ⚡",
        feedbackWrong: "笔记原话：the figure for + 表头类别 📝"
      },
      {
        id: "b-2", difficulty: 1, type: "judge",
        question: "number 的同替可以是 volume。",
        answer: true,
        explain: "批注（红）：volume 极好用，指代数量。",
        feedbackCorrect: "volume 装数量，好用得想鼓掌 👏",
        feedbackWrong: "笔记红字：number → volume 🔴"
      },
      {
        id: "b-3", difficulty: 2, type: "choice",
        question: "表示「相同趋势」的衔接词？",
        options: ["In contrast", "Similarly / Likewise", "However", "Nevertheless"],
        answer: 1,
        explain: "相同：Similarly / Likewise",
        feedbackCorrect: "Similarly 同款上升，拷贝粘贴 📋",
        feedbackWrong: "In contrast 是相反，不是相同 ↔️"
      },
      {
        id: "b-4", difficulty: 2, type: "fill",
        question: "描述前者后者用：the former … the ______ …",
        answer: ["latter"],
        explain: "结构：the former … the latter …",
        feedbackCorrect: "former + latter，双胞胎指代 👯",
        feedbackWrong: "后者叫 latter，不是 ladder 🪜"
      },
      {
        id: "b-5", difficulty: 3, type: "choice",
        question: "【陷阱】时间改写起终点应提哪个介词？",
        options: ["on", "in", "at", "by"],
        answer: 1,
        explain: "批注（红）：提到 in — at the beginning / end of the time span",
        feedbackCorrect: "in the beginning/end，介词小能手 🎯",
        feedbackWrong: "笔记红字强调用 in，别换别的 🚦"
      },
      {
        id: "b-6", difficulty: 3, type: "judge",
        question: "comparable 的重音在 com-。",
        answer: true,
        explain: "comparable — 重音在 com",
        feedbackCorrect: "COMparable，重音站 com 上 🎤",
        feedbackWrong: "重音在 com，读错了像别的词 🙊"
      }
    ]
  },

  formulas: {
    title: "公式段",
    questions: [
      {
        id: "f-1", difficulty: 1, type: "choice",
        question: "笔记建议的写作顺序是？",
        options: ["主体→开头→结尾", "开头→结尾（总览）→主体", "只写主体", "结尾→开头"],
        answer: 1,
        explain: "开头段 → 结尾段（总览） → 主体段",
        feedbackCorrect: "先总览再主体，时间不够也稳 🛡️",
        feedbackWrong: "笔记顺序：开头→结尾总览→主体 📋"
      },
      {
        id: "f-2", difficulty: 1, type: "judge",
        question: "开头段建议写多句详细背景。",
        answer: false,
        explain: "开头段（1 句，别废话）",
        feedbackCorrect: "一句就够，废话退散 🤐",
        feedbackWrong: "笔记：1 句，别废话！✂️"
      },
      {
        id: "f-3", difficulty: 2, type: "fill",
        question: "开头公式：The [图] illustrates the changes in sth. … over a span of ______ years.",
        answer: ["xx", "数字"],
        explain: "over a span of xx years",
        feedbackCorrect: "年限填进去，公式完整 🧩",
        feedbackWrong: "xx 年要写清楚，span of __ years 📅"
      },
      {
        id: "f-4", difficulty: 2, type: "choice",
        question: "「百分比」常考同替是？",
        options: ["kind / type", "percentage / proportion", "annual", "expenditure"],
        answer: 1,
        explain: "百分比：percentage / proportion（常用）",
        feedbackCorrect: "proportion percentage 双保险 📊",
        feedbackWrong: "百分比找 percentage/proportion 🔎"
      },
      {
        id: "f-5", difficulty: 3, type: "choice",
        question: "【陷阱】结尾段「最值」占位符：若无最值，可写？",
        options: ["不写直接交卷", "某时间 surpass/overtake 成为最…", "只写 Overall", "复制开头段"],
        answer: 1,
        explain: "最值：若无最值，则写于（时间）+ 主语 + surpass / overtake + 对象 + 成为最…",
        feedbackCorrect: "surpass overtake 救场成功 🦸",
        feedbackWrong: "没最值也有写法，surpass/overtake 顶上 🚀"
      },
      {
        id: "f-6", difficulty: 3, type: "judge",
        question: "笔记例句：milk produced per year in four countries — 这是正确的开头段示例。",
        answer: true,
        explain: "The table illustrates the changes in the amount of milk produced per year in four countries over a span of 20 years.",
        feedbackCorrect: "例句背熟，开头不慌 🥛",
        feedbackWrong: "这是笔记原例句，正确的 ✅"
      }
    ]
  }
};
