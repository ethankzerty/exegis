// Shared navigation — no framework required.
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
menuButton?.addEventListener('click', () => {
  const opened = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(opened));
});
const section = new URLSearchParams(location.search).get('section') || 'archives';
const key = location.pathname.split('/').pop() === 'index.html' || location.pathname.endsWith('/') ? 'home' : location.pathname.endsWith('about.html') ? 'about' : location.pathname.endsWith('section.html') ? section : '';
document.querySelector(`[data-nav="${key}"]`)?.classList.add('selected');
document.querySelectorAll('[data-year]').forEach(el => el.textContent = String(new Date().getFullYear()));
