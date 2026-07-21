/* Changelog modal — cover page only */

const ChangelogUI = {
  init() {
    const btn = document.getElementById('changelog-btn');
    if (!btn || typeof CHANGELOG === 'undefined') return;

    btn.addEventListener('click', () => this.open());

    if (!document.getElementById('changelog-overlay')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div id="changelog-overlay" class="changelog-overlay" aria-hidden="true">
          <div class="changelog-modal" role="dialog" aria-labelledby="changelog-title">
            <button type="button" class="changelog-close" aria-label="关闭">×</button>
            <h2 id="changelog-title" data-i18n="changelog.title">更新日志</h2>
            <div class="changelog-list" id="changelog-list"></div>
          </div>
        </div>
      `);

      const overlay = document.getElementById('changelog-overlay');
      overlay.querySelector('.changelog-close').addEventListener('click', () => this.close());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('open')) this.close();
      });
    }
  },

  open() {
    const overlay = document.getElementById('changelog-overlay');
    const list = document.getElementById('changelog-list');
    if (!overlay || !list) return;

    list.innerHTML = CHANGELOG.map((entry) => `
      <article class="changelog-entry">
        <header class="changelog-entry-head">
          <span class="changelog-version">v${entry.version}</span>
          <time class="changelog-date" datetime="${entry.date}">${entry.date}</time>
        </header>
        <ul class="changelog-items">
          ${entry.items.map((item) => `<li>${item}</li>`).join('')}
        </ul>
      </article>
    `).join('');

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    if (typeof Settings !== 'undefined' && Settings.apply) Settings.apply();
  },

  close() {
    const overlay = document.getElementById('changelog-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  },
};

document.addEventListener('DOMContentLoaded', () => ChangelogUI.init());
