// Генерація тексту для тренажера швидкості й адаптивних вправ.
import { TEXTS, DRILL_PARTNERS } from '../content/texts.js';
import { lessonWords } from '../content/lessons.js';
import { store } from './store.js';
import { shuffle, pick } from './ui.js';

const PUNCT_RE = /[.,!?:;"()%№—–]/g;
const cap = w => w ? w[0].toUpperCase() + w.slice(1) : w;

function seqNext(key, len) {
  const s = store.data.seq;
  const i = (s[key] || 0) % Math.max(len, 1);
  s[key] = i + 1;
  store.save();
  return i;
}

export function allWords(lang) {
  const t = TEXTS[lang].words;
  return [...new Set([...t.easy, ...t.medium, ...t.hard, ...lessonWords(lang)].map(w => w.toLowerCase()))];
}

function wordPool(lang, level, custom) {
  const t = TEXTS[lang].words;
  if (level === 'custom' && custom) {
    const set = [...custom.toLowerCase()].filter(c => c.trim());
    const ws = allWords(lang).filter(w => set.some(c => w.includes(c)));
    return ws.length ? ws : null;
  }
  if (level === 'beginner') return t.easy;
  if (level === 'advanced') return [...t.medium, ...t.hard];
  return [...t.easy, ...t.medium];
}

function cleanSentence(s, cfg) {
  let out = s;
  if (!cfg.punct) out = out.replace(PUNCT_RE, ' ').replace(/\s-\s/g, ' ');
  if (!cfg.numbers) out = out.replace(/\d+([:.,]\d+)?/g, ' ');
  if (!cfg.caps) out = out.toLowerCase();
  return out.replace(/\s+/g, ' ').trim();
}

function filterByCustom(list, custom) {
  if (!custom) return list;
  const set = [...custom.toLowerCase()].filter(c => c.trim());
  const f = list.filter(s => set.some(c => s.toLowerCase().includes(c)));
  return f.length ? f : list;
}

// cfg: {lang, mode, level, caps, punct, numbers, order, custom}
export function generate(cfg, approxChars = 300) {
  const { lang, mode, level, order } = cfg;
  const T = TEXTS[lang];
  const out = [];
  let len = 0;
  const push = s => { out.push(s); len += s.length + 1; };
  const custom = level === 'custom' ? (cfg.custom || '').replace(/\s/g, '') : '';

  if (mode === 'chars') {
    let pool = level === 'beginner' ? T.home : level === 'custom' && custom ? custom.toLowerCase() : T.letters;
    if (level === 'advanced' || cfg.numbers) pool += '0123456789';
    if (level === 'advanced' || cfg.punct) pool += lang === 'uk' ? '.,!?:;' : '.,!?:;';
    const chars = [...new Set(pool)];
    let i = order === 'seq' ? seqNext(`chars:${lang}:${level}`, chars.length) : 0;
    while (len < approxChars) {
      let c = order === 'seq' ? chars[i++ % chars.length] : pick(chars);
      if (cfg.caps && /\p{L}/u.test(c) && Math.random() < 0.25) c = c.toUpperCase();
      push(c);
    }
    return out.join(' ');
  }

  if (mode === 'words') {
    const pool = wordPool(lang, level, custom) || wordPool(lang, 'intermediate');
    const list = order === 'seq' ? pool : shuffle(pool);
    let i = order === 'seq' ? seqNext(`words:${lang}:${level}`, pool.length) : 0;
    let capNext = cfg.caps;
    while (len < approxChars) {
      let w = list[i++ % list.length];
      if (order !== 'seq' && i % list.length === 0) list.splice(0, list.length, ...shuffle(pool));
      if (!cfg.caps) w = w.toLowerCase();
      else if (capNext || Math.random() < 0.15) w = cap(w);
      capNext = false;
      if (cfg.numbers && Math.random() < 0.1) push(String(Math.floor(Math.random() * (Math.random() < 0.5 ? 100 : 2100))));
      if (cfg.punct && Math.random() < 0.16) {
        const p = pick([',', ',', '.', '!', '?', ':']);
        w += p;
        if ('.!?'.includes(p)) capNext = cfg.caps;
      }
      push(w);
    }
    return out.join(' ');
  }

  const src = mode === 'text' ? T.passages : T.sentences;
  const lvl = level === 'beginner' ? 'easy' : level === 'advanced' ? 'hard' : level === 'custom' ? null : 'medium';
  let pool = lvl ? src[lvl] : [...src.easy, ...src.medium, ...src.hard];
  pool = filterByCustom(pool, custom);
  const seqKey = `${mode}:${lang}:${level}`;
  let i = order === 'seq' ? seqNext(seqKey, pool.length) : 0;
  const list = order === 'seq' ? pool : shuffle(pool);
  const minLen = mode === 'text' && approxChars <= 0 ? 1 : approxChars;
  do {
    push(cleanSentence(list[i++ % list.length], cfg));
  } while (len < minLen);
  return out.join(' ');
}

// Адаптивна вправа для слабких символів.
export function generateAdaptive(lang, chars, approxChars = 240) {
  const set = chars.map(c => c.toLowerCase()).filter(c => c.trim());
  if (!set.length) return generate({ lang, mode: 'words', level: 'intermediate', caps: false, punct: false, numbers: false, order: 'random' }, approxChars);
  const partners = [...DRILL_PARTNERS[lang]];
  const words = allWords(lang)
    .map(w => ({ w, n: set.reduce((a, c) => a + (w.split(c).length - 1), 0) }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n || a.w.length - b.w.length);
  const top = words.slice(0, 60).map(x => x.w);
  const out = [];
  let len = 0;
  const push = s => { out.push(s); len += s.length + 1; };
  while (len < approxChars) {
    // дриль: символ у поєднанні з частими літерами
    for (const c of set) {
      if (/\p{L}/u.test(c)) { const p1 = pick(partners), p2 = pick(partners); push(`${c}${p1} ${p2}${c} ${c}${c}${p2}`); }
      else push(`${pick(partners)}${c} ${pick(partners)}${pick(partners)}${c}`);
    }
    // слова з цими символами
    const ws = shuffle(top).slice(0, 6);
    ws.forEach(w => push(w));
    if (!top.length) for (const c of set) push(`${c} ${c}`);
  }
  return out.join(' ');
}
