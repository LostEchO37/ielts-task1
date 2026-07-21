document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.mobile-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== toggle) {
        sidebar.classList.remove('open');
      }
    });
  }

  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href === current || href.endsWith('/' + current)) link.classList.add('active');
  });

  const file = location.pathname.split('/').pop();
  if (file && file !== 'index.html' && file !== 'stats.html') {
    const inStatic = /\/static\//.test(location.pathname);
    const rel = inStatic ? `static/${file}` : file;
    try { localStorage.setItem('ielts-last-module', rel); } catch { /* ignore */ }
  }
});
