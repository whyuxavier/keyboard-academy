// Віртуальна клавіатура та схема рук.
import { CHARS, SPECIAL, FINGER, FINGER_NAMES, mainGeometry, fullGeometry, FULL_SIZE, MAIN_SIZE, keyName, scriptOf } from './layouts.js';
import { esc } from './ui.js';

export function createKeyboard(host, opts = {}) {
  const o = { full: false, lang: 'uk', fingers: true, interactive: false, onKey: null, blind: false, ...opts };
  const geo = o.full ? fullGeometry() : mainGeometry(0);
  const size = o.full ? FULL_SIZE : MAIN_SIZE;
  const wrap = document.createElement('div');
  wrap.className = 'kb-wrap' + (o.full ? ' kb-full' : '');
  const kb = document.createElement('div');
  kb.className = 'kb' + (o.fingers ? ' fingers' : '') + (o.blind ? ' blind' : '');
  kb.style.setProperty('--cols', size.cols);
  kb.style.setProperty('--rows', size.rows);
  if (o.interactive) { kb.setAttribute('role', 'group'); kb.setAttribute('aria-label', 'Віртуальна клавіатура. Оберіть клавішу, щоб дізнатися про неї.'); }
  else kb.setAttribute('aria-hidden', 'true');
  const map = {};
  for (const k of geo) {
    const el = document.createElement(o.interactive ? 'button' : 'div');
    el.className = 'key';
    el.dataset.code = k.code;
    el.style.cssText = `--x:${k.x};--y:${k.y};--w:${k.w};--h:${k.h}`;
    if (FINGER[k.code]) el.dataset.finger = FINGER[k.code];
    if (o.interactive) {
      el.type = 'button';
      el.addEventListener('click', () => o.onKey && o.onKey(k.code));
    }
    el.innerHTML = '<span class="cap"></span>';
    map[k.code] = el;
    kb.appendChild(el);
  }
  wrap.appendChild(kb);
  host.appendChild(wrap);

  let lang = o.lang;
  function paint() {
    const chars = CHARS[lang];
    for (const [code, el] of Object.entries(map)) {
      const cap = el.firstChild;
      let html = '';
      if (code in SPECIAL && !(code in chars && code !== 'Space')) {
        const name = SPECIAL[code];
        html = code === 'Space' ? '' : `<span class="k-name">${esc(name)}</span>`;
        if (/^(Arrow|Numpad)/.test(code) && !/Enter|Lock/.test(code)) html = `<span class="k-main">${esc(name)}</span>`;
      } else if (chars[code]) {
        const [b, s] = chars[code];
        if (scriptOf(b)) html = `<span class="k-main">${esc(b.toUpperCase())}</span>`;
        else html = `<span class="k-shift">${esc(s)}</span><span class="k-main has-shift">${esc(b)}</span>`;
      }
      cap.innerHTML = html;
      if (o.interactive) el.setAttribute('aria-label', keyName(code, lang));
    }
  }
  paint();

  const timers = new Map();
  const api = {
    el: wrap,
    map,
    setLang(l) { lang = l; paint(); },
    setBlind(b) { kb.classList.toggle('blind', !!b); },
    setFingers(b) { kb.classList.toggle('fingers', !!b); },
    highlight(codes = [], secondary = []) {
      for (const el of Object.values(map)) el.classList.remove('target', 'target2');
      [].concat(codes).forEach(c => map[c] && map[c].classList.add('target'));
      [].concat(secondary).forEach(c => map[c] && map[c].classList.add('target2'));
    },
    select(code) {
      for (const el of Object.values(map)) el.classList.remove('selected');
      if (map[code]) map[code].classList.add('selected');
    },
    mark(codes, cls) { [].concat(codes).forEach(c => map[c] && map[c].classList.add(cls)); },
    flash(code, cls = 'pressed', ms = 220) {
      const el = map[code];
      if (!el) return;
      el.classList.add(cls);
      clearTimeout(timers.get(code + cls));
      timers.set(code + cls, setTimeout(() => el.classList.remove(cls), ms));
    },
    has(code) { return !!map[code]; },
  };
  return api;
}

const FINGER_SHAPES = {
  P: { x: 28, y: 56, w: 24, h: 64 },
  R: { x: 57, y: 32, w: 26, h: 88 },
  M: { x: 88, y: 20, w: 27, h: 100 },
  I: { x: 120, y: 36, w: 27, h: 84 },
};
function handGroup(side) {
  const p = side === 'L' ? 'L' : 'R';
  const f = Object.entries(FINGER_SHAPES).map(([k, s]) =>
    `<rect class="finger" data-f="${p}${k}" x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="12"/>`).join('');
  return `${f}<rect class="palm" x="24" y="96" width="128" height="68" rx="30"/>
    <rect class="finger" data-f="TH" x="148" y="92" width="26" height="62" rx="13" transform="rotate(-40 161 154)"/>`;
}
export function createHands(host, opts = {}) {
  const box = document.createElement('div');
  box.className = 'hands' + (opts.colored ? ' colored' : '');
  box.innerHTML = `<svg viewBox="0 0 440 172" role="img" aria-label="Схема рук: підсвічено палець, яким треба натиснути клавішу">
      <g>${handGroup('L')}</g>
      <g transform="translate(440 0) scale(-1 1)">${handGroup('R')}</g>
    </svg>
    <div class="finger-cap" aria-live="polite"></div>`;
  host.appendChild(box);
  const cap = box.querySelector('.finger-cap');
  return {
    el: box,
    set(finger, second = null, text = null) {
      box.querySelectorAll('.finger').forEach(f => {
        f.classList.toggle('on', f.dataset.f === finger);
        f.classList.toggle('on2', !!second && f.dataset.f === second && f.dataset.f !== finger);
      });
      cap.textContent = text != null ? text : (finger ? capitalize(FINGER_NAMES[finger]) : '');
    },
  };
}
export const capitalize = s => s ? s[0].toUpperCase() + s.slice(1) : s;
