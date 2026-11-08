// Академія комбінацій клавіш: каталог, детальна сторінка з демонстрацією й практикою.
import { store } from '../core/store.js';
import { icon, esc, combo, speak, speechSupported } from '../core/ui.js';
import { SHORTCUTS, CATEGORIES, LEVELS, OS_LABEL, byId } from '../content/shortcuts.js';
import { createPractice, demoBlock, bindDemo } from '../core/practice.js';
import { mastered, checkAchievements } from '../core/stats.js';
import { setLast } from '../core/nav.js';

export function markPracticed(id) {
  const r = store.data.shortcuts[id] || { ok: 0, at: 0 };
  r.ok++; r.at = Date.now();
  store.data.shortcuts[id] = r;
  store.save();
  checkAchievements();
}
const statusPill = id => mastered(id) ? `<span class="pill green">${icon('check')} Освоєно</span>` : store.data.shortcuts[id]?.ok ? '<span class="pill amber">Практиковано</span>' : '';

let filterState = { level: 'all', q: '' };

export function render(el, { parts }) {
  if (parts[0] && byId(parts[0])) return renderDetail(el, byId(parts[0]));
  return renderList(el);
}

function renderList(el) {
  setLast('Комбінації клавіш');
  const total = SHORTCUTS.length, m = SHORTCUTS.filter(s => mastered(s.id)).length;
  el.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Комбінації клавіш</h1><p>Кілька клавіш разом виконують корисні команди. Оберіть комбінацію, подивіться, як вона працює, і спробуйте самі.</p></div>
    <span class="pill green">Освоєно ${m} з ${total}</span></div>
    <div class="notice" style="margin-bottom:1.2rem">${icon('info')}<div><p><b>Як читати запис «Ctrl + C»:</b> натисніть і утримуйте першу клавішу (Ctrl), потім коротко натисніть другу (C) і відпустіть обидві.</p>
      <p style="margin-top:.4rem">Деякі комбінації керують самою Windows чи браузером — сайт не може їх перехопити. Їх ми тренуємо в безпечній <b>симуляції</b>. На Mac замість Ctrl зазвичай використовують ⌘ Cmd.</p></div></div>
    <div class="filters">
      <div class="seg" role="group" aria-label="Рівень">${[['all', 'Усі'], ['1', LEVELS[1]], ['2', LEVELS[2]], ['3', LEVELS[3]]].map(([v, l]) => `<button type="button" data-level="${v}" aria-pressed="${filterState.level === v}">${l}</button>`).join('')}</div>
      <input type="search" placeholder="Пошук: копіювати, вкладка, Ctrl + S…" aria-label="Пошук комбінації" value="${esc(filterState.q)}">
    </div>
    <div data-list></div>
  </div>`;
  const list = el.querySelector('[data-list]');
  const paint = () => {
    const q = filterState.q.trim().toLowerCase().replace(/\s+/g, ' ');
    const visible = SHORTCUTS.filter(s => (filterState.level === 'all' || String(s.level) === filterState.level)
      && (!q || (s.name + ' ' + s.desc + ' ' + s.keys.join(' + ')).toLowerCase().includes(q)));
    list.innerHTML = CATEGORIES.map(c => {
      const items = visible.filter(s => s.cat === c.id);
      if (!items.length) return '';
      const all = SHORTCUTS.filter(s => s.cat === c.id);
      const md = all.filter(s => mastered(s.id)).length;
      return `<section><div class="cat-title"><h2>${esc(c.name)}</h2><span class="pill">${md}/${all.length}</span></div>
        <div class="sc-list">${items.map(s => `<a class="sc-item${mastered(s.id) ? ' mastered' : ''}" href="#/shortcuts/${s.id}">
          ${combo(s.keys)}<span class="nm">${esc(s.name)}</span><span class="ds">${esc(s.desc)}</span>
          <span class="meta"><span class="pill">${OS_LABEL[s.os]}</span><span class="pill ${s.mode === 'sim' ? 'violet' : 'blue'}">${s.mode === 'sim' ? 'Симуляція' : 'Справжня перевірка'}</span>${statusPill(s.id)}</span>
        </a>`).join('')}</div></section>`;
    }).join('') || '<p class="muted">Нічого не знайдено. Спробуйте інше слово.</p>';
  };
  paint();
  el.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => {
    filterState.level = b.dataset.level;
    el.querySelectorAll('[data-level]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    paint();
  }));
  el.querySelector('input[type=search]').addEventListener('input', e => { filterState.q = e.target.value; paint(); });
}

function renderDetail(el, sc) {
  setLast(`Комбінація: ${sc.name} (${sc.keys.join(' + ')})`);
  const cat = CATEGORIES.find(c => c.id === sc.cat);
  const inCat = SHORTCUTS.filter(s => s.cat === sc.cat);
  const i = inCat.indexOf(sc);
  const prev = inCat[i - 1], next = inCat[i + 1];
  const nextCat = !next ? SHORTCUTS[SHORTCUTS.indexOf(sc) + 1] : null;
  el.innerHTML = `<div class="page">
    <a class="back" href="#/shortcuts">${icon('left')} Усі комбінації</a>
    <div class="sc-detail-head">
      <div><span class="pill">${esc(cat.name)} · ${i + 1} з ${inCat.length}</span><h1 style="margin:.5rem 0">${esc(sc.name)}</h1>${combo(sc.keys, true)}</div>
      <div class="btn-row"><span class="pill">${OS_LABEL[sc.os]}</span><span class="pill">${LEVELS[sc.level]}</span><span data-status>${statusPill(sc.id)}</span></div>
    </div>
    <div class="grid c2 section" style="margin-top:1.4rem;align-items:start">
      <div class="card">
        <h2>Що це робить</h2>
        <p style="font-size:1.1rem">${esc(sc.desc)}</p>
        <dl class="facts">
          <dt>Коли згодиться</dt><dd>${esc(sc.use)}</dd>
          <dt>Приклад</dt><dd>${esc(sc.example)}</dd>
          <dt>Де працює</dt><dd>${sc.os === 'windows' ? 'Керує самою Windows: працює майже в будь-якій програмі.' : sc.os === 'browser' ? 'У браузерах (Chrome, Edge, Firefox). В інших програмах може робити інше.' : sc.os === 'apps' ? 'У програмах для тексту (Word, Google Документи, месенджери). У різних програмах поведінка може трохи відрізнятися.' : 'Майже в усіх програмах і на сайтах.'}</dd>
          <dt>На Mac</dt><dd>${esc(sc.mac)}</dd>
        </dl>
        ${speechSupported() ? `<button class="btn small soft" type="button" data-speak style="margin-top:1rem">${icon('speak')} Прочитати вголос</button>` : ''}
        <h3 style="margin-top:1.4rem">Як це виглядає</h3>
        ${demoBlock(sc)}
      </div>
      <div class="card"><h2>Спробуйте самі</h2><div data-practice></div></div>
    </div>
    <div class="btn-row section" style="justify-content:space-between">
      ${prev ? `<a class="btn" href="#/shortcuts/${prev.id}">${icon('left')} ${esc(prev.name)}</a>` : '<span></span>'}
      ${next ? `<a class="btn primary" href="#/shortcuts/${next.id}">${esc(next.name)} ${icon('right')}</a>` : nextCat ? `<a class="btn primary" href="#/shortcuts/${nextCat.id}">Наступна категорія ${icon('right')}</a>` : `<a class="btn primary" href="#/shortcuts">До всіх комбінацій</a>`}
    </div>
  </div>`;
  bindDemo(el, sc);
  el.querySelector('[data-speak]')?.addEventListener('click', () => speak(`${sc.name}. ${sc.keys.join(' плюс ')}. ${sc.desc} ${sc.example}`, true));
  const cleanup = createPractice(el.querySelector('[data-practice]'), sc, () => {
    markPracticed(sc.id);
    el.querySelector('[data-status]').innerHTML = statusPill(sc.id);
  });
  return cleanup;
}
