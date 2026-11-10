// Локальне сховище прогресу й налаштувань (localStorage) з версіонуванням, експортом та імпортом.
export const DATA_VERSION = 1;
const KEY = 'keyboard-academy:data';
const listeners = new Set();

export function defaultSettings() {
  return {
    theme: 'light',         // light | dark
    fontScale: 1,           // 1 | 1.125 | 1.25 | 1.4
    large: false,           // великий інтерфейс
    contrast: false,        // висока контрастність
    sound: true,
    speech: false,
    typingLang: 'uk',       // мова вправ
    kbLayout: 'auto',       // auto | uk | en — що показує віртуальна клавіатура
    motion: 'system',       // system | reduce | full
    showFingers: true,      // кольори пальців на клавіатурі
    unlockAll: false,       // відкрити всі уроки
    dailyMinutes: 5,        // 3 | 5 | 10
    dailyLang: 'auto',      // auto | uk | en
    speedCfg: null,
  };
}
export function defaultData() {
  return {
    version: DATA_VERSION,
    settings: defaultSettings(),
    onboarded: false,
    lessons: {},          // "uk:3": {done, bestAcc, bestCpm, stars, attempts, at}
    lessonDraft: null,    // незавершений урок
    speed: [],            // історія тестів швидкості
    records: {},          // { uk: {wpm, cpm, acc, at}, en: ... }
    chars: { uk: {}, en: {} }, // статистика символів { "ж": {h: спроби, e: помилки} }
    shortcuts: {},        // { copy: {ok: n, at} }
    scenarios: {},        // { message: {done:true, at} }
    keys: [],             // вивчені в «Знайомстві з клавіатурою» клавіші
    practice: { total: 0, days: {} }, // секунди практики
    achievements: {},     // { id: "дата" }
    daily: {},            // { "2026-11-08": true }
    seq: {},              // позиції послідовних вправ
    last: null,           // { hash, title, at }
  };
}

const isObj = v => v && typeof v === 'object' && !Array.isArray(v);
const num = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);

// Приводить будь-які збережені/імпортовані дані до коректної структури.
export function sanitize(raw) {
  const d = defaultData();
  if (!isObj(raw)) return d;
  const s = isObj(raw.settings) ? raw.settings : {};
  const ds = d.settings;
  for (const k of Object.keys(ds)) {
    if (k in s && (typeof s[k] === typeof ds[k] || (ds[k] === null && isObj(s[k])))) ds[k] = s[k];
  }
  if (!['light', 'dark'].includes(ds.theme)) ds.theme = 'light'; // колишнє «як у системі» теж стає світлою
  if (![1, 1.125, 1.25, 1.4].includes(ds.fontScale)) ds.fontScale = 1;
  if (!['uk', 'en'].includes(ds.typingLang)) ds.typingLang = 'uk';
  if (!['auto', 'uk', 'en'].includes(ds.kbLayout)) ds.kbLayout = 'auto';
  if (!['system', 'reduce', 'full'].includes(ds.motion)) ds.motion = 'system';
  if (![3, 5, 10].includes(ds.dailyMinutes)) ds.dailyMinutes = 5;
  if (!['auto', 'uk', 'en'].includes(ds.dailyLang)) ds.dailyLang = 'auto';
  d.onboarded = !!raw.onboarded;
  if (isObj(raw.lessons)) for (const [k, v] of Object.entries(raw.lessons)) {
    if (/^(uk|en):\d+$/.test(k) && isObj(v)) d.lessons[k] = { done: !!v.done, bestAcc: num(v.bestAcc), bestCpm: num(v.bestCpm), stars: num(v.stars), attempts: num(v.attempts), at: num(v.at) };
  }
  if (isObj(raw.lessonDraft) && ['uk', 'en'].includes(raw.lessonDraft.lang)) d.lessonDraft = { lang: raw.lessonDraft.lang, idx: num(raw.lessonDraft.idx), ex: num(raw.lessonDraft.ex), k: num(raw.lessonDraft.k), e: num(raw.lessonDraft.e), ms: num(raw.lessonDraft.ms), at: num(raw.lessonDraft.at) };
  if (Array.isArray(raw.speed)) d.speed = raw.speed.filter(isObj).slice(-500).map(r => ({
    at: num(r.at), lang: r.lang === 'en' ? 'en' : 'uk', mode: String(r.mode || 'words').slice(0, 20), level: String(r.level || '').slice(0, 20),
    wpm: num(r.wpm), gross: num(r.gross), cpm: num(r.cpm), acc: num(r.acc), errors: num(r.errors), correct: num(r.correct), incorrect: num(r.incorrect), sec: num(r.sec),
  }));
  if (isObj(raw.records)) for (const l of ['uk', 'en']) if (isObj(raw.records[l])) d.records[l] = { wpm: num(raw.records[l].wpm), cpm: num(raw.records[l].cpm), acc: num(raw.records[l].acc), at: num(raw.records[l].at) };
  if (isObj(raw.chars)) for (const l of ['uk', 'en']) if (isObj(raw.chars[l])) for (const [c, v] of Object.entries(raw.chars[l])) {
    if (c.length === 1 && isObj(v)) d.chars[l][c] = { h: num(v.h), e: num(v.e) };
  }
  if (isObj(raw.shortcuts)) for (const [k, v] of Object.entries(raw.shortcuts)) if (isObj(v)) d.shortcuts[String(k).slice(0, 40)] = { ok: num(v.ok), at: num(v.at) };
  if (isObj(raw.scenarios)) for (const [k, v] of Object.entries(raw.scenarios)) if (isObj(v)) d.scenarios[String(k).slice(0, 40)] = { done: !!v.done, at: num(v.at) };
  if (Array.isArray(raw.keys)) d.keys = [...new Set(raw.keys.filter(k => typeof k === 'string' && k.length < 30))];
  if (isObj(raw.practice)) {
    d.practice.total = num(raw.practice.total);
    if (isObj(raw.practice.days)) for (const [k, v] of Object.entries(raw.practice.days)) if (/^\d{4}-\d\d-\d\d$/.test(k)) d.practice.days[k] = num(v);
  }
  if (isObj(raw.achievements)) for (const [k, v] of Object.entries(raw.achievements)) d.achievements[String(k).slice(0, 40)] = num(v);
  if (isObj(raw.daily)) for (const [k, v] of Object.entries(raw.daily)) if (/^\d{4}-\d\d-\d\d$/.test(k)) d.daily[k] = !!v;
  if (isObj(raw.seq)) for (const [k, v] of Object.entries(raw.seq)) d.seq[String(k).slice(0, 40)] = num(v);
  if (isObj(raw.last) && typeof raw.last.hash === 'string' && raw.last.hash.startsWith('#/')) d.last = { hash: raw.last.hash.slice(0, 80), title: String(raw.last.title || '').slice(0, 120), at: num(raw.last.at) };
  return d;
}

