// Комп'ютер щодня: життєві сценарії з перевіркою справжнього введення.
import { store } from '../core/store.js';
import { icon, esc, sound, speak, speechSupported, announce } from '../core/ui.js';
import { SCENARIOS } from '../content/scenarios.js';
import { matches } from '../core/practice.js';
import { checkAchievements, activity } from '../core/stats.js';
import { setLast } from '../core/nav.js';

const norm = v => v.replace(/[’ʼ‘]/g, "'").replace(/\r/g, '').replace(/ /g, ' ');
const lines = v => norm(v).split('\n').map(s => s.trim()).filter(Boolean);
const stripPunct = v => v.replace(/[.,!?:;"'()\-]/g, '').replace(/\s+/g, ' ').trim();

export function render(el, { parts }) {
  const sc = SCENARIOS.find(s => s.id === parts[0]);
  return sc ? renderScenario(el, sc) : renderList(el);
}

function renderList(el) {
  setLast("Комп'ютер щодня");
  const done = SCENARIOS.filter(s => store.data.scenarios[s.id]?.done).length;
  el.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Комп'ютер щодня</h1><p>Справжні життєві ситуації: написати повідомлення, виправити помилку, зберегти документ, знайти рецепт. Усе — у безпечному навчальному вікні.</p></div>
    <span class="pill green">Виконано ${done} з ${SCENARIOS.length}</span></div>
    <div class="grid c3">${SCENARIOS.map((s, i) => {
      const d = store.data.scenarios[s.id]?.done;
      return `<a class="card module-card" href="#/everyday/${s.id}" style="min-height:0">
        <span class="m-ico ${d ? 'mi-green' : 'mi-blue'}">${icon(d ? 'check' : s.icon)}</span>
        <h3>${i + 1}. ${esc(s.title)}</h3><p>${esc(s.story.split('.')[0])}.</p>
        <span class="go">${d ? 'Виконано · повторити' : 'Почати'} ${icon('right')}</span>
        ${s.sim ? '<span class="pill violet" style="align-self:flex-start">Є симуляція</span>' : ''}
      </a>`;
    }).join('')}</div>
  </div>`;
}

function renderScenario(el, sc) {
  setLast(`Сценарій: ${sc.title}`);
  let step = 0;
  const idx = SCENARIOS.indexOf(sc);
  const nextSc = SCENARIOS[idx + 1];
  const ls = [];
  const on = (node, ev, fn) => { node.addEventListener(ev, fn); ls.push(() => node.removeEventListener(ev, fn)); };

  el.innerHTML = `<div class="page">
    <a class="back" href="#/everyday">${icon('left')} Усі сценарії</a>
    <h1>${esc(sc.title)}</h1>
    <div class="card flat" style="margin:1rem 0">
      <p style="margin:0 0 .5rem;font-size:1.08rem">${esc(sc.story)}</p>
      ${speechSupported() ? `<button class="btn small soft" type="button" data-speak>${icon('speak')} Прочитати вголос</button>` : ''}
    </div>
    <div class="scn-layout">
      <div class="card">
        <h2 style="font-size:1.2rem">Кроки</h2>
        <ol class="steps">${sc.steps.map((s, i) => `<li data-i="${i}"><span class="n">${i + 1}</span><span>${esc(s.text)}</span></li>`).join('')}</ol>
        <div style="margin-top:1rem" data-cur></div>
        <p class="result-line" aria-live="polite" data-fb></p>
        <div class="btn-row"><button class="btn small" type="button" data-hint>${icon('help')} Підказка</button><button class="btn small ghost" type="button" data-reset>${icon('repeat')} Почати спочатку</button></div>
        <ul data-hints style="padding-left:1.2rem;margin:.8rem 0 0"></ul>
      </div>
      <div data-ws></div>
    </div>
    <div data-done class="section"></div>
  </div>`;
  const fb = el.querySelector('[data-fb]'), cur = el.querySelector('[data-cur]'), hintsEl = el.querySelector('[data-hints]'), ws = el.querySelector('[data-ws]');
  el.querySelector('[data-speak]')?.addEventListener('click', () => speak(sc.story + ' ' + (sc.steps[step]?.text || ''), true));
  let hintN = 0;
  el.querySelector('[data-hint]').addEventListener('click', () => {
    const h = sc.steps[step]?.hints || [];
    if (hintN < h.length) { hintsEl.insertAdjacentHTML('beforeend', `<li>${esc(h[hintN])}</li>`); hintN++; }
    else announce('Більше підказок немає');
  });
  el.querySelector('[data-reset]').addEventListener('click', () => { cleanupAll(); renderScenario(el, sc); });

  const feedback = (msg, cls = '') => { fb.className = 'result-line' + (cls ? ' ' + cls : ''); fb.innerHTML = msg ? (cls === 'ok' ? icon('check') + ' ' : '') + esc(msg) : ''; };

  /* ---------- робоче середовище ---------- */
  const W = buildWorkspace(sc, ws);

  function paintSteps() {
    el.querySelectorAll('.steps li').forEach(li => {
      const i = Number(li.dataset.i);
      li.className = i < step ? 'done' : i === step ? 'cur' : '';
      li.toggleAttribute('aria-current', i === step);
    });
    hintsEl.innerHTML = ''; hintN = 0;
    if (step < sc.steps.length) {
      cur.innerHTML = `<p style="font-weight:650;font-size:1.1rem;margin:0">Зараз: ${esc(sc.steps[step].text)}</p>`;
      if (store.data.settings.speech) speak(sc.steps[step].text);
    }
  }
  function advance() {
    activity();
    sound('success');
    feedback('Правильно!', 'ok');
    step++;
    if (step >= sc.steps.length) return complete();
    setTimeout(() => { paintSteps(); feedback(''); }, 700);
    paintSteps();
  }
  function complete() {
    paintSteps();
    cur.innerHTML = '';
    store.data.scenarios[sc.id] = { done: true, at: Date.now() };
    store.save();
    checkAchievements();
    sound('finish');
    const done = el.querySelector('[data-done]');
    done.innerHTML = `<div class="card done-screen" tabindex="-1"><div class="big-ico">${icon('check')}</div><h2>Сценарій виконано!</h2>
      <p>Ви впоралися з життєвим завданням. Тепер це вийде і в справжній програмі.</p>
      <div class="btn-row">${nextSc ? `<a class="btn primary" href="#/everyday/${nextSc.id}">Наступний: ${esc(nextSc.title)} ${icon('right')}</a>` : ''}<button class="btn" type="button" data-again>${icon('repeat')} Пройти ще раз</button><a class="btn ghost" href="#/everyday">Усі сценарії</a></div></div>`;
    done.querySelector('[data-again]').addEventListener('click', () => { cleanupAll(); renderScenario(el, sc); });
    done.firstElementChild.focus();
  }

  const fieldValue = name => (W.fields[name || 'main']?.value) ?? '';
  function nearMiss(v, target) {
    if (norm(v).trim().length < target.length) return;
    if (norm(v).trim().toLowerCase() === target.toLowerCase()) feedback('Майже! Перевірте великі й малі літери.', 'bad');
    else if (stripPunct(norm(v)) === stripPunct(target)) feedback('Майже! Перевірте розділові знаки й пробіли.', 'bad');
    else if (norm(v).trim().length > target.length + 3) feedback('Текст не збігається з потрібним. Порівняйте уважно — можна виправити стрілками й Backspace.', 'bad');
  }
  function evalInput(fieldName) {
    const s = sc.steps[step]; if (!s) return;
    const c = s.check;
    const f = c.field || 'main';
    if (f !== (fieldName || 'main')) return;
    const v = fieldValue(f);
    if (c.type === 'value') { if (norm(v).trim() === c.equals) advance(); else nearMiss(v, c.equals); }
    else if (c.type === 'prefix') { if (norm(v).startsWith(c.value)) advance(); else nearMiss(v.slice(0, c.value.length + 4), c.value); }
    else if (c.type === 'lines') { if (JSON.stringify(lines(v)) === JSON.stringify(c.equals)) advance(); }
    else if (c.type === 'field') { if (norm(v).trim() === c.equals) advance(); else nearMiss(v, c.equals); }
  }
  // Значення поля, яке очікується попереднім кроком (для умови «fieldok»).
  const expectedFor = name => [...sc.steps].reverse().find(s => s.check.type === 'field' && s.check.field === name)?.check.equals;

  function evalKey(e, fieldName) {
    const s = sc.steps[step]; if (!s) return false;
    const c = s.check;
    if (c.type !== 'key' || (c.field || 'main') !== fieldName) return false;
    if (!matches(e, c.match)) return false;
    if (c.prevent) e.preventDefault();
    const v = fieldValue(fieldName);
    if (c.when === 'nonempty' && !v.trim()) { e.preventDefault(); feedback('Спершу напишіть текст.', 'bad'); return true; }
    if (c.when === 'fieldok' && norm(v).trim() !== expectedFor(fieldName)) { e.preventDefault(); feedback('Спершу перевірте текст у полі — він має збігатися із завданням.', 'bad'); return true; }
    if (c.send) e.preventDefault();
    W.effect(c.send ? 'send' : c.effect, c);
    advance();
    return true;
  }

  // Підписки на події робочого середовища
  for (const [name, f] of Object.entries(W.fields)) {
    on(f, 'input', () => { activity(); evalInput(name); });
    on(f, 'keydown', e => {
      if (evalKey(e, name)) return;
      W.onKeyDefault && W.onKeyDefault(e, name, step, feedback);
      setTimeout(() => evalInput(name), 0);
    });
    const selCheck = () => {
      const s = sc.steps[step];
      if (!s || s.check.type !== 'selection' || name !== 'main') return;
      const sel = f.value.slice(f.selectionStart, f.selectionEnd).trim();
      if (sel === s.check.equals) advance();
    };
    on(f, 'select', selCheck); on(f, 'keyup', selCheck); on(f, 'mouseup', selCheck);
    on(f, 'copy', () => {
      const s = sc.steps[step];
      if (!s || s.check.type !== 'event' || s.check.name !== 'copy') return;
      const sel = f.value.slice(f.selectionStart, f.selectionEnd).trim();
      if (!s.check.selection || sel === s.check.selection) advance();
      else feedback(`Скопійовано «${sel}», а потрібно «${s.check.selection}». Спробуйте ще раз.`, 'bad');
    });
  }
  W.onSim = (kind, data) => {
    const s = sc.steps[step]; if (!s) return;
    const c = s.check;
    if (c.type === 'alttab' && kind === 'alttab') { if (data === c.target) advance(); else feedback(`Відкрито «${data}». Потрібне вікно — «${c.target}». Спробуйте ще раз.`, 'bad'); }
    if (c.type === 'simkeys' && kind === 'simkeys') {
      if (data.join('+') === c.keys.join('+')) { W.effect(c.effect); advance(); }
      else feedback(`Ви натиснули ${data.join(' + ')}. Потрібно: ${c.keys.join(' + ')}.`, 'bad');
    }
  };
  W.currentSimKeys = () => sc.steps[step]?.check.keys || null;

  paintSteps();
  function cleanupAll() { ls.forEach(f => f()); ls.length = 0; W.destroy && W.destroy(); }
  return cleanupAll;
}

/* ---------- побудова середовищ ---------- */
function bar(title, extra = '') {
  return `<div class="mock-bar"><span class="dots"><i></i><i></i><i></i></span><span class="ttl">${esc(title)}</span>${extra}</div>`;
}

function buildWorkspace(sc, host) {
  const W = { fields: {}, effect: () => {} };
  if (sc.workspace === 'chat') {
    host.innerHTML = `<div class="mock">${bar(sc.chatWith)}<div class="mock-body">
      <div class="chat-msgs" data-msgs><div class="bubble">Мамо, привіт! Як у вас справи? 😊</div></div>
      <textarea class="input" rows="3" aria-label="Поле повідомлення" placeholder="Напишіть повідомлення…" spellcheck="false"></textarea>
      <p class="muted" style="font-size:.85rem;margin:.4rem 0 0">Enter — надіслати · Shift + Enter — новий рядок</p></div></div>`;
    const t = host.querySelector('textarea'), msgs = host.querySelector('[data-msgs]');
    W.fields.main = t;
    W.effect = kind => {
      if (kind === 'send') {
        msgs.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(t.value)}</div>`);
        t.value = '';
        setTimeout(() => msgs.insertAdjacentHTML('beforeend', '<div class="bubble">Дякую! Чекаю ❤️</div>'), 900);
      }
    };
    W.onKeyDefault = (e, name, step, feedback) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) { e.preventDefault(); feedback('У месенджері Enter надсилає повідомлення. Поки що рано — для нового рядка натисніть Shift + Enter.', 'bad'); }
    };
  } else if (sc.workspace === 'doc') {
    host.innerHTML = `<div class="mock">${bar(sc.docTitle, '<span class="pill" data-st hidden>Збережено</span>')}<div class="mock-body">
      <textarea class="doc-area" rows="7" aria-label="Текст документа" spellcheck="false">${esc(sc.initial || '')}</textarea>
      <div data-dialog hidden class="card" style="margin-top:.8rem;box-shadow:var(--shadow-lg)">
        <h3>Зберегти як</h3>
        <label class="field"><span class="lbl">Назва файлу</span><input type="text" data-fname value="Документ1" autocomplete="off"></label>
        <p class="muted" style="font-size:.88rem;margin:.5rem 0 0">Папка: Документи · Тип: Документ Word</p>
      </div></div></div>`;
    const t = host.querySelector('textarea'), st = host.querySelector('[data-st]'), dlg = host.querySelector('[data-dialog]'), fname = host.querySelector('[data-fname]');
    W.fields.main = t;
    W.fields.filename = fname;
    W.effect = (kind, c) => {
      if (kind === 'savedialog') { dlg.hidden = false; fname.focus(); fname.select(); }
      else if (kind === 'saved') { dlg.hidden = true; host.querySelector('.ttl').textContent = fname.value.trim() + '.docx'; st.hidden = false; t.focus(); }
      else if (c && c.status) { st.hidden = false; st.textContent = c.status; }
    };
    W.onKeyDefault = (e) => { if (matches(e, { ctrl: true, code: 'KeyS' })) { e.preventDefault(); st.hidden = false; } };
  } else if (sc.workspace === 'browser') {
    const article = 'Класичний український борщ. Інгредієнти: 2 буряки, пів качана капусти, 4 картоплини, 1 морква, 1 цибулина, томатна паста, часник і зелень. Буряк наріжте соломкою й тушкуйте з морквою та цибулею. Додайте до бульйону картоплю й капусту, а наприкінці — підготовлений буряк. Подавайте зі сметаною.';
    host.innerHTML = `<div class="mock">${bar('Браузер')}
      <div class="addr"><input type="search" data-search placeholder="Пошук або адреса сайту" aria-label="Рядок пошуку" autocomplete="off"></div>
      <div class="mock-body">
        <p class="muted" data-empty>Надрукуйте запит у рядку пошуку зверху.</p>
        <div data-results hidden class="search-results">
          <div class="r"><a href="#" tabindex="-1" onclick="return false">Рецепт борщу — покроково</a><div class="muted" style="font-size:.88rem">Класичний український борщ зі сметаною…</div></div>
          <div data-findbar hidden class="findbar"><span>Знайти:</span><input type="text" data-find aria-label="Знайти на сторінці" autocomplete="off"><span data-count class="muted"></span></div>
          <div data-article tabindex="0" aria-label="Текст статті" style="line-height:1.7;padding:.5rem;border-radius:8px"></div>
        </div>
      </div></div>`;
    const search = host.querySelector('[data-search]'), results = host.querySelector('[data-results]'), empty = host.querySelector('[data-empty]');
    const art = host.querySelector('[data-article]'), findbar = host.querySelector('[data-findbar]'), find = host.querySelector('[data-find]'), count = host.querySelector('[data-count]');
    art.textContent = article;
    W.fields.search = search; W.fields.page = art; W.fields.find = find;
    W.effect = kind => {
      if (kind === 'results') { results.hidden = false; empty.hidden = true; art.focus(); }
      if (kind === 'findbar') { findbar.hidden = false; find.focus(); }
    };
    find.addEventListener('input', () => {
      const q = find.value.trim().toLowerCase();
      if (!q) { art.textContent = article; count.textContent = ''; return; }
      let n = 0;
      art.innerHTML = esc(article).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => { n++; return `<mark class="find-hl">${m}</mark>`; });
      count.textContent = `${n} збіг(ів)`;
    });
    W.onKeyDefault = (e, name) => { if (name === 'page' && matches(e, { ctrl: true, code: 'KeyF' })) e.preventDefault(); };
  } else if (sc.workspace === 'desktop') {
    let mru = ['Лист для онуки', 'Браузер', 'Калькулятор'];
    let alt = false, sel = 0;
    host.innerHTML = `<div class="mock">${bar('Робочий стіл · симуляція')}<div class="mock-body">
      <div class="sim-badge" style="margin-bottom:.7rem">${icon('info')} Симуляція Alt + Tab</div>
      <div class="desk" data-desk></div>
      <div class="sim-keys" role="group" aria-label="Екранні клавіші">
        <button class="kc" type="button" data-alt aria-pressed="false">Alt (утримувати)</button>
        <button class="kc" type="button" data-tab>Tab</button>
        <button class="btn small" type="button" data-release>Відпустити Alt</button>
      </div>
      <p class="muted" style="font-size:.88rem;margin:0;text-align:center">На справжній клавіатурі: утримуйте Alt, натискайте Tab, відпустіть Alt на потрібному вікні.</p>
    </div></div>`;
    const desk = host.querySelector('[data-desk]'), altB = host.querySelector('[data-alt]');
    const BODY = { 'Лист для онуки': 'Дорога Софійко! Дякую за листівку…', 'Браузер': 'Погода: +12°, хмарно', 'Калькулятор': '125 + 340 = 465' };
    const paint = () => {
      const order = [...mru].reverse();
      desk.innerHTML = order.map((n, i) => `<div class="win${n === mru[0] ? ' active' : ''}" style="left:${6 + i * 16}%;top:${10 + i * 14}%"><div class="wt">${esc(n)}</div><div class="wb">${esc(BODY[n])}</div></div>`).join('')
        + (alt ? `<div class="switcher" aria-live="polite">${mru.map((n, i) => `<div class="${i === sel ? 'sel' : ''}">${esc(n)}</div>`).join('')}</div>` : '');
    };
    altB.addEventListener('click', () => { alt = !alt; sel = 0; altB.classList.toggle('on', alt); altB.setAttribute('aria-pressed', String(alt)); if (!alt) release(); else paint(); });
    host.querySelector('[data-tab]').addEventListener('click', () => {
      if (!alt) { sound('error'); W.onSim && W.feedbackNoAlt && W.feedbackNoAlt(); announce('Спершу утримуйте Alt — натисніть кнопку «Alt».'); return; }
      sel = (sel + 1) % mru.length; paint(); announce(`Обрано: ${mru[sel]}`);
    });
    host.querySelector('[data-release]').addEventListener('click', () => { if (alt) { alt = false; altB.classList.remove('on'); altB.setAttribute('aria-pressed', 'false'); release(); } });
    function release() {
      if (sel > 0) { const w = mru.splice(sel, 1)[0]; mru.unshift(w); }
      paint();
      if (sel > 0) W.onSim('alttab', mru[0]);
      sel = 0;
    }
    paint();
  } else if (sc.workspace === 'tabs') {
    let tabs = ['Пошта', 'Погода'], active = 0, pressed = [];
    host.innerHTML = `<div class="mock">${bar('Браузер · симуляція')}
      <div class="tabbar" data-tabs></div>
      <div class="mock-body"><div class="sim-badge" style="margin-bottom:.7rem">${icon('info')} Симуляція вкладок</div>
        <p data-page style="font-size:1.1rem;font-weight:600"></p>
        <div class="sim-keys" role="group" aria-label="Екранні клавіші">${['Ctrl', 'Shift', 'Alt', 'Tab', 'T', 'W'].map(k => `<button class="kc" type="button" data-k="${k}" aria-pressed="false">${k}</button>`).join('')}</div>
        <p class="muted" style="font-size:.88rem;margin:0;text-align:center">Натисніть спершу Ctrl, потім другу клавішу.</p>
      </div></div>`;
    const tabsEl = host.querySelector('[data-tabs]'), page = host.querySelector('[data-page]');
    const paint = () => {
      tabsEl.innerHTML = tabs.map((t, i) => `<span class="tab${i === active ? ' on' : ''}">${esc(t)}</span>`).join('');
      page.textContent = `Відкрита вкладка: ${tabs[active] || '—'}`;
    };
    const btns = [...host.querySelectorAll('[data-k]')];
    const clear = () => { pressed = []; btns.forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); }); };
    btns.forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.k;
      const mod = ['Ctrl', 'Shift', 'Alt'].includes(k);
      pressed.push(k); b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
      if (!mod) { const combo = pressed.slice(); setTimeout(clear, 300); W.onSim('simkeys', combo); }
    }));
    W.effect = kind => {
      if (kind === 'newtab') { tabs.push('Нова вкладка'); active = tabs.length - 1; }
      if (kind === 'nexttab') active = (active + 1) % tabs.length;
      if (kind === 'closetab') { tabs.splice(active, 1); active = Math.max(0, active - 1); }
      paint();
    };
    paint();
  }
  return W;
}
