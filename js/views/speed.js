// Тренажер швидкості друку: налаштування, тест, результати, адаптивне тренування.
import { store } from '../core/store.js';
import { icon, esc, fmtTime, announce } from '../core/ui.js';
import { createTypingBlock } from '../core/typing.js';
import { generate, generateAdaptive } from '../core/generate.js';
import { weakChars, checkAchievements } from '../core/stats.js';
import { lineChart } from '../core/charts.js';
import { LANG_NAMES } from '../core/layouts.js';
import { setLast } from '../core/nav.js';
import { nextLessonIndex } from './home.js';

const MODES = { chars: 'Символи', words: 'Слова', sentences: 'Речення', text: 'Текст' };
const LEVELS = { beginner: 'Початковий', intermediate: 'Середній', advanced: 'Складний', custom: 'Свій' };
const DURATIONS = [[30, '30 с'], [60, '1 хв'], [120, '2 хв'], [300, '5 хв'], [0, 'Без обмеження']];

function defaultCfg() {
  return { lang: store.data.settings.typingLang, mode: 'words', level: 'beginner', duration: 60, caps: false, punct: false, numbers: false, order: 'random', custom: '' };
}
function getCfg() {
  const c = { ...defaultCfg(), ...(store.data.settings.speedCfg || {}) };
  if (!MODES[c.mode]) c.mode = 'words';
  if (!LEVELS[c.level]) c.level = 'beginner';
  if (!DURATIONS.some(d => d[0] === c.duration)) c.duration = 60;
  if (!['uk', 'en'].includes(c.lang)) c.lang = 'uk';
  return c;
}

