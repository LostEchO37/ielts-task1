/* 大作文综合模拟 — 按题型分组（当前仅 2.1.1） */

const TASK2_SIM_TYPES = [
  { id: "211", titleKey: "task2.type211.title", sectionKey: "task2.section21", live: true }
];

const TASK2_SIMULATIONS = [
  {
    id: "t2_211_1",
    typeKey: "211",
    isTask2: true,
    minWords: 250,
    title: "Space technology vs other fields",
    prompt: `Some people think that governments should spend more money on space technology, while others believe that other fields such as healthcare and education deserve greater investment.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topics: ["government", "space", "investment", "technology", "health", "education"]
  },
  {
    id: "t2_211_2",
    typeKey: "211",
    isTask2: true,
    minWords: 250,
    title: "Online learning vs traditional schools",
    prompt: `Some people believe that online learning will eventually replace traditional classroom teaching, while others argue that face-to-face education is irreplaceable.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topics: ["education", "online", "learning", "students", "technology", "classroom"]
  },
  {
    id: "t2_211_3",
    typeKey: "211",
    isTask2: true,
    minWords: 250,
    title: "Economic growth vs environmental protection",
    prompt: `Some people think that economic growth should be the top priority for governments, even if it causes environmental damage. Others believe that protecting the environment is more important than economic development.

Discuss both views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.`,
    topics: ["economy", "environment", "government", "development", "pollution", "growth"]
  }
];
