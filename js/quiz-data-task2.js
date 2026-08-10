/* 大作文题库 */

const TASK2_QUIZ = {
  t2_method: {
    title: "类型1 · 方法论",
    questions: [
      {
        id: "t2m-1", difficulty: 1, type: "choice",
        question: "「两个议论词 · 比较型」题干的核心特征是什么？",
        options: ["只需描述一个现象", "存在 A 与 B 两个方向的比较", "必须写成四段式议论文", "不能表达个人立场"],
        answer: 1,
        explain: "笔记：存在 a 与 b 的比较。",
        feedbackCorrect: "比较型，核心就是 A vs B ⚖️",
        feedbackWrong: "两个议论词 = 两边要拿来比 🔄"
      },
      {
        id: "t2m-2", difficulty: 1, type: "judge",
        question: "比较型大作文可以采用「A 与 B 同等重要」的折中立场。",
        answer: false,
        explain: "笔记：一边倒，无法论证 a = b。",
        feedbackCorrect: "必须选边，不能和稀泥 🎯",
        feedbackWrong: "一边倒！无法论证 a = b 📌"
      },
      {
        id: "t2m-3", difficulty: 2, type: "choice",
        question: "类型 1 三个主体段的结构公式是？",
        options: ["先立 + 举例 × 3", "先舍 +（更好 & 不足）× 2", "背景 + 原因 + 结果", "问题 + 措施 + 预测"],
        answer: 1,
        explain: "主1 先舍；主2、主3 各写支持方更好 + 对方不足。",
        feedbackCorrect: "先舍后立，后两段各打一个理由 ✨",
        feedbackWrong: "公式：先舍 +（更好 & 不足）× 2 📝"
      },
      {
        id: "t2m-4", difficulty: 2, type: "choice",
        question: "40 分钟大作文，笔记建议如何分配时间？",
        options: ["10 min 审题 + 30 min 写", "6 min 审题/提纲 + 34 min 写", "20 min 审题 + 20 min 写", "不写提纲，40 min 全写"],
        answer: 1,
        explain: "6 mins 审题/列提纲（不要过长）+ 34 mins 写。",
        feedbackCorrect: "6 + 34，时间分配拿捏了 ⏱️",
        feedbackWrong: "6 min 审题 + 34 min 写作，别审太久 👀"
      },
      {
        id: "t2m-5", difficulty: 2, type: "choice",
        question: "主 1 段「先舍」的作用是？",
        options: ["直接否定对方全部观点", "让步不支持的一方，为后文转折铺垫", "重复开头段原句", "罗列所有论据"],
        answer: 1,
        explain: "主1：先舍不支持一方 — 承认对方有一定道理。",
        feedbackCorrect: "先给对面台阶，再转折立论 🤝",
        feedbackWrong: "先舍 = 让步，不是开喷 🙅"
      },
      {
        id: "t2m-6", difficulty: 3, type: "choice",
        question: "审题时「限定词」的作用是？",
        options: ["让文章更长", "缩小讨论范围，避免跑题", "替换主题词", "决定用几个例子"],
        answer: 1,
        explain: "限定词缩小范围，如主体是政府还是个人。",
        feedbackCorrect: "圈限定词 = 不跑题 🎯",
        feedbackWrong: "限定词用来缩小讨论范围，别写飞了 🪁"
      }
    ]
  }
};

Object.assign(QUIZ_BANK, TASK2_QUIZ);
