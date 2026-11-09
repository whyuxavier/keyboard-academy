// Формули статистики, слабкі символи, практика, серії днів і досягнення.
import { store } from './store.js';
import { dayKey, toast, sound } from './ui.js';

/*
  Формули (див. також «Довідка → Як рахується швидкість»):
  - Натискання (keystrokes) — усі введені символи, без Backspace.
  - Помилки — усі неправильні натискання, навіть виправлені.
  - Хвилини = час від першого натискання / 60.
  - Валова швидкість (gross WPM) = (натискання / 5) / хвилини. «Слово» = 5 знаків.
  - Чиста швидкість (net WPM) = валова − (невиправлені помилки / хвилини), не менше 0.
  - Знаків за хвилину (CPM) = правильно набрані знаки / хвилини.
  - Точність = (натискання − помилки) / натискання × 100%.
*/
export function computeStats({ keystrokes = 0, errors = 0, correct = 0, uncorrected = 0, ms = 0 }) {
  const min = Math.max(ms, 1000) / 60000;
  const gross = keystrokes / 5 / min;
  const net = Math.max(0, gross - uncorrected / min);
  return {
    gross: Math.round(gross),
    wpm: Math.round(net),
    cpm: Math.round(correct / min),
    acc: keystrokes ? Math.max(0, Math.round(((keystrokes - errors) / keystrokes) * 1000) / 10) : 100,
    errors, correct, uncorrected, keystrokes,
    sec: Math.round(ms / 1000),
    ms,
  };
}

export function recordChar(lang, expected, wrong) {
  const c = expected.toLowerCase();
  if (c === ' ' || c === '\n') return;
  const t = store.data.chars[lang] || (store.data.chars[lang] = {});
  const s = t[c] || (t[c] = { h: 0, e: 0 });
  s.h++; if (wrong) s.e++;
}

// Слабкі символи: найвища згладжена частка помилок (мінімум кілька спроб).
export function weakChars(lang, n = 5, src = null) {
  const t = src || store.data.chars[lang] || {};
  return Object.entries(t)
    .filter(([, s]) => s.h >= 4 && s.e >= 2)
    .map(([c, s]) => ({ c, h: s.h, e: s.e, rate: (s.e + 0.5) / (s.h + 4) }))
    .filter(x => x.rate > 0.07)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, n);
}

/* ---------- облік часу практики ---------- */
let lastActivity = 0;
export function activity() { lastActivity = Date.now(); }
setInterval(() => {
  if (Date.now() - lastActivity < 15000 && document.visibilityState === 'visible') {
    const p = store.data.practice;
    p.total += 5;
    const k = dayKey();
    p.days[k] = (p.days[k] || 0) + 5;
    store.save();
    if (p.days[k] % 60 === 0) checkAchievements();
  }
}, 5000);

export function practicedToday() { return store.data.practice.days[dayKey()] || 0; }

