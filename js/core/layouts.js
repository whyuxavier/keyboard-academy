// Фізичні клавіші (KeyboardEvent.code), символи розкладок, пальці та геометрія клавіатури.

export const LANG_NAMES = { uk: 'Українська', en: 'English' };
export const LAYOUT_NAMES = { uk: 'ЙЦУКЕН', en: 'QWERTY' };

// [звичайний символ, символ із Shift]
const DIGITS_EN = { Backquote: ['`', '~'], Digit1: ['1', '!'], Digit2: ['2', '@'], Digit3: ['3', '#'], Digit4: ['4', '$'], Digit5: ['5', '%'], Digit6: ['6', '^'], Digit7: ['7', '&'], Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'], Minus: ['-', '_'], Equal: ['=', '+'] };
// Стандартна українська розкладка Windows («Українська (розширена)»)
const DIGITS_UK = { Backquote: ["'", '₴'], Digit1: ['1', '!'], Digit2: ['2', '"'], Digit3: ['3', '№'], Digit4: ['4', ';'], Digit5: ['5', '%'], Digit6: ['6', ':'], Digit7: ['7', '?'], Digit8: ['8', '*'], Digit9: ['9', '('], Digit0: ['0', ')'], Minus: ['-', '_'], Equal: ['=', '+'] };

const LETTERS_EN = 'qwertyuiop|asdfghjkl|zxcvbnm';
const CODES_ROW1 = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash'];
const CODES_ROW2 = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'];
const CODES_ROW3 = ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash'];

function buildEN() {
  const m = { ...DIGITS_EN };
  const [r1, r2, r3] = LETTERS_EN.split('|');
  [...r1].forEach((c, i) => { m[CODES_ROW1[i]] = [c, c.toUpperCase()]; });
  [...r2].forEach((c, i) => { m[CODES_ROW2[i]] = [c, c.toUpperCase()]; });
  [...r3].forEach((c, i) => { m[CODES_ROW3[i]] = [c, c.toUpperCase()]; });
  Object.assign(m, { BracketLeft: ['[', '{'], BracketRight: [']', '}'], Backslash: ['\\', '|'], Semicolon: [';', ':'], Quote: ["'", '"'], Comma: [',', '<'], Period: ['.', '>'], Slash: ['/', '?'], Space: [' ', ' '] });
  return m;
}
function buildUK() {
  const m = { ...DIGITS_UK };
  const r1 = 'йцукенгшщзхїґ', r2 = 'фівапролджє', r3 = 'ячсмитьбю';
  [...r1].forEach((c, i) => { m[CODES_ROW1[i]] = [c, c.toUpperCase()]; });
  [...r2].forEach((c, i) => { m[CODES_ROW2[i]] = [c, c.toUpperCase()]; });
  [...r3].forEach((c, i) => { m[CODES_ROW3[i]] = [c, c.toUpperCase()]; });
  m.Slash = ['.', ','];
  m.Space = [' ', ' '];
  return m;
}
export const CHARS = { en: buildEN(), uk: buildUK() };

// Зворотна карта: символ → {code, shift}
const REVERSE = { en: {}, uk: {} };
for (const lang of ['en', 'uk']) {
  for (const [code, [base, shifted]] of Object.entries(CHARS[lang])) {
    if (!(base in REVERSE[lang])) REVERSE[lang][base] = { code, shift: false };
    if (shifted !== base && !(shifted in REVERSE[lang])) REVERSE[lang][shifted] = { code, shift: true };
  }
}
export function keyFor(lang, ch) {
  if (ch === '\n') return { code: 'Enter', shift: false };
  return REVERSE[lang][ch] || null;
}

// Призначення пальців за фізичною клавішею.
export const FINGER = {};
const assign = (f, codes) => codes.forEach(c => { FINGER[c] = f; });
assign('LP', ['Backquote', 'Digit1', 'Tab', 'KeyQ', 'CapsLock', 'KeyA', 'ShiftLeft', 'KeyZ', 'ControlLeft', 'MetaLeft']);
assign('LR', ['Digit2', 'KeyW', 'KeyS', 'KeyX']);
assign('LM', ['Digit3', 'KeyE', 'KeyD', 'KeyC']);
assign('LI', ['Digit4', 'Digit5', 'KeyR', 'KeyT', 'KeyF', 'KeyG', 'KeyV', 'KeyB']);
assign('RI', ['Digit6', 'Digit7', 'KeyY', 'KeyU', 'KeyH', 'KeyJ', 'KeyN', 'KeyM']);
assign('RM', ['Digit8', 'KeyI', 'KeyK', 'Comma']);
assign('RR', ['Digit9', 'KeyO', 'KeyL', 'Period']);
assign('RP', ['Digit0', 'Minus', 'Equal', 'Backspace', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Semicolon', 'Quote', 'Enter', 'Slash', 'ShiftRight', 'ControlRight', 'MetaRight', 'ContextMenu']);
assign('TH', ['Space', 'AltLeft', 'AltRight']);

export const FINGER_NAMES = {
  LP: 'лівий мізинець', LR: 'лівий безіменний', LM: 'лівий середній', LI: 'лівий вказівний', TH: 'великий палець',
  RI: 'правий вказівний', RM: 'правий середній', RR: 'правий безіменний', RP: 'правий мізинець',
};
export const FINGER_ORDER = ['LP', 'LR', 'LM', 'LI', 'TH', 'RI', 'RM', 'RR', 'RP'];

// Shift натискається мізинцем протилежної руки.
export function shiftFor(code) {
  const f = FINGER[code] || '';
  return f.startsWith('L') ? 'ShiftRight' : 'ShiftLeft';
}

export function scriptOf(ch) {
  if (/[a-z]/i.test(ch)) return 'en';
  if (/[а-яґєіїё]/i.test(ch)) return 'uk';
  return null;
}
export function normalizeChar(ch) {
  if (ch === '’' || ch === 'ʼ' || ch === '‘') return "'";
  if (ch === '“' || ch === '”' || ch === '«' || ch === '»') return '"';
  if (ch === ' ') return ' ';
  return ch;
}

export const SPECIAL = {
  Backspace: 'Backspace', Tab: 'Tab', CapsLock: 'Caps Lock', Enter: 'Enter', ShiftLeft: 'Shift', ShiftRight: 'Shift',
  ControlLeft: 'Ctrl', ControlRight: 'Ctrl', MetaLeft: 'Win', MetaRight: 'Win', AltLeft: 'Alt', AltRight: 'Alt Gr', ContextMenu: 'Menu', Space: '',
  Escape: 'Esc', PrintScreen: 'PrtSc', ScrollLock: 'ScrLk', Pause: 'Pause', Insert: 'Insert', Home: 'Home', PageUp: 'PgUp', Delete: 'Delete', End: 'End', PageDown: 'PgDn',
  ArrowUp: '↑', ArrowLeft: '←', ArrowDown: '↓', ArrowRight: '→', NumLock: 'Num Lock', NumpadDivide: '/', NumpadMultiply: '*', NumpadSubtract: '−', NumpadAdd: '+', NumpadEnter: 'Enter', NumpadDecimal: '.',
};
for (let i = 1; i <= 12; i++) SPECIAL['F' + i] = 'F' + i;
for (let i = 0; i <= 9; i++) SPECIAL['Numpad' + i] = String(i);

const UK_NAMES = {
  Space: 'Пробіл', Enter: 'Enter', Backspace: 'Backspace', Tab: 'Tab', CapsLock: 'Caps Lock', ShiftLeft: 'лівий Shift', ShiftRight: 'правий Shift',
  ControlLeft: 'лівий Ctrl', ControlRight: 'правий Ctrl', AltLeft: 'лівий Alt', AltRight: 'правий Alt (Alt Gr)', MetaLeft: 'Windows', MetaRight: 'Windows (праворуч)', ContextMenu: 'Меню',
  Escape: 'Esc', Delete: 'Delete', Insert: 'Insert', Home: 'Home', End: 'End', PageUp: 'Page Up', PageDown: 'Page Down', PrintScreen: 'Print Screen', ScrollLock: 'Scroll Lock', Pause: 'Pause',
  ArrowUp: 'стрілка вгору', ArrowDown: 'стрілка вниз', ArrowLeft: 'стрілка ліворуч', ArrowRight: 'стрілка праворуч', NumLock: 'Num Lock', NumpadEnter: 'Enter на цифровому блоці',
  NumpadDivide: '/ на цифровому блоці', NumpadMultiply: '* на цифровому блоці', NumpadSubtract: '− на цифровому блоці', NumpadAdd: '+ на цифровому блоці', NumpadDecimal: 'крапка на цифровому блоці',
};
export function keyName(code, lang = 'uk') {
  if (UK_NAMES[code]) return UK_NAMES[code];
  if (/^F\d+$/.test(code)) return code;
  if (/^Numpad\d$/.test(code)) return `${code.slice(6)} на цифровому блоці`;
  const ch = CHARS[lang][code];
  if (ch) {
    const b = ch[0];
    if (scriptOf(b)) return b.toUpperCase();
    return b === ' ' ? 'Пробіл' : b;
  }
  return code;
}
export function charName(ch) {
  const names = { ' ': 'пробіл', '.': 'крапка', ',': 'кома', '!': 'знак оклику', '?': 'знак питання', ':': 'двокрапка', ';': 'крапка з комою', '-': 'дефіс', "'": 'апостроф', '"': 'лапки', '(': 'відкрита дужка', ')': 'закрита дужка', '%': 'відсоток', '№': 'знак номера', '\n': 'новий рядок' };
  if (names[ch]) return names[ch];
  if (scriptOf(ch)) return ch === ch.toUpperCase() && ch !== ch.toLowerCase() ? `велика ${ch}` : ch.toUpperCase();
  return ch;
}

/* ---------- геометрія ---------- */
const MAIN_ROWS = [
  [['Backquote', 1], ['Digit1', 1], ['Digit2', 1], ['Digit3', 1], ['Digit4', 1], ['Digit5', 1], ['Digit6', 1], ['Digit7', 1], ['Digit8', 1], ['Digit9', 1], ['Digit0', 1], ['Minus', 1], ['Equal', 1], ['Backspace', 2]],
  [['Tab', 1.5], ...CODES_ROW1.slice(0, 12).map(c => [c, 1]), ['Backslash', 1.5]],
  [['CapsLock', 1.75], ...CODES_ROW2.map(c => [c, 1]), ['Enter', 2.25]],
  [['ShiftLeft', 2.25], ...CODES_ROW3.map(c => [c, 1]), ['ShiftRight', 2.75]],
  [['ControlLeft', 1.25], ['MetaLeft', 1.25], ['AltLeft', 1.25], ['Space', 6.25], ['AltRight', 1.25], ['MetaRight', 1.25], ['ContextMenu', 1.25], ['ControlRight', 1.25]],
];
export function mainGeometry(y0 = 0) {
  const keys = [];
  MAIN_ROWS.forEach((row, r) => {
    let x = 0;
    row.forEach(([code, w]) => { keys.push({ code, x, y: y0 + r, w, h: 1 }); x += w; });
  });
  return keys;
}
export function fullGeometry() {
  const k = [];
  const add = (code, x, y, w = 1, h = 1) => k.push({ code, x, y, w, h });
  add('Escape', 0, 0);
  for (let i = 0; i < 4; i++) add('F' + (i + 1), 2 + i, 0);
  for (let i = 0; i < 4; i++) add('F' + (i + 5), 6.5 + i, 0);
  for (let i = 0; i < 4; i++) add('F' + (i + 9), 11 + i, 0);
  add('PrintScreen', 15.5, 0); add('ScrollLock', 16.5, 0); add('Pause', 17.5, 0);
  k.push(...mainGeometry(1.5));
  add('Insert', 15.5, 1.5); add('Home', 16.5, 1.5); add('PageUp', 17.5, 1.5);
  add('Delete', 15.5, 2.5); add('End', 16.5, 2.5); add('PageDown', 17.5, 2.5);
  add('ArrowUp', 16.5, 4.5); add('ArrowLeft', 15.5, 5.5); add('ArrowDown', 16.5, 5.5); add('ArrowRight', 17.5, 5.5);
  add('NumLock', 19, 1.5); add('NumpadDivide', 20, 1.5); add('NumpadMultiply', 21, 1.5); add('NumpadSubtract', 22, 1.5);
  add('Numpad7', 19, 2.5); add('Numpad8', 20, 2.5); add('Numpad9', 21, 2.5); add('NumpadAdd', 22, 2.5, 1, 2);
  add('Numpad4', 19, 3.5); add('Numpad5', 20, 3.5); add('Numpad6', 21, 3.5);
  add('Numpad1', 19, 4.5); add('Numpad2', 20, 4.5); add('Numpad3', 21, 4.5); add('NumpadEnter', 22, 4.5, 1, 2);
  add('Numpad0', 19, 5.5, 2); add('NumpadDecimal', 21, 5.5);
  return k;
}
export const FULL_SIZE = { cols: 23, rows: 6.5 };
export const MAIN_SIZE = { cols: 15, rows: 5 };
