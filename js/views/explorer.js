// Знайомство з клавіатурою: інтерактивна повнорозмірна клавіатура та гра «Знайди клавішу».
import { store } from '../core/store.js';
import { icon, esc, combo, sound, speak, shuffle, announce } from '../core/ui.js';
import { createKeyboard } from '../core/keyboard.js';
import { keyName, SPECIAL, CHARS, scriptOf } from '../core/layouts.js';
import { keyInfo, FIND_LEVELS, SAME_KEY } from '../content/keys.js';
import { byId } from '../content/shortcuts.js';
import { checkAchievements, activity } from '../core/stats.js';
import { setLast } from '../core/nav.js';

const NO_PREVENT = ['Tab', 'F11', 'F12', 'MetaLeft', 'MetaRight', 'PrintScreen'];
const sameGroup = (a, b) => keyInfo(a).id === keyInfo(b).id && ['Shift', 'Ctrl', 'Alt', 'Meta', 'Arrows', 'Numpad', 'Enter'].includes(keyInfo(a).id) ? true : a === b;

function capLabel(code, lang) {
  if (code === 'Space') return 'Пробіл';
  if (code in SPECIAL && !CHARS[lang][code]) return SPECIAL[code];
  const c = CHARS[lang][code];
  if (!c) return code;
  return scriptOf(c[0]) ? c[0].toUpperCase() : c[0];
}

