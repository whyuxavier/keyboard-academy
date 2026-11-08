import { CHARS, scriptOf } from '../core/layouts.js';
// Пояснення клавіш для розділу «Знайомство з клавіатурою».
// practice: 'text' — спробувати в полі для тексту; 'press' — просто натиснути; 'none' — сайт не може перевірити (лише пояснення).

const K = {
  Enter: { name: 'Enter', what: 'Підтверджує дію або переносить текст на новий рядок.', where: 'У листах і документах, у формах на сайтах, у пошуку.', example: 'Надрукували запит у пошуку — натисніть Enter, щоб шукати.', shortcuts: ['shiftenter', 'pagebreak', 'enteropen'], practice: 'text', task: 'Клацніть у кінці тексту й натисніть Enter — курсор перейде на новий рядок.', initial: 'Перший рядок' },
  Backspace: { name: 'Backspace', what: 'Стирає символ ліворуч від курсору (перед ним).', where: 'Будь-де, де ви друкуєте текст.', example: 'Надрукували «кітт» — натисніть Backspace один раз, і зайва «т» зникне.', shortcuts: ['ctrlback'], practice: 'text', task: 'Клацніть у кінці слова й натисніть Backspace, щоб стерти зайву літеру.', initial: 'кітт' },
  Delete: { name: 'Delete (Del)', what: 'Стирає символ праворуч від курсору (після нього). У Провіднику — переносить файл у Кошик.', where: 'У тексті та під час роботи з файлами.', example: 'Курсор перед зайвою літерою — натисніть Delete.', shortcuts: ['ctrldel', 'delete', 'shiftdel', 'ctrlaltdel'], practice: 'text', task: 'Клацніть на самому початку тексту й натисніть Delete.', initial: 'ххата' },
  Shift: { name: 'Shift', what: 'Поки утримуєте Shift, літери друкуються великими, а цифрові клавіші дають символи: !, ?, ", %.', where: 'Для великих літер на початку речення та в іменах; для розділових знаків.', example: 'Утримуйте Shift і натисніть К — вийде велика «К».', shortcuts: ['shiftarrow', 'shiftend', 'shiftenter', 'layout'], practice: 'text', task: 'Утримуйте Shift і надрукуйте будь-яку літеру — вона буде великою.', initial: '' },
  Ctrl: { name: 'Ctrl (Control)', what: 'Сама по собі нічого не робить. Разом з іншими клавішами виконує команди: копіювати, вставити, зберегти.', where: 'У всіх програмах для швидких команд.', example: 'Ctrl + C — копіювати, Ctrl + V — вставити.', shortcuts: ['copy', 'paste', 'undo', 'save'], practice: 'press' },
  Alt: { name: 'Alt', what: 'Допоміжна клавіша для команд. Правий Alt (Alt Gr) у деяких розкладках вводить додаткові символи, наприклад ґ.', where: 'Для перемикання вікон і мови клавіатури.', example: 'Alt + Tab — перейти до іншого вікна.', shortcuts: ['alttab', 'altf4', 'layout', 'back'], practice: 'press' },
  Meta: { name: 'Windows (Win)', what: 'Відкриває меню «Пуск». Разом з іншими клавішами керує Windows.', where: 'Для запуску програм і керування вікнами.', example: 'Натисніть Win і надрукуйте назву програми — вона знайдеться.', shortcuts: ['start', 'wind', 'wine', 'winl'], practice: 'none', note: 'Сайт не може безпечно перевірити цю клавішу: вона відкриває меню «Пуск». Спробуйте самостійно й натисніть її ще раз, щоб закрити меню.' },
  CapsLock: { name: 'Caps Lock', what: 'Вмикає режим ВЕЛИКИХ ЛІТЕР, доки ви не натиснете її знову. Часто на клавіатурі світиться лампочка.', where: 'Для написів великими літерами. Якщо раптом усе друкується великими — перевірте Caps Lock.', example: 'Натисніть Caps Lock і надрукуйте «увага» — вийде «УВАГА».', shortcuts: [], practice: 'text', task: 'Натисніть Caps Lock, надрукуйте кілька літер, потім вимкніть Caps Lock.', initial: '' },
  Tab: { name: 'Tab', what: 'У тексті робить великий відступ. У формах переводить до наступного поля.', where: 'Під час заповнення анкет на сайтах: ім’я → Tab → прізвище.', example: 'Заповнили ім’я — натисніть Tab, і курсор перейде в наступне поле.', shortcuts: ['alttab', 'nexttab', 'wintab'], practice: 'press' },
  Escape: { name: 'Esc (Escape)', what: 'Скасовує або закриває: меню, спливне вікно, повноекранний режим.', where: 'Коли відкрилося щось зайве.', example: 'Відео на весь екран — Esc повертає звичайний вигляд.', shortcuts: ['esc', 'taskmgr'], practice: 'press' },
  Space: { name: 'Пробіл', what: 'Ставить проміжок між словами. На сторінках часто гортає вниз, а у відео ставить паузу.', where: 'У будь-якому тексті — після кожного слова.', example: 'Надрукуйте «добрий», натисніть Пробіл і надрукуйте «день».', shortcuts: ['layout2'], practice: 'text', task: 'Надрукуйте два слова, розділивши їх пробілом.', initial: '' },
  Arrows: { name: 'Стрілки', what: 'Переміщують курсор у тексті або вибір у списку — вгору, вниз, ліворуч, праворуч.', where: 'Щоб виправити літеру посередині слова, не стираючи все.', example: 'Помітили помилку на початку слова: натисніть ← кілька разів, виправте й поверніться →.', shortcuts: ['shiftarrow', 'ctrlarrow', 'snapleft'], practice: 'text', task: 'Клацніть у тексті й поводіть курсор стрілками.', initial: 'Рухайте курсор стрілками' },
  Home: { name: 'Home', what: 'Переносить курсор на початок рядка. На сторінці сайту — на самий верх.', where: 'У документах і довгих сторінках.', example: 'Прочитали довгу сторінку — Home повертає нагору.', shortcuts: ['home', 'ctrlhome'], practice: 'text', task: 'Клацніть у кінці рядка й натисніть Home.', initial: 'Цей рядок має початок і кінець.' },
  End: { name: 'End', what: 'Переносить курсор у кінець рядка. На сторінці — в самий низ.', where: 'Щоб продовжити друкувати після виправлення.', example: 'Виправили літеру посередині — End, і ви знову в кінці.', shortcuts: ['end', 'ctrlend', 'shiftend'], practice: 'text', task: 'Клацніть на початку рядка й натисніть End.', initial: 'Цей рядок має початок і кінець.' },
  PageUp: { name: 'Page Up (PgUp)', what: 'Гортає сторінку на один екран угору.', where: 'Для читання довгих текстів і сайтів.', example: 'Пропустили абзац — Page Up поверне на екран вище.', shortcuts: [], practice: 'press' },
  PageDown: { name: 'Page Down (PgDn)', what: 'Гортає сторінку на один екран униз.', where: 'Для зручного читання без мишки.', example: 'Читаєте статтю — Page Down гортає далі.', shortcuts: [], practice: 'press' },
  Insert: { name: 'Insert (Ins)', what: 'Перемикає режим заміни: нові літери починають замінювати старі. Якщо текст раптом «з’їдається» — натисніть Insert ще раз.', where: 'Рідко потрібна; важливо знати, як вимкнути.', example: 'Друкуєте, а літери праворуч зникають? Натисніть Insert.', shortcuts: [], practice: 'press' },
  PrintScreen: { name: 'Print Screen (PrtSc)', what: 'Робить знімок екрана й копіює його. У Windows 11 може відкривати інструмент «Ножиці».', where: 'Щоб зберегти чи показати те, що на екрані.', example: 'PrtSc → відкрийте Paint або месенджер → Ctrl + V.', shortcuts: ['prtsc', 'screenshot'], practice: 'none', note: 'Браузер зазвичай не бачить натискання PrtSc, тому тут ми лише пояснюємо. Спробуйте самостійно й вставте знімок у месенджер.' },
  ScrollLock: { name: 'Scroll Lock', what: 'Стара клавіша. Майже ніде не використовується; в Excel змінює роботу стрілок.', where: 'Якщо в Excel стрілки гортають таблицю замість переходу між клітинками — вимкніть Scroll Lock.', example: 'Зазвичай її можна не чіпати.', shortcuts: [], practice: 'press' },
  Pause: { name: 'Pause / Break', what: 'Стара клавіша для паузи. У сучасних програмах майже не використовується.', where: 'Деякі старі програми й ігри.', example: 'Зазвичай її можна не чіпати.', shortcuts: [], practice: 'press' },
  NumLock: { name: 'Num Lock', what: 'Вмикає цифри на цифровому блоці праворуч. Коли вимкнено — ці клавіші працюють як стрілки й Home/End.', where: 'Якщо цифровий блок не друкує цифри — натисніть Num Lock.', example: 'Лампочка Num Lock світиться — цифри працюють.', shortcuts: [], practice: 'press' },
  Numpad: { name: 'Цифровий блок', what: 'Окремі клавіші з цифрами, як на калькуляторі. Зручні для введення чисел і сум.', where: 'Для розрахунків, номерів телефонів, сум у банку.', example: 'Увімкніть Num Lock і наберіть 2026 на цифровому блоці.', shortcuts: [], practice: 'text', task: 'Увімкніть Num Lock і надрукуйте кілька цифр на цифровому блоці.', initial: '' },
  ContextMenu: { name: 'Меню', what: 'Відкриває контекстне меню — те саме, що клацання правою кнопкою миші.', where: 'Коли незручно клацати правою кнопкою.', example: 'Виділіть слово й натисніть Меню — з’являться «Копіювати», «Вставити».', shortcuts: [], practice: 'press' },
  Letter: { name: 'Літера', what: 'Друкує літеру. З Shift — велику літеру. Яка саме літера вийде, залежить від мови клавіатури: УКР чи ENG.', where: 'Будь-який текст.', example: 'У розкладці УКР ця клавіша друкує українську літеру, в ENG — англійську.', shortcuts: ['layout'], practice: 'text', task: 'Надрукуйте цю літеру в полі нижче.', initial: '' },
  Digit: { name: 'Цифра', what: 'Друкує цифру. З Shift — символ, намальований угорі на клавіші (наприклад, ! або %).', where: 'Номери телефонів, дати, суми.', example: 'Shift + 1 дає знак оклику «!».', shortcuts: [], practice: 'text', task: 'Надрукуйте цю цифру, а потім — із Shift.', initial: '' },
  Punct: { name: 'Розділовий знак', what: 'Друкує розділовий знак чи символ. У різних мовах на тій самій клавіші можуть бути різні знаки.', where: 'Крапки, коми, дужки, апостроф.', example: 'В українській розкладці крапка — праворуч від Ю, а кома — та сама клавіша з Shift.', shortcuts: [], practice: 'text', task: 'Натисніть цю клавішу в полі нижче — і з Shift, і без.', initial: '' },
};

