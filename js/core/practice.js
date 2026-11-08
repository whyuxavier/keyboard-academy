// Практика комбінацій клавіш: справжня перевірка натискань або безпечна симуляція.
import { icon, esc, combo, sound, shuffle, announce } from './ui.js';
import { activity } from './stats.js';

export function matches(e, m) {
  const ctrl = e.ctrlKey || e.metaKey;
  if (!!m.ctrl !== ctrl) return false;
  if (m.shift !== null && !!m.shift !== e.shiftKey) return false;
  if (!!m.alt !== e.altKey) return false;
  const codes = m.codes || (m.code ? [m.code] : []);
  return codes.includes(e.code);
}
const isModifier = e => ['Control', 'Shift', 'Alt', 'Meta', 'CapsLock', 'AltGraph', 'OS'].includes(e.key);

const SCENE_TITLE = { doc: 'Документ — текстовий редактор', browser: 'Браузер', desktop: 'Робочий стіл Windows', files: 'Провідник', chat: 'Месенджер' };

export function demoBlock(sc) {
  return `<div class="demo-row" data-demo>
    ${combo(sc.keys, true)}
    <button class="btn small" type="button" data-play>${icon('play')} Показати</button>
  </div>
  <div class="mock" style="margin-top:.8rem"><div class="mock-bar"><span class="dots"><i></i><i></i><i></i></span><span class="ttl">${esc(SCENE_TITLE[sc.scene] || '')}</span></div>
    <div class="mock-body"><p data-state style="margin:0"><span class="muted">Було:</span> ${esc(sc.before)}</p></div></div>`;
}
export function bindDemo(root, sc) {
  const btn = root.querySelector('[data-play]');
  if (!btn) return;
  const caps = [...root.querySelectorAll('[data-demo] .kc')];
  const state = root.querySelector('[data-state]');
  const reduce = document.documentElement.dataset.motion === 'reduce' || (matchMedia('(prefers-reduced-motion: reduce)').matches && document.documentElement.dataset.motion !== 'full');
  btn.addEventListener('click', () => {
    caps.forEach(c => c.classList.remove('on'));
    state.innerHTML = `<span class="muted">Було:</span> ${esc(sc.before)}`;
    const end = () => { state.innerHTML = `<span class="muted">Стало:</span> <b>${esc(sc.after)}</b>`; announce(`Результат: ${sc.after}`); };
    if (reduce) { caps.forEach(c => c.classList.add('on')); end(); setTimeout(() => caps.forEach(c => c.classList.remove('on')), 1200); return; }
    caps.forEach((c, i) => setTimeout(() => c.classList.add('on'), 350 * i));
    setTimeout(() => { end(); }, 350 * caps.length + 200);
    setTimeout(() => caps.forEach(c => c.classList.remove('on')), 350 * caps.length + 900);
  });
}