export function render(el, { query }) {
  setLast('Знайомство з клавіатурою');
  let tab = query.tab === 'game' ? 'game' : 'explore';
  let lang = store.data.settings.kbLayout === 'auto' ? store.data.settings.typingLang : store.data.settings.kbLayout;
  let listen = true;
  let kb = null, selected = null, docHandler = null, practiceCleanup = null, gameTimer = null;

  el.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Знайомство з клавіатурою</h1><p>Що робить кожна клавіша — простими словами. Клацніть клавішу на екрані або натисніть її на своїй клавіатурі.</p></div>
      <div class="btn-row">
        <div class="seg" role="group" aria-label="Розділ">
          <button type="button" data-tab="explore" aria-pressed="${tab === 'explore'}">Дослідження</button>
          <button type="button" data-tab="game" aria-pressed="${tab === 'game'}">Гра «Знайди клавішу»</button>
        </div>
        <div class="seg" role="group" aria-label="Підписи клавіш">
          <button type="button" data-lang="uk" aria-pressed="${lang === 'uk'}">УКР</button>
          <button type="button" data-lang="en" aria-pressed="${lang === 'en'}">ENG</button>
        </div>
      </div>
    </div>
    <div data-top></div>
    <div class="card" style="padding:clamp(.6rem,1.5vw,1.2rem)" data-kbhost></div>
    <div data-bottom class="section" style="margin-top:1.2rem"></div>
  </div>`;
  const top = el.querySelector('[data-top]'), bottom = el.querySelector('[data-bottom]');
  kb = createKeyboard(el.querySelector('[data-kbhost]'), { full: true, lang, fingers: false, interactive: true, onKey: code => { if (tab === 'explore') showInfo(code, true); } });
  store.data.keys.forEach(c => kb.mark(c, 'explored'));

  el.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; el.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); setup(); }));
  el.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; kb.setLang(lang); el.querySelectorAll('[data-lang]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); if (selected && tab === 'explore') showInfo(selected, false); }));

  function detach() {
    if (docHandler) { document.removeEventListener('keydown', docHandler, true); docHandler = null; }
    if (practiceCleanup) { practiceCleanup(); practiceCleanup = null; }
    clearTimeout(gameTimer);
    kb.highlight([]);
  }

  function setup() {
    detach();
    if (tab === 'explore') setupExplore(); else setupGame();
  }

  /* ---------- дослідження ---------- */
  function setupExplore() {
    top.innerHTML = `<div class="notice" style="margin-bottom:1rem">${icon('info')}<div><p>Зелена крапка на клавіші — ви вже про неї дізналися. Вивчено: <b data-count>${store.data.keys.length}</b>.</p>
      <label class="chk" style="min-height:36px"><input type="checkbox" data-listen ${listen ? 'checked' : ''}> Показувати клавішу, яку я натискаю на своїй клавіатурі</label></div></div>`;
    top.querySelector('[data-listen]').addEventListener('change', e => { listen = e.target.checked; });
    bottom.innerHTML = selected ? '' : `<div class="card"><h2>Оберіть клавішу</h2><p class="muted">Почніть із найважливіших: <button class="btn small" data-pick="Enter">Enter</button> <button class="btn small" data-pick="Space">Пробіл</button> <button class="btn small" data-pick="Backspace">Backspace</button> <button class="btn small" data-pick="ShiftLeft">Shift</button></p></div>`;
    bottom.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => showInfo(b.dataset.pick, true)));
    if (selected) showInfo(selected, false);
    docHandler = e => {
      if (!listen || tab !== 'explore') return;
      const t = e.target;
      if (t.closest && t.closest('textarea, input, select, .practice-zone, dialog')) return;
      if ((t.tagName === 'BUTTON' || t.tagName === 'A') && (e.key === 'Enter' || e.key === ' ')) return;
      if (e.ctrlKey || e.metaKey) return;
      if (!kb.has(e.code)) return;
      if (!NO_PREVENT.includes(e.code)) e.preventDefault();
      kb.flash(e.code, 'pressed', 250);
      if (e.code !== 'Tab') showInfo(e.code, false);
    };
    document.addEventListener('keydown', docHandler, true);
  }

  function showInfo(code, fromClick) {
    selected = code;
    kb.select(code);
    activity();
    if (!store.data.keys.includes(code)) {
      store.data.keys.push(code); store.save(); kb.mark(code, 'explored'); checkAchievements();
      const c = top.querySelector('[data-count]'); if (c) c.textContent = store.data.keys.length;
    }
    const info = keyInfo(code, lang);
    const label = capLabel(code, lang);
    const name = info.id === 'Letter' || info.id === 'Digit' || info.id === 'Punct' ? `${info.name}: ${label}` : info.name;
    const rel = (info.shortcuts || []).map(byId).filter(Boolean);
    if (practiceCleanup) { practiceCleanup(); practiceCleanup = null; }
    bottom.innerHTML = `<div class="card key-info" aria-live="polite">
      <h2>${label !== name ? combo([label]) + ' ' : ''}${esc(name)}</h2>
      <div class="grid c2" style="align-items:start">
        <dl class="facts">
          <dt>Що робить</dt><dd>${esc(info.what)}</dd>
          <dt>Де знадобиться</dt><dd>${esc(info.where)}</dd>
          <dt>Приклад</dt><dd>${esc(info.example)}</dd>
          ${rel.length ? `<dt>Комбінації</dt><dd><div class="btn-row">${rel.map(s => `<a class="btn small" href="#/shortcuts/${s.id}">${esc(s.keys.join(' + '))} — ${esc(s.name)}</a>`).join('')}</div></dd>` : ''}
        </dl>
        <div data-pr><h3>Спробуйте</h3></div>
      </div>
    </div>`;
    const pr = bottom.querySelector('[data-pr]');
    const success = () => { sound('success'); res.className = 'result-line ok'; res.innerHTML = `${icon('check')} Чудово, вийшло!`; activity(); };
    let res;
    if (info.practice === 'text') {
      pr.insertAdjacentHTML('beforeend', `<p>${esc(info.task)}</p><textarea class="input" rows="2" aria-label="Поле для спроби" spellcheck="false">${esc(info.initial || '')}</textarea><p class="result-line" aria-live="polite"></p>`);
      const t = pr.querySelector('textarea'); res = pr.querySelector('.result-line');
      const fn = e => { if (sameGroup(e.code, code)) setTimeout(success, 0); };
      t.addEventListener('keydown', fn);
      practiceCleanup = () => t.removeEventListener('keydown', fn);
    } else if (info.practice === 'press') {
      pr.insertAdjacentHTML('beforeend', `<div class="practice-zone" tabindex="0" role="application" aria-label="Зона: натисніть клавішу ${esc(name)}">Клацніть тут і натисніть ${combo([label])}</div><p class="result-line" aria-live="polite"></p>`);
      const z = pr.querySelector('.practice-zone'); res = pr.querySelector('.result-line');
      const fn = e => {
        if (e.code === 'Tab' && code !== 'Tab') return;
        if (!NO_PREVENT.includes(e.code) || e.code === 'Tab') e.preventDefault();
        if (sameGroup(e.code, code)) success();
        else if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key) || /^(Shift|Control|Alt)/.test(code) === false) { res.className = 'result-line bad'; res.textContent = `Це ${keyName(e.code, lang)}. Спробуйте знайти ${name}.`; }
      };
      z.addEventListener('click', () => z.focus());
      z.addEventListener('keydown', fn);
      practiceCleanup = () => z.removeEventListener('keydown', fn);
    } else {
      pr.insertAdjacentHTML('beforeend', `<div class="notice warn">${icon('info')}<p>${esc(info.note || 'Цю клавішу краще спробувати самостійно.')}</p></div>`);
    }
    if (store.data.settings.speech && fromClick) speak(`${name}. ${info.what}`);
    if (fromClick && window.innerWidth < 900) bottom.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---------- гра ---------- */
  function setupGame() {
    let level = 1, round = 0, firstTry = 0, wrong = 0, target = null, targets = [], active = false, hinted = false;
    bottom.innerHTML = '';
    top.innerHTML = `<div class="card" style="margin-bottom:1rem">
      <div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center;justify-content:space-between">
        <div class="seg" role="group" aria-label="Рівень гри">${Object.entries(FIND_LEVELS).map(([k, v]) => `<button type="button" data-lv="${k}" aria-pressed="${String(k) === '1'}">${v.name}</button>`).join('')}</div>
        <div class="btn-row"><button class="btn primary" type="button" data-go>${icon('play')} Почати гру</button><button class="btn" type="button" data-hint hidden>Підказка</button><button class="btn ghost" type="button" data-stop hidden>Зупинити</button></div>
      </div>
      <div class="game-prompt" aria-live="polite" data-prompt>Знайдіть на своїй клавіатурі клавішу, яку назве гра, і натисніть її. 10 раундів.</div>
      <p class="result-line" style="text-align:center" aria-live="polite" data-res></p>
      <div class="progress" aria-hidden="true"><span data-bar style="width:0%"></span></div>
    </div>`;
    const prompt = top.querySelector('[data-prompt]'), res = top.querySelector('[data-res]'), bar = top.querySelector('[data-bar]');
    const go = top.querySelector('[data-go]'), hintB = top.querySelector('[data-hint]'), stop = top.querySelector('[data-stop]');
    top.querySelectorAll('[data-lv]').forEach(b => b.addEventListener('click', () => { level = Number(b.dataset.lv); top.querySelectorAll('[data-lv]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); }));
    go.addEventListener('click', start);
    stop.addEventListener('click', end);
    hintB.addEventListener('click', () => { hinted = true; kb.highlight([target].concat(SAME_KEY[target] || [])); res.textContent = 'Потрібна клавіша підсвічена синім.'; });

    function start() {
      targets = shuffle(FIND_LEVELS[level].codes).slice(0, 10);
      while (targets.length < 10) targets.push(...shuffle(FIND_LEVELS[level].codes).slice(0, 10 - targets.length));
      round = 0; firstTry = 0; active = true;
      go.hidden = true; hintB.hidden = false; stop.hidden = false;
      next();
    }
    function next() {
      kb.highlight([]); kb.select(null);
      wrong = 0; hinted = false;
      if (round >= targets.length) return end(true);
      target = targets[round];
      const label = capLabel(target, lang);
      prompt.innerHTML = `Раунд ${round + 1} з ${targets.length}: знайдіть ${combo([label])} <span class="sr-only">${esc(keyName(target, lang))}</span>`;
      res.className = 'result-line'; res.textContent = '';
      bar.style.width = (round / targets.length) * 100 + '%';
      if (store.data.settings.speech) speak(`Знайдіть клавішу ${keyName(target, lang)}`);
    }
    function end(finished) {
      active = false; clearTimeout(gameTimer);
      go.hidden = false; hintB.hidden = true; stop.hidden = true;
      go.innerHTML = `${icon('repeat')} Грати ще`;
      kb.highlight([]);
      if (finished === true) {
        bar.style.width = '100%';
        prompt.innerHTML = `Гру завершено! З першої спроби: <b>${firstTry} з ${targets.length}</b>`;
        res.className = 'result-line ok';
        res.textContent = firstTry >= 8 ? 'Відмінно! Спробуйте складніший рівень.' : 'Добре! Кожна гра допомагає запам’ятати клавіатуру.';
        sound('finish');
      } else { prompt.textContent = 'Гру зупинено. Оберіть рівень і почніть знову.'; res.textContent = ''; }
    }
    docHandler = e => {
      if (!active || tab !== 'game') return;
      if (e.target.closest && e.target.closest('dialog, input, textarea')) return;
      if (e.code === 'Tab' && target !== 'Tab') return;
      if (e.code === 'Escape' && target !== 'Escape') { end(); return; }
      if (!kb.has(e.code) && !['NumpadEnter'].includes(e.code)) return;
      if (!NO_PREVENT.includes(e.code) || e.code === 'Tab') e.preventDefault();
      if (gameTimer) return;
      activity();
      const okCodes = SAME_KEY[target] || [target];
      if (okCodes.includes(e.code)) {
        if (!wrong && !hinted) firstTry++;
        kb.highlight([]); kb.mark(e.code, 'ok');
        sound('success');
        res.className = 'result-line ok'; res.textContent = `Так! Це ${keyName(e.code, lang)}.`;
        announce(`Правильно. ${keyName(e.code, lang)}.`);
        round++;
        gameTimer = setTimeout(() => { gameTimer = null; kb.map[e.code]?.classList.remove('ok'); next(); }, 900);
      } else {
        wrong++;
        sound('error');
        kb.flash(e.code, 'bad', 400);
        res.className = 'result-line bad';
        res.textContent = `Це ${keyName(e.code, lang)}. Шукайте далі${wrong >= 2 ? ' — або натисніть «Підказка»' : ''}.`;
      }
    };
    document.addEventListener('keydown', docHandler, true);
  }

  setup();
  return detach;
}
