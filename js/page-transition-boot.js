/* 学习页首帧遮罩 — 须在 head 内尽早执行 */
try {
  if (sessionStorage.getItem("ielts-enter-learning") === "1") {
    document.documentElement.classList.add("ielts-enter-boot");
    /* 若过渡脚本加载失败，避免遮罩永久卡住 */
    window.addEventListener("DOMContentLoaded", () => {
      window.setTimeout(() => {
        if (!document.documentElement.classList.contains("ielts-enter-boot")) return;
        if (document.body.classList.contains("page-enter-active")) return;
        document.documentElement.classList.remove("ielts-enter-boot");
        document.querySelector(".page-enter-veil")?.remove();
        document.body.classList.remove("page-entering", "page-enter-active");
      }, 1400);
    }, { once: true });
  }
} catch (_) {}