export function streak() {
  const days = store.data.practice.days, daily = store.data.daily;
  const active = k => (days[k] || 0) >= 60 || daily[k];
  let n = 0;
  const d = new Date();
  if (!active(dayKey(d))) d.setDate(d.getDate() - 1); // серія ще триває, якщо вчора займалися
  while (active(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// Вогник: серія днів саме зі щоденним тренуванням. Пропущений день — вогник згасає.
// state: lit — сьогодні виконано; risk — учора виконано, сьогодні ще ні; out — серію втрачено; new — ще не починали.
export function dailyFlame() {
  const daily = store.data.daily;
  const d = new Date();
  const today = !!daily[dayKey(d)];
  if (!today) d.setDate(d.getDate() - 1);
  let n = 0;
  while (daily[dayKey(d)]) { n++; d.setDate(d.getDate() - 1); }
  const had = Object.values(daily).some(Boolean);
  return { n, state: today ? 'lit' : n ? 'risk' : had ? 'out' : 'new' };
}

/* ---------- досягнення ---------- */
import { COURSES } from '../content/lessons.js';
import { SHORTCUTS, CATEGORIES } from '../content/shortcuts.js';
import { SCENARIOS } from '../content/scenarios.js';

export const mastered = id => (store.data.shortcuts[id]?.ok || 0) >= 2;
export const lessonsDone = lang => COURSES[lang].filter((l, i) => store.data.lessons[`${lang}:${i}`]?.done).length;

export const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: 'check', name: 'Перший урок', desc: 'Пройдіть будь-який урок Академії друку.', test: d => Object.values(d.lessons).some(l => l.done) },
  { id: 'first_test', icon: 'gauge', name: 'Перший замір', desc: 'Завершіть перший тест швидкості.', test: d => d.speed.length > 0 },
  { id: 'ten_minutes', icon: 'clock', name: '10 хвилин практики', desc: 'Займіться 10 хвилин протягом одного дня.', test: d => Object.values(d.practice.days).some(s => s >= 600) },
  { id: 'cpm100', icon: 'gauge', name: '100 знаків за хвилину', desc: 'Наберіть 100 правильних знаків за хвилину в тесті швидкості.', test: d => d.speed.some(r => r.cpm >= 100 && r.sec >= 20) },
  { id: 'acc95', icon: 'target', name: 'Точність 95%', desc: 'Пройдіть тест швидкості (від 30 секунд) з точністю 95% або більше.', test: d => d.speed.some(r => r.acc >= 95 && r.sec >= 30) },
  { id: 'wpm30', icon: 'sparkle', name: '30 слів за хвилину', desc: 'Досягніть чистої швидкості 30 слів за хвилину.', test: d => d.speed.some(r => r.wpm >= 30 && r.sec >= 20) },
  { id: 'first_category', icon: 'combo', name: 'Перша категорія комбінацій', desc: 'Освойте всі комбінації однієї категорії.', test: () => CATEGORIES.some(c => SHORTCUTS.filter(s => s.cat === c.id).every(s => mastered(s.id))) },
  { id: 'shortcuts25', icon: 'combo', name: '25 комбінацій', desc: 'Освойте 25 комбінацій клавіш.', test: () => SHORTCUTS.filter(s => mastered(s.id)).length >= 25 },
  { id: 'streak7', icon: 'flame', name: '7 днів поспіль', desc: 'Займайтеся щонайменше хвилину сім днів підряд.', test: () => streak() >= 7 },
  { id: 'course', icon: 'award', name: 'Курс завершено', desc: 'Пройдіть усі уроки українського або англійського курсу.', test: () => ['uk', 'en'].some(l => lessonsDone(l) === COURSES[l].length) },
  { id: 'bilingual', icon: 'keyboard', name: 'Дві розкладки', desc: 'Пройдіть хоча б один урок в українському й англійському курсі.', test: () => lessonsDone('uk') > 0 && lessonsDone('en') > 0 },
  { id: 'explorer20', icon: 'keyboard', name: 'Знавець клавіатури', desc: 'Вивчіть 20 різних клавіш у розділі «Знайомство з клавіатурою».', test: d => d.keys.length >= 20 },
  { id: 'scenario1', icon: 'window', name: 'Перша життєва навичка', desc: 'Виконайте один сценарій «Комп\'ютер щодня».', test: d => Object.values(d.scenarios).some(s => s.done) },
  { id: 'scenarios_all', icon: 'window', name: 'Впевнений користувач', desc: 'Виконайте всі сценарії «Комп\'ютер щодня».', test: d => SCENARIOS.every(s => d.scenarios[s.id]?.done) },
  { id: 'daily_first', icon: 'calendar', name: 'Добра звичка', desc: 'Завершіть перше щоденне тренування.', test: d => Object.keys(d.daily).length > 0 },
  { id: 'hour', icon: 'clock', name: 'Година практики', desc: 'Наберіть загалом одну годину занять.', test: d => d.practice.total >= 3600 },
];

export function checkAchievements() {
  const d = store.data;
  let changed = false;
  for (const a of ACHIEVEMENTS) {
    if (d.achievements[a.id]) continue;
    let ok = false;
    try { ok = a.test(d); } catch (e) { ok = false; }
    if (ok) {
      d.achievements[a.id] = Date.now();
      changed = true;
      setTimeout(() => { toast(`Нове досягнення: ${a.name}`, { cls: 'ach-t', icon: 'award', duration: 5000 }); sound('success'); }, 400);
    }
  }
  if (changed) store.save();
}