const F_KEYS = {
  F1: 'Відкриває довідку в багатьох програмах.',
  F2: 'Перейменовує виділений файл чи папку.',
  F3: 'Пошук у деяких програмах і браузерах.',
  F4: 'Разом з Alt (Alt + F4) закриває програму. У браузері може відкривати адресний рядок.',
  F5: 'Оновлює сторінку в браузері. У PowerPoint — запускає показ слайдів.',
  F6: 'Переходить між частинами вікна: наприклад, до адресного рядка браузера.',
  F7: 'У Word — перевірка правопису.',
  F8: 'Під час увімкнення старого комп’ютера — меню завантаження. Зараз використовується рідко.',
  F9: 'У деяких програмах оновлює дані (наприклад, у Word — поля).',
  F10: 'Активує меню програми.',
  F11: 'Повноекранний режим у браузері.',
  F12: 'У Word — «Зберегти як». У браузері — інструменти розробника (можна просто закрити).',
};

export function keyInfo(code, lang = 'uk') {
  if (/^Shift/.test(code)) return { id: 'Shift', ...K.Shift };
  if (/^Control/.test(code)) return { id: 'Ctrl', ...K.Ctrl };
  if (/^Alt/.test(code)) return { id: 'Alt', ...K.Alt };
  if (/^Meta/.test(code)) return { id: 'Meta', ...K.Meta };
  if (/^Arrow/.test(code)) return { id: 'Arrows', ...K.Arrows };
  if (code === 'NumpadEnter') return { id: 'Enter', ...K.Enter };
  if (/^Numpad/.test(code)) return { id: 'Numpad', ...K.Numpad };
  if (/^F\d+$/.test(code)) {
    const safe = ['F1', 'F2', 'F3', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'].includes(code);
    return { id: code, name: code, what: F_KEYS[code], where: 'Функціональні клавіші F1–F12 у різних програмах роблять різне. На ноутбуках іноді потрібно утримувати клавішу Fn.', example: F_KEYS[code], shortcuts: code === 'F2' ? ['f2'] : code === 'F11' ? ['fullscreen'] : code === 'F4' ? ['altf4'] : code === 'F1' ? ['f1'] : [], practice: safe ? 'press' : 'none', note: safe ? '' : 'Ця клавіша керує самим браузером, тому тут ми не просимо її натискати.' };
  }
  if (K[code]) return { id: code, ...K[code] };
  const ch = CHARS[lang] && CHARS[lang][code];
  if (/^Key/.test(code) || (ch && scriptOf(ch[0]))) return { id: 'Letter', ...K.Letter };
  if (/^Digit/.test(code)) return { id: 'Digit', ...K.Digit };
  return { id: 'Punct', ...K.Punct };
}
export const EXPLORER_GROUPS = ['Enter', 'Backspace', 'Delete', 'Shift', 'Ctrl', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'Space', 'Arrows', 'Home', 'End', 'PageUp', 'PageDown', 'Insert', 'PrintScreen', 'NumLock', 'Numpad'];

// Гра «Знайди клавішу»: рівні складності.
export const FIND_LEVELS = {
  1: { name: 'Легкий', codes: ['Enter', 'Space', 'Backspace', 'ShiftLeft', 'Tab', 'Escape', 'CapsLock', 'KeyF', 'KeyJ'] },
  2: { name: 'Середній', codes: ['ControlLeft', 'AltLeft', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Digit1', 'Digit5', 'Digit0', 'KeyQ', 'KeyM', 'Slash', 'Period'] },
  3: { name: 'Складний', codes: ['PageUp', 'PageDown', 'Insert', 'F1', 'F2', 'F5', 'F10', 'Backquote', 'Minus', 'Equal', 'BracketLeft', 'BracketRight', 'Semicolon', 'Quote', 'Comma', 'Backslash', 'NumLock'] },
};
// Ці клавіші вважаються однаковими (лівий/правий).
export const SAME_KEY = { ShiftLeft: ['ShiftLeft', 'ShiftRight'], ControlLeft: ['ControlLeft', 'ControlRight'], AltLeft: ['AltLeft', 'AltRight'], Enter: ['Enter', 'NumpadEnter'] };
