/* 封面 ↔ 学习页 丝滑淡入淡出 */

const PageTransition = {
  KEY: "ielts-enter-learning",
  EXIT_MS: 720,
  ENTER_MS: 980,

  go(href) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      location.href = href;
      return;
    }

    try {
      sessionStorage.setItem(this.KEY, "1");
    } catch { /* ignore */ }

    document.body.classList.add("page-exiting");
    window.setTimeout(() => {
      location.href = href;
    }, this.EXIT_MS);
  },

  initEnter() {
    let pending = false;
    try {
      pending = sessionStorage.getItem(this.KEY) === "1";
      if (pending) sessionStorage.removeItem(this.KEY);
    } catch { /* ignore */ }

    if (!pending || !document.querySelector(".layout")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const veil = document.createElement("div");
    veil.className = "page-enter-veil";
    veil.setAttribute("aria-hidden", "true");
    document.body.appendChild(veil);

    document.body.classList.add("page-entering");

    requestAnimationFrame(() => {
      document.documentElement.classList.remove("ielts-enter-boot");
      requestAnimationFrame(() => {
        document.body.classList.add("page-enter-active");
        veil.classList.add("reveal");
      });
    });

    const cleanup = () => {
      veil.remove();
      document.body.classList.remove("page-entering", "page-enter-active");
      document.documentElement.classList.remove("ielts-enter-boot");
    };

    veil.addEventListener("transitionend", (e) => {
      if (e.target === veil && e.propertyName === "opacity") cleanup();
    });

    window.setTimeout(cleanup, this.ENTER_MS + 150);
  }
};