// Міграції між версіями формату (на майбутнє).
function migrate(raw) {
  if (!isObj(raw)) return raw;
  const v = num(raw.version, 1);
  // if (v < 2) { ...перетворення... }
  raw.version = Math.max(v, DATA_VERSION);
  return raw;
}

let saveTimer = null;
let storageOk = true;

export const store = {
  data: defaultData(),
  load() {
    try {
      const txt = localStorage.getItem(KEY);
      if (txt) this.data = sanitize(migrate(JSON.parse(txt)));
    } catch (e) {
      storageOk = false;
      console.warn('Не вдалося прочитати збережені дані', e);
    }
    return this.data;
  },
  save(now = false) {
    clearTimeout(saveTimer);
    const write = () => {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.data));
        storageOk = true;
      } catch (e) {
        if (storageOk) {
          storageOk = false;
          window.dispatchEvent(new CustomEvent('ka:storage-error'));
        }
      }
    };
    if (now) write(); else saveTimer = setTimeout(write, 250);
    listeners.forEach(fn => { try { fn(this.data); } catch (e) { console.error(e); } });
  },
  get ok() { return storageOk; },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  exportJSON() {
    return JSON.stringify({ app: 'keyboard-academy', format: DATA_VERSION, exportedAt: new Date().toISOString(), data: this.data }, null, 2);
  },
  // Повертає {ok, error}
  importJSON(text) {
    let parsed;
    try { parsed = JSON.parse(text); } catch (e) { return { ok: false, error: 'Файл пошкоджений або це не файл прогресу.' }; }
    if (!isObj(parsed) || parsed.app !== 'keyboard-academy' || !isObj(parsed.data)) return { ok: false, error: 'Це не файл прогресу Keyboard Academy.' };
    if (num(parsed.format, 0) < 1 || num(parsed.format) > DATA_VERSION) return { ok: false, error: 'Файл створено в новішій версії застосунку. Оновіть сторінку й спробуйте ще раз.' };
    this.data = sanitize(migrate(parsed.data));
    this.data.onboarded = true;
    this.save(true);
    return { ok: true };
  },
  reset() {
    const keepSettings = this.data.settings;
    this.data = defaultData();
    this.data.settings = keepSettings;
    this.data.onboarded = true;
    this.save(true);
  },
};

window.addEventListener('pagehide', () => store.save(true));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') store.save(true); });
