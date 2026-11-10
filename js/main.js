// Точка входу: налаштування, навігація, маршрутизація, PWA.
import { store } from './core/store.js';
import { $, $$, hydrateIcons, icon, modal, toast, stopSpeech, esc } from './core/ui.js';
import { checkAchievements } from './core/stats.js';
import { initPWA } from './core/pwa.js';
import { REPO_URL } from './core/nav.js';
import * as home from './views/home.js';
import * as academy from './views/academy.js';
import * as speed from './views/speed.js';
import * as shortcuts from './views/shortcuts.js';
import * as explorer from './views/explorer.js';
import * as everyday from './views/everyday.js';
import * as daily from './views/daily.js';
import * as progress from './views/progress.js';
import * as achievements from './views/achievements.js';
import * as settings from './views/settings.js';
import * as help from './views/help.js';
import { showOnboarding } from './views/onboarding.js';

const ROUTES = { home, academy, speed, shortcuts, explorer, everyday, daily, progress, achievements, settings, help };

store.load();
applySettings();
hydrateIcons();

/* ---------- налаштування вигляду ---------- */
export function applySettings() {
  const s = store.data.settings;
  const root = document.documentElement;
  const dark = s.theme === 'dark';
  root.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#15151A' : '#FFF6DF');
  root.dataset.contrast = s.contrast ? 'on' : 'off';
  root.dataset.large = s.large ? 'on' : 'off';
  root.dataset.motion = s.motion;
  root.style.fontSize = (s.fontScale * 100) + '%';
  const sb = $('#soundBtn');
  if (sb) {
    sb.setAttribute('aria-pressed', String(!!s.sound));
    sb.title = s.sound ? 'Вимкнути звук' : 'Увімкнути звук';
    sb.querySelector('[data-ico], .ico').outerHTML = icon(s.sound ? 'sound' : 'mute');
    sb.querySelector('.lbl').textContent = s.sound ? 'Звук' : 'Без звуку';
  }
}
window.addEventListener('ka:settings', applySettings);

/* ---------- шапка ---------- */
$('#soundBtn').addEventListener('click', () => {
  store.data.settings.sound = !store.data.settings.sound;
  store.save();
  applySettings();
  toast(store.data.settings.sound ? 'Звук увімкнено' : 'Звук вимкнено', { duration: 1800 });
});
$('#infoBtn').addEventListener('click', showInfo);

const sidebar = $('#sidebar'), scrim = $('#scrim'), menuBtn = $('#menuBtn');
function setMenu(open) {
  sidebar.classList.toggle('open', open);
  scrim.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
  if (open) sidebar.querySelector('a')?.focus();
}
menuBtn.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
scrim.addEventListener('click', () => { setMenu(false); menuBtn.focus(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sidebar.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });

export function showInfo() {
  modal({
    title: 'Про Keyboard Academy',
    body: `
      <p><b>Keyboard Academy</b> — безкоштовний тренажер клавіатури для будь-якого віку: від перших кроків за комп’ютером до швидкого сліпого друку. Українська (ЙЦУКЕН) та англійська (QWERTY) розкладки, без реєстрації, працює навіть без інтернету.</p>
      <h3>Як користуватися</h3>
      <ul>
        <li><b>Академія друку</b> — уроки по черзі. Наступний урок відкривається, коли точність від 80%.</li>
        <li><b>Швидкість друку</b> — тести на час і тренування слабких символів.</li>
        <li><b>Комбінації клавіш</b> — пояснення й практика. Позначка «Симуляція» означає безпечну вправу на екранних кнопках.</li>
        <li><b>Знайомство з клавіатурою</b> — клацніть будь-яку клавішу, щоб дізнатися, що вона робить.</li>
        <li>Прогрес зберігається автоматично в цьому браузері. Його можна перенести через «Налаштування → Експорт».</li>
        <li>У полі набору клавіша <kbd class="kc">Esc</kbd> повертає до звичайної навігації.</li>
      </ul>
      <p style="margin-top:1rem"><a class="gh-link" href="${REPO_URL}" target="_blank" rel="noopener">${icon('github')} Репозиторій на GitHub <span class="star">${icon('star')}</span></a></p>
      <p class="ai-note">Сайт створено за допомогою штучного інтелекту.</p>`,
  });
}

/* ---------- маршрутизація ---------- */
let cleanup = null;
function parse() {
  const h = location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const query = Object.fromEntries(new URLSearchParams(qs || ''));
  return { name: parts[0] || 'home', parts: parts.slice(1), query };
}
function route() {
  const { name, parts, query } = parse();
  const view = ROUTES[name] || home;
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } cleanup = null; }
  stopSpeech();
  const main = $('#view');
  main.innerHTML = '';
  $$('#sidebar a').forEach(a => a.toggleAttribute('aria-current', a.dataset.nav === (ROUTES[name] ? name : 'home')));
  $$('#sidebar a[aria-current]').forEach(a => a.setAttribute('aria-current', 'page'));
  setMenu(false);
  try {
    cleanup = view.render(main, { parts, query }) || null;
  } catch (e) {
    console.error(e);
    main.innerHTML = `<div class="page"><div class="card"><h2>Щось пішло не так</h2><p>Цю сторінку не вдалося показати. Ваш прогрес у безпеці.</p><a class="btn primary" href="#/home">На головну</a></div></div>`;
  }
  hydrateIcons(main);
  const h1 = main.querySelector('h1');
  document.title = (h1 ? h1.textContent.trim() + ' — ' : '') + 'Keyboard Academy';
  window.scrollTo(0, 0);
  if (!main.contains(document.activeElement)) main.focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);

window.addEventListener('ka:storage-error', () => toast('Не вдається зберегти прогрес: браузер обмежив сховище. Звільніть місце або вимкніть режим «інкогніто».', { duration: 8000, icon: 'warn' }));

route();
checkAchievements();
initPWA();
if (!store.data.onboarded) setTimeout(showOnboarding, 300);
