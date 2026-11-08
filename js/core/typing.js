// Спільний блок набору тексту: показ тексту, перевірка введення, підсвітка клавіш і пальців, жива статистика.
import { keyFor, FINGER, FINGER_NAMES, shiftFor, scriptOf, normalizeChar, charName, LANG_NAMES } from './layouts.js';
import { createKeyboard, createHands, capitalize } from './keyboard.js';
import { computeStats, recordChar, activity } from './stats.js';
import { esc, sound, fmtTime, icon } from './ui.js';
import { store } from './store.js';

const SENT = '​';

export function layoutHelp(lang) {
  return lang === 'uk'
    ? 'Увімкніть українську розкладку: натисніть <kbd class="kc">Alt</kbd> + <kbd class="kc">Shift</kbd> або <kbd class="kc">Win</kbd> + <kbd class="kc">Пробіл</kbd> (на Mac — <kbd class="kc">Ctrl</kbd> + <kbd class="kc">Пробіл</kbd>). Внизу екрана має з\'явитися «УКР».'
    : 'Увімкніть англійську розкладку: натисніть <kbd class="kc">Alt</kbd> + <kbd class="kc">Shift</kbd> або <kbd class="kc">Win</kbd> + <kbd class="kc">Пробіл</kbd> (на Mac — <kbd class="kc">Ctrl</kbd> + <kbd class="kc">Пробіл</kbd>). Внизу екрана має з\'явитися «ENG».';
}

// Вміщує вправу з клавіатурою у вікно: підбирає розмір клавіатури й прокручує сторінку.
// el — блок вправи, visual — контейнер клавіатури й рук, anchor — елемент над блоком, який теж має лишатися на екрані.
const TOP_GAP = 8, BOTTOM_GAP = 12, MAX_U = 60, MIN_U = 26, FLOOR_U = 20, SIDE_HANDS_W = 260, HANDS_RATIO = 172 / 440;
export function createScreenFit({ el, visual, hands = null, anchor = null }) {
  const topbarHeight = () => document.querySelector('.topbar')?.offsetHeight || 0;

  function fit() {
    const kbEl = visual.querySelector('.kb');
    if (!kbEl || !el.isConnected) return;
    const cols = +kbEl.style.getPropertyValue('--cols'), rows = +kbEl.style.getPropertyValue('--rows');
    const width = visual.clientWidth;
    const gap = parseFloat(getComputedStyle(visual).rowGap) || 0;
    const anchorOffset = anchor ? el.getBoundingClientRect().top - anchor.getBoundingClientRect().top : 0;
    const height = innerHeight - topbarHeight() - TOP_GAP - BOTTOM_GAP - anchorOffset - (el.offsetHeight - visual.offsetHeight);
    const unit = (w, h) => Math.min(w / cols, MAX_U, h / rows);

    let mode = '', u = unit(width, height);
    if (hands) {
      const svg = hands.el.querySelector('svg');
      const caption = Math.max(hands.el.offsetHeight - svg.getBoundingClientRect().height, 28);
      const stacked = unit(width, height - gap - Math.min(width, 420) * HANDS_RATIO - caption);
      const fitsSide = height >= SIDE_HANDS_W * HANDS_RATIO + caption;
      const side = fitsSide ? unit(width - SIDE_HANDS_W - gap, height) : 0;
      if (stacked >= unit(width, Infinity) || (stacked >= side && stacked >= MIN_U)) u = stacked;
      else if (side >= MIN_U) { mode = 'side'; u = side; }
      else { mode = 'no-hands'; u = unit(width, height - gap - caption); }
    }
    visual.classList.toggle('side', mode === 'side');
    visual.classList.toggle('no-hands', mode === 'no-hands');
    visual.style.setProperty('--kb-max-u', Math.max(u, FLOOR_U) + 'px');
  }

  function reveal() {
    if (!el.isConnected) return;
    const limit = topbarHeight() + TOP_GAP;
    const top = (anchor || el).getBoundingClientRect().top;
    if (top < limit || el.getBoundingClientRect().bottom > innerHeight - TOP_GAP) window.scrollBy(0, top - limit);
  }

  function onWindowResize() {
    if (!el.isConnected) { stop(); return; }
    fit();
  }
  function stop() { removeEventListener('resize', onWindowResize); }
  addEventListener('resize', onWindowResize);

  return { fit, reveal, stop };
}

