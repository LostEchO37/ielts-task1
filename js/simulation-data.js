/* 雅思小作文综合模拟 — 题目数据 */

const SIMULATIONS = [
  {
    id: "sim1",
    title: "Simulation 1 · Electricity production",
    prompt: `The line graph below shows electricity production by fuel source in four categories in Country X from 1980 to 2015.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    chart: "assets/charts/sim/sim1.png",
    chartAlt: "Electricity production by fuel source 1980-2015",
    timeRange: "1980–2015",
    unit: "billion kWh",
    subjects: ["coal", "nuclear", "hydro", "natural gas", "electricity"]
  },
  {
    id: "sim2",
    title: "Simulation 2 · Population in capital cities",
    prompt: `The line graph below compares the population of three capital cities between 1990 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    chart: "assets/charts/sim/sim2.png",
    chartAlt: "Population in three capital cities 1990-2020",
    timeRange: "1990–2020",
    unit: "millions",
    subjects: ["City A", "City B", "City C", "population"]
  },
  {
    id: "sim3",
    title: "Simulation 3 · Household spending",
    prompt: `The line graph below shows the average household spending on five categories in the UK from 2000 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    chart: "assets/charts/sim/sim3.png",
    chartAlt: "Household spending five categories 2000-2020",
    timeRange: "2000–2020",
    unit: "GBP per week",
    subjects: ["food", "transport", "housing", "leisure", "spending"]
  }
];