export function render(el, { query }) {
  let cfg = getCfg();
  let block = null;
  setLast('Тренажер швидкості');
  if (query.weak) return startTest({ weak: true, lang: query.lang === 'en' ? 'en' : query.lang === 'uk' ? 'uk' : cfg.lang });
  showConfig();
  return () => block && block.destroy();

  function seg(name, opts, value) {
    return `<div class="seg" role="group" aria-label="${esc(name)}">${opts.map(([v, l]) => `<button type="button" data-k="${name}" data-v="${v}" aria-pressed="${String(v) === String(value)}">${esc(l)}</button>`).join('')}</div>`;
  }

  function showConfig() {
    if (block) { block.destroy(); block = null; }
    const weak = weakChars(cfg.lang, 5);
    const rec = store.data.records[cfg.lang];
    const hist = store.data.speed.filter(r => r.lang === cfg.lang).slice(-5).reverse();
    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Швидкість друку</h1><p>Оберіть, що друкувати, і перевірте швидкість та точність. Таймер почнеться з першого натискання.</p></div>
      ${rec ? `<span class="record">${icon('award')} Рекорд: ${rec.wpm} сл/хв · ${rec.acc}%</span>` : ''}</div>
      <div class="card">
        <div class="cfg-grid">
          <div class="field"><span class="lbl">Мова</span>${seg('lang', [['uk', 'Українська'], ['en', 'English']], cfg.lang)}</div>
          <div class="field"><span class="lbl">Що друкувати</span>${seg('mode', Object.entries(MODES), cfg.mode)}</div>
          <div class="field"><span class="lbl">Рівень</span>${seg('level', Object.entries(LEVELS), cfg.level)}</div>
          <div class="field"><span class="lbl">Тривалість</span>${seg('duration', DURATIONS, cfg.duration)}</div>
          <div class="field" ${cfg.level === 'custom' ? '' : 'hidden'} data-custom>
            <label for="customLetters">Літери чи знаки для тренування</label>
            <input type="text" id="customLetters" value="${esc(cfg.custom)}" placeholder="${cfg.lang === 'uk' ? 'наприклад: ж ї ґ' : 'e.g.: q z x'}" maxlength="30" autocomplete="off">
            <small>Вправи міститимуть слова з цими літерами.</small>
          </div>
          <div class="field"><span class="lbl">Додатково</span>
            <label class="chk"><input type="checkbox" data-opt="caps" ${cfg.caps ? 'checked' : ''}> Великі літери</label>
            <label class="chk"><input type="checkbox" data-opt="punct" ${cfg.punct ? 'checked' : ''}> Розділові знаки</label>
            <label class="chk"><input type="checkbox" data-opt="numbers" ${cfg.numbers ? 'checked' : ''}> Цифри</label>
          </div>
          <div class="field"><span class="lbl">Порядок вправ</span>${seg('order', [['random', 'Випадковий'], ['seq', 'По черзі']], cfg.order)}</div>
        </div>
        <div class="btn-row" style="margin-top:1.4rem">
          <button class="btn primary" type="button" data-start>${icon('play')} Почати тест</button>
        </div>
      </div>
      <div class="grid c2 section">
        <div class="card">
          <h3>Тренування слабких символів</h3>
          ${weak.length ? `<p class="muted">Найчастіше помилки в цих символах. Вправа складена саме з них.</p>
            <div class="weak-list" style="margin-bottom:1rem">${weak.map(w => `<span class="weak-ch"><b>${esc(w.c)}</b><span>${Math.round(w.rate * 100)}% помилок</span></span>`).join('')}</div>
            <button class="btn soft" type="button" data-weak>${icon('target')} Тренувати слабкі символи</button>`
          : `<p class="muted">Поки що недостатньо даних. Пройдіть кілька тестів — і тут з’явиться персональна вправа.</p>`}
        </div>
        <div class="card">
          <h3>Останні результати · ${LANG_NAMES[cfg.lang]}</h3>
          ${hist.length ? `<table class="t"><thead><tr><th>Дата</th><th>сл/хв</th><th>зн/хв</th><th>Точність</th></tr></thead><tbody>
            ${hist.map(r => `<tr><td>${new Date(r.at).toLocaleDateString('uk-UA')}</td><td>${r.wpm}</td><td>${r.cpm}</td><td>${r.acc}%</td></tr>`).join('')}</tbody></table>`
          : '<p class="muted">Ще немає результатів.</p>'}
        </div>
      </div>
    </div>`;
    el.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k; let v = b.dataset.v;
      if (k === 'duration') v = Number(v);
      cfg[k] = v;
      if (k === 'level' && v === 'custom' && !cfg.custom) cfg.custom = '';
      saveCfg();
      const focusKey = `[data-k="${k}"][data-v="${b.dataset.v}"]`;
      showConfig();
      el.querySelector(focusKey)?.focus();
    }));
    el.querySelectorAll('[data-opt]').forEach(c => c.addEventListener('change', () => { cfg[c.dataset.opt] = c.checked; saveCfg(); }));
    el.querySelector('#customLetters')?.addEventListener('input', e => { cfg.custom = e.target.value; saveCfg(); });
    el.querySelector('[data-start]').addEventListener('click', () => {
      if (cfg.level === 'custom' && !cfg.custom.replace(/\s/g, '')) { el.querySelector('#customLetters').focus(); announce('Введіть літери для тренування'); return; }
      startTest({});
    });
    el.querySelector('[data-weak]')?.addEventListener('click', () => startTest({ weak: true, lang: cfg.lang }));
  }
  function saveCfg() { store.data.settings.speedCfg = { ...cfg }; store.save(); }

  function startTest({ weak = false, lang = cfg.lang, chars = null }) {
    const testLang = weak ? lang : cfg.lang;
    const weakSet = weak ? (chars && chars.length ? chars : weakChars(testLang, 5).map(w => w.c)) : [];
    const duration = weak ? 0 : cfg.duration;
    const unlimitedSize = { chars: 120, words: 220, sentences: 260, text: 0 }[cfg.mode];
    const approx = duration ? Math.max(300, duration * 9) : unlimitedSize;
    const text = weak ? generateAdaptive(testLang, weakSet, 260) : generate(cfg, approx);
    const extend = duration ? () => ' ' + generate({ ...cfg, order: 'random' }, 300) : null;
    const title = weak ? `Тренування слабких символів: ${weakSet.join(' ') || 'загальне'}` : `${MODES[cfg.mode]} · ${LEVELS[cfg.level]} · ${duration ? DURATIONS.find(d => d[0] === duration)[1] : 'без обмеження'}`;
    el.innerHTML = `<div class="page">
      <div class="lesson-bar">
        <button class="btn ghost small" type="button" data-back aria-label="Змінити налаштування" title="Змінити налаштування">${icon('left')}<span class="lbl">Змінити налаштування</span></button>
        <h1 class="lesson-bar-title">${weak ? 'Слабкі символи' : 'Тест швидкості'}</h1>
        <span class="pill green">${LANG_NAMES[testLang]}</span>
        <span class="muted lesson-bar-note" title="${esc(title)}">${esc(title)}</span>
        <button class="btn small" type="button" data-restart aria-label="Почати заново" title="Почати заново">${icon('repeat')}<span class="lbl">Почати заново</span></button>
        <button class="btn ghost small" type="button" data-stop>Завершити</button>
      </div>
      <div data-host></div>
    </div>`;
    el.querySelector('[data-back]').addEventListener('click', () => { showConfig(); window.scrollTo(0, 0); });
    el.querySelector('[data-restart]').addEventListener('click', () => startTest({ weak, lang }));
    el.querySelector('[data-stop]').addEventListener('click', () => block && block.finish());
    block = createTypingBlock(el.querySelector('[data-host]'), {
      text, lang: testLang, timeLimit: duration, extend, stopOnError: false, stats: 'full', anchor: el.querySelector('.lesson-bar'),
      onFinish: (st, info) => showResults(st, info, { weak, lang: testLang, title, chars: weakSet }),
    });
  }

  function showResults(st, info, meta) {
    const d = store.data;
    const valid = st.sec >= 10 || st.keystrokes >= 20;
    const prev = d.records[meta.lang];
    let isRecord = false;
    if (valid) {
      d.speed.push({ at: Date.now(), lang: meta.lang, mode: meta.weak ? 'weak' : cfg.mode, level: meta.weak ? 'adaptive' : cfg.level, wpm: st.wpm, gross: st.gross, cpm: st.cpm, acc: st.acc, errors: st.errors, correct: st.correct, incorrect: st.uncorrected, sec: st.sec });
      if (d.speed.length > 500) d.speed.splice(0, d.speed.length - 500);
      if (!prev || st.wpm > prev.wpm) { d.records[meta.lang] = { wpm: st.wpm, cpm: st.cpm, acc: st.acc, at: Date.now() }; isRecord = !!prev; }
      store.save();
      checkAchievements();
    }
    const sessionWeak = Object.entries(info.session).filter(([, s]) => s.e > 0).sort((a, b) => b[1].e - a[1].e || b[1].e / b[1].h - a[1].e / a[1].h).slice(0, 6);
    const recos = [];
    if (st.acc < 90) recos.push('Сповільніться трохи: точність важливіша за швидкість. Коли помилок стане менше, швидкість зросте сама.');
    if (sessionWeak.length) recos.push(`Потренуйте символи ${sessionWeak.slice(0, 3).map(([c]) => `«${c}»`).join(', ')} — для цього є персональна вправа.`);
    if (st.wpm < 15 && !meta.weak) recos.push(`Поверніться до уроків Академії друку: урок ${nextLessonIndex(meta.lang) + 1} допоможе закріпити правильні рухи пальців.`);
    if (st.acc >= 95 && st.wpm >= 20 && cfg.level !== 'advanced') recos.push('Чудова точність! Спробуйте складніший рівень або увімкніть великі літери й розділові знаки.');
    if (!recos.length) recos.push('Тренуйтеся щодня по 5–10 хвилин — це найкращий спосіб стабільно покращувати результат.');
    const labels = info.samples.map(s => fmtTime(s.t));
    window.scrollTo(0, 0);

    el.innerHTML = `<div class="page">
      <div class="page-head"><div><h1>Результат</h1><p>${esc(meta.title)}</p></div>
      ${isRecord ? `<span class="record">${icon('award')} Новий особистий рекорд!</span>` : ''}</div>
      ${!valid ? `<div class="notice warn" style="margin-bottom:1rem">${icon('info')}<p>Тест був дуже коротким, тому результат не збережено в історії.</p></div>` : ''}
      <div class="tiles">
        <div class="tile accent"><b>${st.wpm}</b><span>слів за хвилину (чиста швидкість)</span></div>
        <div class="tile"><b>${st.cpm}</b><span>знаків за хвилину</span></div>
        <div class="tile"><b>${st.acc}%</b><span>точність</span></div>
        <div class="tile"><b>${fmtTime(st.sec)}</b><span>час</span></div>
        <div class="tile"><b>${st.correct}</b><span>правильних знаків</span></div>
        <div class="tile"><b>${st.uncorrected}</b><span>невиправлених помилок</span></div>
        <div class="tile"><b>${st.errors}</b><span>усього помилок</span></div>
        <div class="tile"><b>${st.gross}</b><span>валова швидкість, сл/хв</span></div>
      </div>
      <p class="muted" style="margin-top:.6rem;font-size:.92rem">${prev ? `Попередній рекорд: ${prev.wpm} сл/хв, ${prev.acc}%. ${st.wpm >= prev.wpm ? 'Ви його перевершили!' : `До рекорду — ${prev.wpm - st.wpm} сл/хв.`}` : 'Це ваш перший результат — тепер буде з чим порівнювати.'} <a href="#/help?s=formulas">Як рахується швидкість?</a></p>
      <div class="grid c2 section">
        <div class="card"><h3>Швидкість під час тесту</h3>${info.samples.length > 1 ? lineChart({ series: [{ values: info.samples.map(s => s.wpm) }], labels, title: 'Графік швидкості під час тесту, слів за хвилину', height: 200 }) : '<p class="muted">Тест був надто коротким для графіка.</p>'}</div>
        <div class="card"><h3>Найслабші символи цього тесту</h3>
          ${sessionWeak.length ? `<div class="weak-list">${sessionWeak.map(([c, s]) => `<span class="weak-ch"><b>${esc(c)}</b><span>${s.e} ${s.e === 1 ? 'помилка' : 'помилки'}</span></span>`).join('')}</div>` : '<p>Жодної помилки — бездоганно!</p>'}
          <h3 style="margin-top:1.2rem">Поради</h3><ul style="padding-left:1.2rem;margin:0">${recos.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
        </div>
      </div>
      <div class="btn-row section">
        <button class="btn primary" type="button" data-again>${icon('repeat')} Ще раз</button>
        ${sessionWeak.length || weakChars(meta.lang).length ? `<button class="btn soft" type="button" data-weak>${icon('target')} Тренувати слабкі символи</button>` : ''}
        <button class="btn" type="button" data-cfg>Змінити налаштування</button>
      </div>
    </div>`;
    el.querySelector('[data-again]').addEventListener('click', () => startTest(meta.weak ? { weak: true, lang: meta.lang, chars: meta.chars } : {}));
    el.querySelector('[data-weak]')?.addEventListener('click', () => startTest({ weak: true, lang: meta.lang, chars: [...new Set([...sessionWeak.map(([c]) => c), ...weakChars(meta.lang, 5).map(w => w.c)])].slice(0, 5) }));
    el.querySelector('[data-cfg]').addEventListener('click', showConfig);
    el.querySelector('h1').setAttribute('tabindex', '-1');
    el.querySelector('h1').focus();
    announce(`Результат: ${st.wpm} слів за хвилину, точність ${st.acc}%.`);
  }
}
