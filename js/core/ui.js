// Загальні допоміжні функції інтерфейсу: іконки, діалоги, сповіщення, звук, мовлення.
import { store } from './store.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const ICONS = {
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
  hands: '<path d="M7 11V6.5a1.5 1.5 0 013 0V11"/><path d="M10 10V4.5a1.5 1.5 0 013 0V10"/><path d="M13 10.5V6a1.5 1.5 0 013 0v7"/><path d="M7 10.5a1.5 1.5 0 00-3 0V14a7 7 0 0014 0v-3a1.5 1.5 0 00-3 0"/>',
  gauge: '<path d="M4.5 17a8.5 8.5 0 1115 0"/><path d="M12 13l4-4"/><circle cx="12" cy="13" r="1.4"/>',
  combo: '<rect x="2.5" y="7" width="8" height="8" rx="2"/><rect x="13.5" y="7" width="8" height="8" rx="2"/><path d="M12 11h0"/><path d="M5 18.5h3M16 18.5h3"/>',
  keyboard: '<rect x="2" y="6" width="20" height="12" rx="2.5"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6"/>',
  window: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M3 9h18M7 6.5h.01M10 6.5h.01"/><path d="M7 13h6M7 16h9"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M9 15l2 2 4-4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 22l5-3 5 3-1.5-8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>',
  help: '<circle cx="12" cy="12" r="9.5"/><path d="M9.5 9.2a2.6 2.6 0 015 .9c0 1.7-2.5 2.2-2.5 3.9"/><path d="M12 17h.01"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  repeat: '<path d="M4 12a8 8 0 0113.7-5.7L20 8.5"/><path d="M20 3.5v5h-5"/><path d="M20 12a8 8 0 01-13.7 5.7L4 15.5"/><path d="M4 20.5v-5h5"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  speak: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 010 6"/>',
  info: '<circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5h.01"/>',
  warn: '<path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
  six7: '<path d="M10 5.5C7 6.2 4.5 9.6 4.5 14a3.5 3.5 0 107 0 3.5 3.5 0 00-7 0M14 5.5h6l-4 13"/>',
  flame: '<path d="M12 21c-4 0-7-2.7-7-6.5 0-3.5 3-5.5 3.5-9 2 1 3.5 3 3.5 5 1-1 1.5-2 1.5-3.5 2.5 1.8 5.5 4.5 5.5 7.5 0 3.8-3 6.5-7 6.5z"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5"/><path d="M4 19.5h16"/>',
  upload: '<path d="M12 16V5M7 9.5l5-5 5 5"/><path d="M4 19.5h16"/>',
  trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  sparkle: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
  github: '<path d="M9 19c-4.5 1.4-4.5-2.5-6.3-3M15 21.5v-3.8c0-1 .1-1.5-.5-2.1 2.8-.3 5.5-1.4 5.5-6a4.7 4.7 0 00-1.3-3.3 4.4 4.4 0 00-.1-3.3s-1.1-.3-3.5 1.3a12 12 0 00-6.2 0C6.5 2.7 5.4 3 5.4 3a4.4 4.4 0 00-.1 3.3A4.7 4.7 0 004 9.6c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2.1v3.8"/>',
};
export function icon(name) {
  return `<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONS[name] || ''}</svg></span>`;
}
export function hydrateIcons(root = document) {
  $$('[data-ico]', root).forEach(el => {
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<svg viewBox="0 0 24 24">${ICONS[el.dataset.ico] || ''}</svg>`;
  });
}

/* ---------- комбінації клавіш як клавіші ---------- */
// Вогник щоденного тренування. state: lit | risk | out | new
export function flameArt(state = 'lit') {
  const smoke = state === 'out' ? '<path class="fl-smoke" d="M20 15c-3-3 3-5 0-9M27 13c-2-2 2-4 0-7"/>' : '';
  return `<svg class="flame-art fl-${state}" viewBox="0 0 48 56" aria-hidden="true">${smoke}
    <g class="fl-body"><path class="fl-outer" d="M24 54C12.5 54 5 46.4 5 36.2c0-8.6 6.6-13.6 8.4-22.4 4.6 2.4 7.6 6.6 8 11.4C24.6 21.6 26 16.6 25.4 10 33.6 15.4 43 24.6 43 36.2 43 46.4 35.5 54 24 54z"/>
    <path class="fl-inner" d="M24 50c-5.4 0-9-3.7-9-8.6 0-4.6 3.6-6.8 4.6-11.2 2.6 1.4 4 3.6 4.4 6.2 1.6-1.4 2.4-3.4 2.4-5.6 3.6 2.6 6.6 6 6.6 10.6 0 4.9-3.6 8.6-9 8.6z"/></g></svg>`;
}

export function combo(keys, big = false) {
  return `<span class="combo${big ? ' big' : ''}" role="img" aria-label="${esc(keys.join(' плюс '))}">${keys.map(k => `<kbd class="kc">${esc(k)}</kbd>`).join('<span class="plus" aria-hidden="true">+</span>')}</span>`;
}

/* ---------- сповіщення ---------- */
export function toast(msg, opts = {}) {
  const box = $('#toasts');
  const t = document.createElement('div');
  t.className = 'toast' + (opts.cls ? ' ' + opts.cls : '');
  t.innerHTML = (opts.icon ? icon(opts.icon) : '') + `<span style="flex:1">${esc(msg)}</span>`;
  if (opts.action) {
    const b = document.createElement('button');
    b.className = 'btn'; b.type = 'button'; b.textContent = opts.action.label;
    b.onclick = () => { opts.action.onClick(); t.remove(); };
    t.appendChild(b);
  }
  box.appendChild(t);
  setTimeout(() => t.remove(), opts.duration || 4200);
}
export function announce(msg) {
  const el = $('#sr-live');
  el.textContent = '';
  setTimeout(() => { el.textContent = msg; }, 30);
}

/* ---------- діалог ---------- */
let openDialog = null;
export function modal({ title, body, actions = [], onClose, wide = false, dismissible = true }) {
  if (openDialog) openDialog.close();
  const d = document.createElement('dialog');
  d.setAttribute('aria-labelledby', 'dlg-title');
  if (wide) d.style.width = 'min(760px, calc(100vw - 24px))';
  d.innerHTML = `<div class="dlg">
    <div class="dlg-head"><h2 id="dlg-title">${esc(title)}</h2>${dismissible ? `<button class="x-btn" type="button" data-close aria-label="Закрити">${icon('x')}</button>` : ''}</div>
    <div class="dlg-body"></div>
    ${actions.length ? '<div class="dlg-foot"></div>' : ''}
  </div>`;
  const bodyEl = $('.dlg-body', d);
  if (typeof body === 'string') bodyEl.innerHTML = body; else if (body) bodyEl.appendChild(body);
  const foot = $('.dlg-foot', d);
  actions.forEach(a => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn' + (a.primary ? ' primary' : '') + (a.danger ? ' danger solid' : '');
    b.textContent = a.label;
    b.onclick = () => { const r = a.onClick ? a.onClick() : undefined; if (r !== false) close(); };
    foot.appendChild(b);
  });
  const prevFocus = document.activeElement;
  let closed = false;
  function close() {
    if (closed) return; closed = true;
    try { d.close(); } catch (e) { /* ignore */ }
    d.remove();
    if (openDialog === api) openDialog = null;
    onClose && onClose();
    if (prevFocus && prevFocus.focus && document.contains(prevFocus)) prevFocus.focus();
  }
  d.addEventListener('cancel', e => { e.preventDefault(); if (dismissible) close(); });
  d.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) close();
    if (dismissible && e.target === d) close();
  });
  document.body.appendChild(d);
  d.showModal();
  const api = { el: d, body: bodyEl, close };
  openDialog = api;
  return api;
}
export function confirmDialog(title, text, okLabel = 'Так', danger = false) {
  return new Promise(res => {
    let result = false;
    modal({
      title, body: `<p>${esc(text)}</p>`,
      actions: [
        { label: 'Скасувати', onClick: () => { result = false; } },
        { label: okLabel, primary: !danger, danger, onClick: () => { result = true; } },
      ],
      onClose: () => res(result),
    });
  });
}

/* ---------- звук ---------- */
let actx = null;
export function sound(type) {
  if (!store.data.settings.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    const now = actx.currentTime;
    const tone = (freq, start, dur, vol = 0.05, wave = 'sine') => {
      const o = actx.createOscillator(); const g = actx.createGain();
      o.type = wave; o.frequency.value = freq;
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(vol, now + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      o.connect(g).connect(actx.destination); o.start(now + start); o.stop(now + start + dur + 0.02);
    };
    if (type === 'key') tone(880, 0, 0.05, 0.025, 'triangle');
    else if (type === 'error') tone(196, 0, 0.16, 0.05, 'sine');
    else if (type === 'success') { tone(660, 0, 0.12); tone(880, 0.1, 0.18); }
    else if (type === 'finish') { tone(523, 0, 0.14); tone(659, 0.12, 0.14); tone(784, 0.24, 0.26); }
  } catch (e) { /* звук недоступний — не страшно */ }
}

/* ---------- мовлення ---------- */
export function speechSupported() { return 'speechSynthesis' in window; }
export function ukVoice() {
  if (!speechSupported()) return null;
  return speechSynthesis.getVoices().find(v => /^uk/i.test(v.lang)) || null;
}
export function speak(text, force = false) {
  if (!speechSupported()) return false;
  if (!force && !store.data.settings.speech) return false;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[«»"]/g, ''));
    u.lang = 'uk-UA';
    const v = ukVoice(); if (v) u.voice = v;
    u.rate = 0.95;
    speechSynthesis.speak(u);
    return true;
  } catch (e) { return false; }
}
export function stopSpeech() { try { speechSupported() && speechSynthesis.cancel(); } catch (e) { /* */ } }

/* ---------- формати ---------- */
export function fmtTime(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
export function fmtDuration(sec) {
  sec = Math.round(sec);
  if (sec < 60) return `${sec} с`;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  return h ? `${h} год ${m} хв` : `${m} хв`;
}
export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}
export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export function round(n, d = 0) { const p = 10 ** d; return Math.round(n * p) / p; }
