/* 学习页首帧遮罩 — 须在 head 内尽早执行 */
try {
  if (sessionStorage.getItem("ielts-enter-learning") === "1") {
    document.documentElement.classList.add("ielts-enter-boot");
  }
} catch (_) {}
