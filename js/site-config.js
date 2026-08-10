/* 站点配置 — GitHub Pages 前端 + 独立 API 后端（统计 & 用户同步） */

const SiteConfig = {
  /**
   * 部署 Render 等 Node 服务后，填你的 API 根地址（无末尾斜杠）。
   * 例: "https://ielts-analytics-api.onrender.com"
   * 留空 "" 则用户系统退化为本地昵称模式（无跨设备同步）。
   */
  apiBase: "https://ielts-task1.vercel.app",

  /** 可选：爱发电/赞赏外链，填了则在打赏弹窗显示「快捷打赏」按钮（手机可一键跳转） */
  rewardLink: "",

  apiUrl(path) {
    const p = path.startsWith("/") ? path : `/${path}`;
    const base = (this.apiBase || "").replace(/\/$/, "");
    return base ? `${base}${p}` : p;
  }
};