export function createTypingBlock(root, opts) {
  const o = {
    text: '', lang: 'uk', stopOnError: false, timeLimit: 0, keyboard: true, hands: true, stats: 'full',
    blind: false, onFinish: null, onProgress: null, extend: null, countChars: true, autoFocus: true,
    anchor: null,
    startLabel: 'Натисніть тут і почніть друкувати', ...opts,
  };
  const s = store.data.settings;
  const kbLang = s.kbLayout === 'auto' ? o.lang : s.kbLayout;

  let text = o.text;
  let pos = 0, states = [], keystrokes = 0, errors = 0, startedAt = 0, endedAt = 0, tried = 0;
  let finished = false, timer = null, samples = [], session = {};
  let spans = [];

  const el = document.createElement('div');
  el.className = 'tb';
  el.innerHTML = `
    ${o.stats ? `<div class="tb-stats">
      <div class="stat"><b data-s="time">0:00</b><span>${o.timeLimit ? 'залишилось' : 'час'}</span></div>
      ${o.stats === 'full' ? `<div class="stat"><b data-s="wpm">0</b><span>слів/хв</span></div>
      <div class="stat"><b data-s="cpm">0</b><span>знаків/хв</span></div>` : ''}
      <div class="stat"><b data-s="acc">100%</b><span>точність</span></div>
      <div style="flex:1;min-width:140px"><div class="progress" role="progressbar" aria-label="Прогрес" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span style="width:0%"></span></div></div>
    </div>` : ''}
    <div class="notice warn layout-alert" data-layout hidden>${icon('warn')}<div><p><b>Схоже, увімкнена інша мова клавіатури.</b> Ця вправа — ${o.lang === 'uk' ? 'українською' : 'англійською'}.</p><p>${layoutHelp(o.lang)}</p></div></div>
    <div class="tb-stage">
      <div class="tb-text" aria-hidden="true"><div class="tb-lines"></div></div>
      <textarea class="tb-capture" aria-label="Поле для набору. Друкуйте текст, показаний на екрані. Esc — вийти з поля." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" rows="1"></textarea>
      <button class="tb-overlay" type="button">${icon('keyboard')} ${esc(o.startLabel)}</button>
    </div>
    <p class="sr-only" data-sr></p>
    <div class="tb-feedback" aria-live="polite"></div>
    <div class="tb-visual"></div>`;
  root.appendChild(el);

  const q = sel => el.querySelector(sel);
  const boxEl = q('.tb-text'), textEl = q('.tb-lines'), cap = q('.tb-capture'), overlay = q('.tb-overlay'), fb = q('.tb-feedback'), sr = q('[data-sr]');
  const layoutAlert = q('[data-layout]');
  const visual = q('.tb-visual');
  let kb = null, hands = null;
  if (o.keyboard) kb = createKeyboard(visual, { lang: kbLang, fingers: s.showFingers, blind: o.blind });
  if (o.hands) hands = createHands(visual, { colored: s.showFingers });

  const screen = createScreenFit({ el, visual, hands, anchor: o.anchor });

  function renderText() {
    textEl.innerHTML = '';
    spans = [];
    appendSpans(0);
  }
  function appendSpans(from) {
    const frag = document.createDocumentFragment();
    for (let i = from; i < text.length; i++) {
      const sp = document.createElement('span');
      const ch = text[i];
      sp.className = 'ch' + (ch === ' ' ? ' sp' : '');
      sp.textContent = ch;
      spans.push(sp);
      frag.appendChild(sp);
    }
    textEl.appendChild(frag);
  }
  function paint(i) {
    const sp = spans[i]; if (!sp) return;
    let c = 'ch' + (text[i] === ' ' ? ' sp' : '');
    if (i < pos) c += states[i] === 'err' ? ' err' : ' done';
    else if (i === pos) c += ' cur' + (tried ? ' tried' : '');
    else c += ' todo';
    sp.className = c;
  }
  function paintAll() { for (let i = 0; i < spans.length; i++) paint(i); }
  function scrollToCur() {
    const sp = spans[pos] || spans[spans.length - 1];
    if (!sp) return;
    // Поточний рядок завжди зверху, під ним — наступний. Браузер сам обмежує прокрутку в кінці тексту.
    textEl.scrollTop = sp.offsetTop - spans[0].offsetTop;
  }
  // Після зміни ширини текст переноситься інакше — повертаємо поточний рядок у видиму частину.
  const resizeObserver = new ResizeObserver(scrollToCur);
  resizeObserver.observe(textEl);

  function guide() {
    const ch = text[pos];
    if (ch === undefined) { kb && kb.highlight([]); hands && hands.set(null, null, ''); return; }
    const k = keyFor(o.lang, ch);
    sr.textContent = `Наступний символ: ${charName(ch)}`;
    if (!k) { kb && kb.highlight([]); hands && hands.set(null, null, `Наберіть: ${charName(ch)}`); return; }
    const showHint = !o.blind || tried >= 2;
    const shiftCode = k.shift ? shiftFor(k.code) : null;
    if (kb) kb.highlight(showHint ? [k.code] : [], showHint && shiftCode ? [shiftCode] : []);
    if (hands) {
      if (!showHint) { hands.set(null, null, 'Друкуйте наосліп. Після двох помилок з’явиться підказка.'); return; }
      const f = FINGER[k.code];
      let txt = `«${ch === ' ' ? 'Пробіл' : ch}» — ${FINGER_NAMES[f] || ''}`;
      if (shiftCode) txt += ` + Shift (${FINGER_NAMES[FINGER[shiftCode]]})`;
      hands.set(f, shiftCode ? FINGER[shiftCode] : null, capitalize(txt));
    }
  }

  function updateStats() {
    if (!o.stats) return;
    const now = endedAt || Date.now();
    const ms = startedAt ? now - startedAt : 0;
    const st = current(ms);
    const set = (k, v) => { const e = q(`[data-s="${k}"]`); if (e) e.textContent = v; };
    set('time', o.timeLimit ? fmtTime(o.timeLimit - ms / 1000) : fmtTime(ms / 1000));
    set('wpm', startedAt ? st.wpm : 0);
    set('cpm', startedAt ? st.cpm : 0);
    set('acc', st.acc + '%');
    const pct = o.timeLimit ? Math.min(100, (ms / 1000 / o.timeLimit) * 100) : Math.min(100, (pos / text.length) * 100);
    const bar = q('.progress');
    bar.firstElementChild.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', Math.round(pct));
  }
  function current(ms) {
    let correct = 0, uncorrected = 0;
    for (let i = 0; i < pos; i++) { if (states[i] === 'err') uncorrected++; else correct++; }
    return computeStats({ keystrokes, errors, correct, uncorrected, ms });
  }

  function start() {
    startedAt = Date.now();
    timer = setInterval(() => {
      const ms = Date.now() - startedAt;
      updateStats();
      if (ms / 2000 >= samples.length + 1) samples.push({ t: Math.round(ms / 1000), wpm: current(ms).wpm });
      if (o.timeLimit && ms >= o.timeLimit * 1000) finish();
    }, 250);
  }

  function finish() {
    if (finished) return;
    finished = true;
    endedAt = Date.now();
    clearInterval(timer);
    const ms = startedAt ? endedAt - startedAt : 0;
    samples.push({ t: Math.round(ms / 1000), wpm: current(ms).wpm });
    updateStats();
    kb && kb.highlight([]);
    hands && hands.set(null, null, '');
    cap.blur();
    overlay.hidden = true;
    boxEl.classList.remove('focused');
    sound('finish');
    const st = current(ms);
    o.onFinish && o.onFinish(st, { samples, session, typed: pos, text });
  }

  function setFeedback(msg, cls = '') { fb.textContent = msg; fb.className = 'tb-feedback' + (cls ? ' ' + cls : ''); }

  function input(chRaw, e) {
    if (finished) return;
    const ch = normalizeChar(chRaw);
    const exp = text[pos];
    if (exp === undefined) return;
    const se = scriptOf(exp), sc = scriptOf(ch);
    if (se && sc && se !== sc) {
      if (layoutAlert.hidden) { layoutAlert.hidden = false; screen.fit(); }
      setFeedback(`Увімкнена мова «${LANG_NAMES[sc]}». Перемкніть розкладку — і продовжуйте.`, 'warn');
      sound('error');
      return;
    }
    if (!layoutAlert.hidden) { layoutAlert.hidden = true; screen.fit(); }
    screen.reveal();
    if (!startedAt) start();
    activity();
    keystrokes++;
    const ok = ch === exp;
    if (o.countChars) recordChar(o.lang, exp, !ok);
    const sk = exp.toLowerCase();
    if (sk !== ' ') { const t = session[sk] || (session[sk] = { h: 0, e: 0 }); t.h++; if (!ok) t.e++; }
    const code = (e && e.code) || keyFor(o.lang, ch)?.code;
    if (ok) {
      if (kb && code) kb.flash(code, 'ok', 160);
      states[pos] = 'ok'; tried = 0; pos++;
      sound('key');
      if (fb.textContent) setFeedback('');
      paint(pos - 1); paint(pos);
    } else {
      errors++;
      if (kb && code) kb.flash(code, 'bad', 260);
      sound('error');
      let msg = `Спробуйте ще раз. Потрібно: ${charName(exp)}.`;
      if (scriptOf(exp) && ch.toLowerCase() === exp.toLowerCase()) {
        const caps = e && e.getModifierState && e.getModifierState('CapsLock');
        if (caps && exp === exp.toLowerCase()) msg = 'Увімкнено Caps Lock. Натисніть Caps Lock, щоб друкувати малими літерами.';
        else if (exp !== exp.toLowerCase()) msg = 'Тут потрібна велика літера: утримуйте Shift іншою рукою.';
        else msg = 'Тут потрібна мала літера — без Shift.';
      }
      if (o.stopOnError) {
        tried++;
        setFeedback(msg, 'bad');
        paint(pos);
      } else {
        states[pos] = 'err'; pos++;
        paint(pos - 1); paint(pos);
      }
    }
    if (o.extend && pos > text.length - 80) {
      const more = o.extend();
      if (more) { const from = text.length; text += more; appendSpans(from); paintAll(); }
    }
    o.onProgress && o.onProgress(pos, text.length);
    scrollToCur();
    guide();
    updateStats();
    if (pos >= text.length) finish();
  }

  function backspace(word = false) {
    if (finished || o.stopOnError || pos === 0) return;
    do {
      pos--; states[pos] = undefined; tried = 0;
      paint(pos + 1); paint(pos);
    } while (word && pos > 0 && text[pos - 1] !== ' ');
    kb && kb.flash('Backspace', 'pressed');
    scrollToCur(); guide(); updateStats();
  }

  // ---- введення з клавіатури ----
  cap.value = SENT;
  cap.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); cap.blur(); overlay.focus(); return; }
    if (e.key === 'Tab') return; // не блокуємо навігацію
    const altGr = e.getModifierState && e.getModifierState('AltGraph');
    if (e.key === 'Backspace') { e.preventDefault(); backspace(e.ctrlKey || e.altKey); return; }
    if ((e.ctrlKey || e.metaKey || e.altKey) && !altGr) return;
    if (e.key === 'Enter') { e.preventDefault(); if (text[pos] === '\n') input('\n', e); return; }
    if (e.key.length === 1) { e.preventDefault(); kb && kb.flash(e.code); input(e.key, e); return; }
    if (e.key === 'Shift' || e.key === 'CapsLock') { kb && kb.flash(e.code); }
  });
  // Резервний шлях для сенсорних клавіатур і складних методів введення.
  cap.addEventListener('input', () => {
    const v = cap.value;
    if (!v.startsWith(SENT)) { if (v.length < 1) backspace(); }
    else for (const ch of v.slice(1)) if (ch !== '\n') input(ch, null);
    cap.value = SENT;
  });
  const focus = () => { if (!finished) cap.focus({ preventScroll: true }); };
  cap.addEventListener('focus', () => { overlay.hidden = true; boxEl.classList.add('focused'); screen.reveal(); });
  cap.addEventListener('blur', () => { boxEl.classList.remove('focused'); if (!finished) overlay.hidden = false; });
  overlay.addEventListener('click', focus);
  boxEl.addEventListener('click', focus);

  renderText(); paintAll(); guide(); updateStats(); screen.fit();
  if (o.autoFocus) setTimeout(focus, 60);

  return {
    el,
    focus,
    finish,
    get finished() { return finished; },
    stats() { return current(startedAt ? (endedAt || Date.now()) - startedAt : 0); },
    destroy() { clearInterval(timer); resizeObserver.disconnect(); screen.stop(); el.remove(); },
    keyboard: kb,
  };
}