// Створює вправу. onSuccess викликається один раз за кожне успішне виконання.
export function createPractice(host, sc, onSuccess) {
  const p = sc.practice;
  const wrap = document.createElement('div');
  wrap.className = 'practice';
  const isSim = p.type === 'sim';
  const badge = isSim
    ? `<div class="sim-badge">${icon('info')} Симуляція</div><p class="muted" style="margin:.5rem 0 0">Ця комбінація керує ${sc.os === 'browser' ? 'самим браузером' : 'самою Windows'}, тому сайт не може (і не повинен) її перехоплювати. Тренуємося безпечно: натискайте екранні клавіші по черзі. На справжній клавіатурі утримуйте першу клавішу й натисніть наступну.</p>`
    : `<div class="real-badge">${icon('check')} Справжня перевірка — натискайте клавіші на своїй клавіатурі</div>`;
  wrap.innerHTML = `${badge}<div data-area style="margin-top:.9rem"></div><p class="result-line" aria-live="polite" style="margin-top:.7rem"></p>`;
  host.appendChild(wrap);
  const area = wrap.querySelector('[data-area]');
  const res = wrap.querySelector('.result-line');
  const cleanups = [];
  const on = (el, ev, fn) => { el.addEventListener(ev, fn); cleanups.push(() => el.removeEventListener(ev, fn)); };
  let doneOnce = false;
  const ok = (msg) => {
    res.className = 'result-line ok';
    res.innerHTML = `${icon('check')} ${esc(msg || 'Правильно! ' + sc.after)}`;
    sound('success');
    activity();
    if (!doneOnce) { doneOnce = true; }
    onSuccess && onSuccess();
  };
  const hint = (msg) => { res.className = 'result-line bad'; res.textContent = msg; };
  const ta = (value, rows = 3, extra = '') => `<textarea class="input" rows="${rows}" spellcheck="false" ${extra}>${esc(value)}</textarea>`;

  switch (p.type) {
    case 'copy': {
      area.innerHTML = `<p>Клацніть у поле, виділіть адресу (мишкою або <kbd class="kc">Ctrl</kbd> + <kbd class="kc">A</kbd>) і натисніть <b>${sc.keys.join(' + ')}</b>.</p>${ta('Вул. Садова, 12', 1, 'readonly aria-label="Текст для копіювання"')}`;
      const t = area.querySelector('textarea');
      on(t, 'copy', () => { if (t.selectionEnd > t.selectionStart) ok('Скопійовано! Тепер цей текст можна вставити будь-де через Ctrl + V.'); });
      on(t, 'keydown', e => { if (matches(e, { ctrl: true, code: 'KeyC' }) && t.selectionEnd === t.selectionStart) hint('Спершу виділіть текст, а потім копіюйте.'); });
      break;
    }
    case 'paste': {
      area.innerHTML = `<p>1. Скопіюйте рядок (клацніть у нього, <kbd class="kc">Ctrl</kbd> + <kbd class="kc">A</kbd>, <kbd class="kc">Ctrl</kbd> + <kbd class="kc">C</kbd>). 2. Клацніть у порожнє поле й натисніть <b>Ctrl + V</b>.</p>
        ${ta('Привіт від Keyboard Academy!', 1, 'readonly aria-label="Рядок для копіювання"')}
        <input type="text" style="margin-top:.6rem" aria-label="Порожнє поле для вставлення" placeholder="Вставте сюди">`;
      const inp = area.querySelector('input');
      on(inp, 'paste', e => {
        const txt = (e.clipboardData || window.clipboardData)?.getData('text') || '';
        if (txt.trim()) setTimeout(() => ok('Вставлено! Так само вставляють текст у листи й повідомлення.'), 0);
        else hint('Буфер порожній — спершу скопіюйте текст зверху.');
      });
      break;
    }
    case 'cut': {
      area.innerHTML = `<p>Виділіть слово <b>ЗАЙВЕ</b> (двічі клацніть по ньому) і натисніть <b>Ctrl + X</b>.</p>${ta('Я люблю ЗАЙВЕ читати книжки.', 2, 'aria-label="Текст для вирізання"')}`;
      const t = area.querySelector('textarea');
      on(t, 'cut', () => {
        const sel = t.value.slice(t.selectionStart, t.selectionEnd);
        if (sel.includes('ЗАЙВЕ')) ok('Вирізано! Слово зникло, але його можна вставити деінде через Ctrl + V.');
        else if (sel.trim()) setTimeout(() => hint('Вирізано, але не те слово. Скасуйте (Ctrl + Z) і виділіть «ЗАЙВЕ».'), 0);
      });
      break;
    }
    case 'undo': {
      area.innerHTML = `<p>Зітріть кілька літер (<kbd class="kc">Backspace</kbd>), а потім натисніть <b>Ctrl + Z</b> — і вони повернуться.</p>${ta('Цей текст можна стерти й повернути.', 2, 'aria-label="Текст для скасування"')}`;
      const t = area.querySelector('textarea');
      let edited = false;
      on(t, 'input', () => { edited = true; });
      on(t, 'keydown', e => {
        if (matches(e, { ctrl: true, code: 'KeyZ' })) { if (edited) setTimeout(() => ok('Скасовано! Ctrl + Z повертає попередній стан.'), 0); else hint('Спершу щось змініть у тексті — потім буде що скасовувати.'); }
      });
      break;
    }
    case 'redo': {
      const label = p.shiftZ ? 'Ctrl + Shift + Z' : 'Ctrl + Y';
      area.innerHTML = `<p>1. Допишіть слово в кінці. 2. Скасуйте <b>Ctrl + Z</b>. 3. Поверніть дію <b>${label}</b>.</p>${ta('Повтор повертає скасовану дію:', 2, 'aria-label="Текст для повтору"')}`;
      const t = area.querySelector('textarea');
      let undone = false, edited = false;
      on(t, 'input', e => { if (e.inputType !== 'historyUndo' && e.inputType !== 'historyRedo') edited = true; });
      on(t, 'keydown', e => {
        if (matches(e, { ctrl: true, code: 'KeyZ' })) { if (edited) undone = true; return; }
        const redo = p.shiftZ ? matches(e, { ctrl: true, shift: true, code: 'KeyZ' }) : (matches(e, { ctrl: true, code: 'KeyY' }) || matches(e, { ctrl: true, shift: true, code: 'KeyZ' }));
        if (redo) { if (undone) setTimeout(() => ok('Дію повернуто!'), 0); else hint('Спершу допишіть щось і скасуйте через Ctrl + Z.'); }
      });
      break;
    }
    case 'selectAll': {
      area.innerHTML = `<p>Клацніть у текст і натисніть <b>Ctrl + A</b> — виділиться все.</p>${ta('Перший рядок.\nДругий рядок.\nТретій рядок.', 3, 'aria-label="Текст для виділення"')}`;
      const t = area.querySelector('textarea');
      on(t, 'keydown', e => { if (matches(e, { ctrl: true, code: 'KeyA' })) setTimeout(() => { if (t.selectionEnd - t.selectionStart >= t.value.length - 1) ok('Увесь текст виділено! Тепер його можна скопіювати чи видалити.'); }, 0); });
      break;
    }
    case 'text': {
      area.innerHTML = `<p>${esc(p.task)}</p>${ta(p.initial, Math.max(2, p.initial.split('\n').length + (p.chat ? 1 : 0)), 'aria-label="Поле для вправи"')}`;
      const t = area.querySelector('textarea');
      on(t, 'keydown', e => {
        if (p.chat && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); hint('У месенджері Enter надіслав би повідомлення. Для нового рядка — Shift + Enter.'); return; }
        if (matches(e, p.match)) {
          setTimeout(() => {
            if (p.needSelection && t.selectionEnd === t.selectionStart) { hint('Комбінація правильна, але нічого не виділилося. Поставте курсор у текст і спробуйте ще раз.'); return; }
            ok();
          }, 0);
        }
      });
      break;
    }
    case 'key': {
      const fx = p.effect;
      const sample = fx === 'bold' || fx === 'italic' || fx === 'underline'
        ? `<p style="font-size:1.2rem">Нагадування: <span data-sample>зустріч у неділю</span></p>`
        : fx && fx.startsWith('zoom') ? `<p data-sample class="zoomable" style="font-size:1rem">Текст на сторінці сайту. Масштаб: <b data-z>100%</b></p>` : '';
      area.innerHTML = `${sample}<div class="practice-zone" tabindex="0" role="application" aria-label="Зона практики: натисніть ${esc(sc.keys.join(' плюс '))}">${icon('keyboard')}&nbsp; Клацніть тут і натисніть ${combo(sc.keys)}</div>`;
      const z = area.querySelector('.practice-zone');
      const s = area.querySelector('[data-sample]');
      let zoom = 100;
      on(z, 'click', () => z.focus());
      on(z, 'keydown', e => {
        if (e.key === 'Tab' && !e.ctrlKey) return;
        if (matches(e, p.match)) {
          if (p.prevent) e.preventDefault();
          if (fx === 'bold') s.style.fontWeight = s.style.fontWeight === '700' ? '400' : '700';
          if (fx === 'italic') s.style.fontStyle = s.style.fontStyle === 'italic' ? 'normal' : 'italic';
          if (fx === 'underline') s.style.textDecoration = s.style.textDecoration === 'underline' ? 'none' : 'underline';
          if (fx && fx.startsWith('zoom')) {
            zoom = fx === 'zoomin' ? Math.min(200, zoom + 25) : fx === 'zoomout' ? Math.max(50, zoom - 25) : 100;
            if (fx === 'zoomreset') zoom = 100;
            s.style.fontSize = zoom / 100 + 'rem';
            s.querySelector('[data-z]').textContent = zoom + '%';
          }
          ok();
          return;
        }
        if (e.key === 'Escape' && sc.id !== 'esc') { z.blur(); return; }
        if (isModifier(e)) return;
        // Блокуємо випадкові команди браузера у зоні практики (де це можливо).
        if (e.ctrlKey || e.metaKey || /^F\d+$/.test(e.key)) e.preventDefault();
        hint(`Це не та комбінація. Потрібно: ${sc.keys.join(' + ')}.`);
      });
      break;
    }
    case 'sim': {
      const pool = ['Ctrl', 'Shift', 'Alt', 'Win', 'Tab', 'Esc', 'Enter'];
      const opts = shuffle([...new Set([...sc.keys, ...shuffle(pool.filter(k => !sc.keys.includes(k))).slice(0, Math.max(2, 5 - sc.keys.length))])]);
      area.innerHTML = `<p>Натисніть екранні клавіші в правильному порядку: спершу ${sc.keys.length > 1 ? 'клавішу, яку утримують' : 'потрібну клавішу'}.</p>
        <div class="sim-keys" role="group" aria-label="Екранні клавіші">${opts.map(k => `<button type="button" class="kc" data-k="${esc(k)}" aria-pressed="false">${esc(k)}</button>`).join('')}</div>
        <div class="mock"><div class="mock-bar"><span class="dots"><i></i><i></i><i></i></span><span class="ttl">${esc(SCENE_TITLE[sc.scene] || '')} · симуляція</span></div><div class="mock-body"><p data-sim style="margin:0">${esc(sc.before)}</p></div></div>`;
      const btns = [...area.querySelectorAll('[data-k]')];
      const st = area.querySelector('[data-sim]');
      let i = 0;
      const reset = () => { i = 0; btns.forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }); };
      btns.forEach(b => on(b, 'click', () => {
        const need = sc.keys[i];
        if (b.dataset.k === need) {
          b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
          i++;
          if (i >= sc.keys.length) {
            st.innerHTML = `<b>${esc(sc.after)}</b>`;
            ok(`Правильно: ${sc.keys.join(' + ')}. ${sc.after}.`);
            setTimeout(reset, 1200);
          } else { res.className = 'result-line'; res.textContent = `Добре! «${need}» утримується. Тепер — «${sc.keys[i]}».`; }
        } else {
          sound('error');
          hint(`Це «${b.dataset.k}». ${i === 0 ? `Почніть із «${sc.keys[0]}».` : `Далі потрібна «${need}».`} Спробуйте ще раз.`);
          reset();
          st.textContent = sc.before;
        }
      }));
      break;
    }
  }
  return () => { cleanups.forEach(f => f()); wrap.remove(); };
}
