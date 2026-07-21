/* Cross-module navigation — temporary「返回先前模块」when entering via module link */

const CrossModuleNav = {
  STORAGE_KEY: 'ielts-cross-module-from',

  init() {
    const file = location.pathname.split('/').pop() || '';
    if (!file || file === 'index.html' || file === 'stats.html') return;

    this.decorateLinks();

    const params = new URLSearchParams(location.search);
    const fromParam = params.get('from');
    if (fromParam) {
      try { sessionStorage.setItem(this.STORAGE_KEY, fromParam); } catch { /* ignore */ }
      params.delete('from');
      const qs = params.toString();
      const clean = location.pathname + (qs ? `?${qs}` : '') + location.hash;
      history.replaceState(null, '', clean);
    }

    const origin = this.getOrigin();
    if (!origin) return;

    if (this.moduleOf(location.pathname) === this.moduleOf(origin)) {
      this.clear();
      return;
    }

    this.render(origin);
  },

  adaptSidebarForOrigin(origin) {
    const inStatic = /\/static\//.test(location.pathname);
    const fromStatic = origin.startsWith('static/');
    const staticPrefix = inStatic ? '' : 'static/';

    document.querySelectorAll('.sidebar nav .nav-link').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.includes('index.html') || href.includes('profile') || href.includes('wrongbook')) return;
      if (fromStatic && !href.startsWith('static/') && !href.startsWith('../') && !href.includes('/')) {
        link.href = staticPrefix + href;
      } else if (!fromStatic && href.startsWith('static/')) {
        link.href = inStatic ? href.slice('static/'.length) : href.replace(/^static\//, '');
      }
    });

    const brandSub = document.querySelector('.brand-sub');
    if (brandSub) {
      brandSub.dataset.i18n = fromStatic ? 'static.brand.sub' : 'brand.sub';
    }
  },

  decorateLinks() {
    document.querySelectorAll('[data-cross-from]').forEach((link) => {
      const from = link.getAttribute('data-cross-from');
      const href = link.getAttribute('href');
      if (!from || !href || href.startsWith('#')) return;
      try {
        const url = new URL(href, location.href);
        url.searchParams.set('from', from);
        link.href = url.pathname + url.search + url.hash;
      } catch { /* ignore bad href */ }
    });
  },

  moduleOf(pathOrOrigin) {
    return /(?:^|\/)static\//.test(pathOrOrigin) ? 'static' : 'dynamic';
  },

  getOrigin() {
    try { return sessionStorage.getItem(this.STORAGE_KEY); } catch { return null; }
  },

  clear() {
    try { sessionStorage.removeItem(this.STORAGE_KEY); } catch { /* ignore */ }
    document.getElementById('cross-module-back')?.remove();
  },

  resolveHref(origin) {
    const inStatic = /\/static\//.test(location.pathname);
    if (origin.startsWith('static/')) {
      return inStatic ? origin.slice('static/'.length) : origin;
    }
    return inStatic ? `../${origin}` : origin;
  },

  render(origin) {
    if (document.getElementById('cross-module-back')) return;

    this.adaptSidebarForOrigin(origin);

    const wrap = document.createElement('div');
    wrap.id = 'cross-module-back';
    wrap.className = 'cross-module-back';
    wrap.innerHTML = `
      <a href="${this.resolveHref(origin)}" class="cross-module-back-link" data-i18n="nav.returnPrev">返回先前模块</a>
      <button type="button" class="cross-module-back-dismiss" aria-label="关闭">×</button>
    `;
    document.body.appendChild(wrap);

    wrap.querySelector('.cross-module-back-dismiss').addEventListener('click', () => this.clear());
    wrap.querySelector('.cross-module-back-link').addEventListener('click', () => this.clear());

    if (typeof Settings !== 'undefined' && Settings.apply) Settings.apply();
  }
};

document.addEventListener('DOMContentLoaded', () => CrossModuleNav.init());
