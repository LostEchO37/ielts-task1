/* 封面 · 模块展开子目录 */

const CoverHub = {
  stage: null,
  subGrid: null,
  subTitle: null,
  active: null,

  MENUS: {
    task1: {
      titleKey: "cover.hub.task1",
      items: [
        { href: "home.html", titleKey: "cover.sub.task1.dynamic", descKey: "cover.sub.task1.dynamic.desc", live: true },
        { href: "static/home.html", titleKey: "cover.sub.task1.static", descKey: "cover.sub.task1.static.desc", live: true }
      ]
    },
    task2: {
      titleKey: "cover.hub.task2",
      items: [
        { href: "task2/type1.html", titleKey: "task2.type211.title", descKey: "task2.type211.desc", live: true },
        { href: null, titleKey: "task2.type212.title", descKey: "task2.type212.desc", live: false },
        { href: null, titleKey: "task2.type221.title", descKey: "task2.type221.desc", live: false },
        { href: null, titleKey: "task2.type222.title", descKey: "task2.type222.desc", live: false },
        { href: null, titleKey: "task2.type23.title", descKey: "task2.type23.desc", live: false }
      ]
    },
    handbook: {
      titleKey: "cover.hub.handbook",
      items: [
        { href: "handbook/home.html", titleKey: "handbook.title", descKey: "handbook.desc", live: false }
      ]
    }
  },

  init() {
    this.stage = document.getElementById("cover-hub-stage");
    this.subGrid = document.getElementById("cover-hub-sub-grid");
    this.subTitle = document.getElementById("cover-hub-sub-title");
    if (!this.stage || !this.subGrid) return;

    document.querySelectorAll("[data-cover-expand]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        this.expand(btn.dataset.coverExpand);
      });
    });

    document.getElementById("cover-hub-back")?.addEventListener("click", (e) => {
      e.preventDefault();
      this.collapse();
    });
  },

  expand(key) {
    const menu = this.MENUS[key];
    if (!menu || this.active === key) return;
    this.active = key;
    this.subTitle.textContent = t(menu.titleKey);
    this.subTitle.setAttribute("data-i18n", menu.titleKey);
    this.renderSub(menu.items);
    this.stage.classList.add("is-expanded");
    this.stage.dataset.active = key;
  },

  collapse() {
    this.active = null;
    this.stage.classList.remove("is-expanded");
    delete this.stage.dataset.active;
  },

  renderSub(items) {
    this.subGrid.innerHTML = items.map((item) => {
      const tag = item.live
        ? `<span class="module-tag live">${t("cover.live")}</span>`
        : `<span class="module-tag pending">${t("cover.pending")}</span>`;
      const inner = `
        <div class="cover-hub-head">${tag}<h3>${t(item.titleKey)}</h3></div>
        <p class="cover-hub-desc">${t(item.descKey)}</p>`;
      if (item.href && item.live) {
        return `<a class="cover-hub-card" href="${item.href}" data-cover-href="${item.href}">${inner}</a>`;
      }
      return `<div class="cover-hub-card cover-hub-card--soon">${inner}</div>`;
    }).join("");

    this.subGrid.querySelectorAll("[data-cover-href]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("data-cover-href");
        CoverNav.go(href);
      });
    });
  }
};

const CoverNav = {
  go(href) {
    try { localStorage.setItem("ielts-last-module", href); } catch { /* ignore */ }
    const navigate = () => PageTransition.go(href);
    if (!UserStore.current()) UserUI.showOnboarding(navigate);
    else navigate();
  },

  bindMainLinks() {
    document.querySelectorAll("[data-cover-href]").forEach((link) => {
      if (link.closest("#cover-hub-sub-grid")) return;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("data-cover-href") || link.getAttribute("href");
        this.go(href);
      });
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  CoverHub.init();
  CoverNav.bindMainLinks();
});

document.addEventListener("ielts:langchange", () => {
  if (!CoverHub.active) return;
  CoverHub.expand(CoverHub.active);
});
