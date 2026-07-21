/* 静态图综合模拟 */

const STATIC_SIMULATIONS = [
  {
    id: "static_sim1",
    isStatic: true,
    title: "Transport modes",
    prompt: `The bar chart below shows the preferred transport modes in Riverside in 2023.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    chart: "../assets/charts/static/sim/static-sim1.png",
    chartAlt: "Transport modes bar chart 2023",
    unit: "percentage",
    subjects: ["car", "bus", "cycle", "walk", "rail", "transport"]
  },
  {
    id: "static_sim2",
    isStatic: true,
    title: "Energy sources",
    prompt: `The pie chart below shows the proportions of energy sources in Country Y in 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    chart: "../assets/charts/static/sim/static-sim2.png",
    chartAlt: "Energy sources pie chart 2022",
    unit: "percentage",
    subjects: ["coal", "gas", "nuclear", "renewables", "oil", "energy"]
  },
  {
    id: "static_sim3",
    isStatic: true,
    title: "Milk statistics",
    prompt: `The table below gives information about milk production, consumption and export in four countries.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.`,
    chart: "../assets/charts/static/sim/static-sim3.png",
    chartAlt: "Milk statistics table four countries",
    unit: "million tonnes",
    subjects: ["production", "consumption", "export", "milk", "countries"]
  }
];

/* static/simulation.html 使用此数据 */
if (typeof window !== "undefined" && /\/static\/simulation\.html$/i.test(location.pathname)) {
  window.SIMULATIONS = STATIC_SIMULATIONS;
}
