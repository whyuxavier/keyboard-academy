// Щоденне тренування (~5 хвилин): розминка слабких символів, швидкість, комбінація дня, практичне завдання.
import { store } from '../core/store.js';
import { icon, esc, dayKey, sound, combo, announce } from '../core/ui.js';
import { createTypingBlock } from '../core/typing.js';
import { generate, generateAdaptive } from '../core/generate.js';
import { weakChars, checkAchievements, mastered, streak, activity } from '../core/stats.js';
import { SHORTCUTS } from '../content/shortcuts.js';
import { MINI_TASKS } from '../content/scenarios.js';
import { createPractice } from '../core/practice.js';
import { markPracticed } from './shortcuts.js';
import { setLast } from '../core/nav.js';
import { LANG_NAMES } from '../core/layouts.js';

function seedPick(arr, salt = 0) {
  const k = dayKey();
  let h = salt;
  for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
}

export function render(el) {
  setLast('Щоденне тренування');
  const s = store.data.settings;
  const lang = s.dailyLang === 'auto' ? s.typingLang : s.dailyLang;
  const minutes = s.dailyMinutes;
  const doneToday = !!store.data.daily[dayKey()];
  const weak = weakChars(lang, 4).map(w => w.c);
  const todo = SHORTCUTS.filter(x => !mastered(x.id));
  const sc = seedPick(todo.length ? todo : SHORTCUTS, 7);
  const task = seedPick(MINI_TASKS[lang], 3);
  const steps = [
    { id: 'warm', title: 'Розминка', desc: weak.length ? `Слабкі символи: ${weak.join(' ')}` : 'Основний ряд і прості слова' },
    { id: 'speed', title: 'Швидкість', desc: `${minutes === 3 ? 30 : minutes === 10 ? 120 : 60} секунд друку слів` },
    ...(s.dailyShortcut ? [{ id: 'sc', title: 'Комбінація дня', desc: `${sc.keys.join(' + ')} — ${sc.name}` }] : []),
    { id: 'task', title: 'Практичне завдання', desc: 'Коротке повідомлення' },
  ];
  let cur = -1, block = null, prCleanup = null;
  const results = {};

  el.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Щоденне тренування</h1><p>Близько ${minutes} хвилин, складених спеціально для вас. Мова: ${LANG_NAMES[lang]}. Змінити тривалість і мову можна в <a href="#/settings">налаштуваннях</a>.</p></div>
      <span class="pill amber">${icon('flame')} ${streak()} днів поспіль</span></div>
    <ol class="steps card" data-steps style="margin-bottom:1.2rem">${steps.map((st, i) => `<li data-i="${i}"><span class="n">${i + 1}</span><span><b>${esc(st.title)}</b> · <span class="muted">${esc(st.desc)}</span></span></li>`).join('')}</ol>
    <div data-host></div>
  </div>`;
  const host = el.querySelector('[data-host]');
  const paintSteps = () => el.querySelectorAll('[data-steps] li').forEach(li => { const i = +li.dataset.i; li.className = i < cur ? 'done' : i === cur ? 'cur' : ''; });

  host.innerHTML = `<div class="card done-screen">
    <div class="big-ico" style="background:var(--blue-soft);color:var(--blue)">${icon('calendar')}</div>
    <h2>${doneToday ? 'Сьогодні ви вже тренувалися' : 'Готові до тренування?'}</h2>
    <p class="muted">${doneToday ? 'Чудово! Можна пройти ще раз — зайвим не буде.' : 'Чотири короткі кроки. Між ними можна перепочити.'}</p>
    <div class="btn-row"><button class="btn primary" type="button" data-go>${icon('play')} ${doneToday ? 'Пройти ще раз' : 'Почати'}</button></div></div>`;
  host.querySelector('[data-go]').addEventListener('click', next);

  function clear() { if (block) { block.destroy(); block = null; } if (prCleanup) { prCleanup(); prCleanup = null; } host.innerHTML = ''; }
  function next() {
    clear();
    cur++;
    paintSteps();
    if (cur >= steps.length) return finish();
    const st = steps[cur];
    host.insertAdjacentHTML('beforeend', `<h2>${cur + 1}. ${esc(st.title)}</h2>`);
    const body = document.createElement('div');
    host.appendChild(body);
    if (st.id === 'warm') {
      const len = minutes === 3 ? 110 : minutes === 10 ? 300 : 180;
      const text = weak.length ? generateAdaptive(lang, weak, len) : generate({ lang, mode: 'words', level: 'beginner', caps: false, punct: false, numbers: false, order: 'random' }, len);
      block = createTypingBlock(body, { text, lang, stopOnError: true, stats: 'lesson', anchor: body.previousElementSibling, onFinish: st2 => { results.warm = st2; sound('success'); setTimeout(next, 700); } });
    } else if (st.id === 'speed') {
      const dur = minutes === 3 ? 30 : minutes === 10 ? 120 : 60;
      const cfg = { lang, mode: 'words', level: 'intermediate', caps: false, punct: false, numbers: false, order: 'random' };
      block = createTypingBlock(body, {
        text: generate(cfg, dur * 9), lang, timeLimit: dur, stats: 'full', extend: () => ' ' + generate(cfg, 300), anchor: body.previousElementSibling,
        startLabel: 'Натисніть тут — таймер почнеться з першої літери',
        onFinish: st2 => {
          results.speed = st2;
          if (st2.keystrokes >= 20) {
            store.data.speed.push({ at: Date.now(), lang, mode: 'daily', level: 'intermediate', wpm: st2.wpm, gross: st2.gross, cpm: st2.cpm, acc: st2.acc, errors: st2.errors, correct: st2.correct, incorrect: st2.uncorrected, sec: st2.sec });
            const r = store.data.records[lang];
            if (!r || st2.wpm > r.wpm) store.data.records[lang] = { wpm: st2.wpm, cpm: st2.cpm, acc: st2.acc, at: Date.now() };
            store.save();
          }
          body.insertAdjacentHTML('beforeend', `<div class="notice ok" style="margin-top:1rem">${icon('check')}<p>${st2.wpm} сл/хв, точність ${st2.acc}%.</p></div><div class="btn-row" style="margin-top:1rem"><button class="btn primary" type="button" data-next>Далі ${icon('right')}</button></div>`);
          body.querySelector('[data-next]').addEventListener('click', next);
          body.querySelector('[data-next]').focus();
        },
      });
    } else if (st.id === 'sc') {
      body.innerHTML = `<div class="card"><div style="margin-bottom:.8rem">${combo(sc.keys, true)}</div><h3>${esc(sc.name)}</h3><p>${esc(sc.desc)}</p><p class="muted">${esc(sc.example)}</p><div data-pr></div>
        <div class="btn-row" style="margin-top:1rem"><button class="btn primary" type="button" data-next disabled>Далі ${icon('right')}</button><button class="btn ghost" type="button" data-skip>Пропустити</button></div></div>`;
      const nb = body.querySelector('[data-next]');
      prCleanup = createPractice(body.querySelector('[data-pr]'), sc, () => { markPracticed(sc.id); results.sc = true; nb.disabled = false; nb.focus(); });
      nb.addEventListener('click', next);
      body.querySelector('[data-skip]').addEventListener('click', next);
    } else if (st.id === 'task') {
      body.innerHTML = `<div class="card"><p style="font-size:1.1rem">Надрукуйте повідомлення точно так, як написано (з великими літерами й розділовими знаками):</p>
        <p style="font-size:1.4rem;font-weight:650;background:var(--surface-2);padding:.8rem 1rem;border-radius:12px">${esc(task)}</p>
        <textarea class="input" rows="2" aria-label="Ваше повідомлення" spellcheck="false"></textarea>
        <p class="result-line" aria-live="polite"></p></div>`;
      const t = body.querySelector('textarea'), res = body.querySelector('.result-line');
      const norm = v => v.replace(/[’ʼ]/g, "'").trim();
      t.addEventListener('input', () => {
        activity();
        const v = norm(t.value);
        if (v === task) { res.className = 'result-line ok'; res.innerHTML = `${icon('check')} Ідеально!`; results.task = true; sound('success'); setTimeout(next, 900); }
        else if (v.length >= task.length) {
          res.className = 'result-line bad';
          res.textContent = v.toLowerCase() === task.toLowerCase() ? 'Майже! Перевірте великі літери.' : 'Є відмінність — порівняйте уважно й виправте.';
        } else { res.textContent = ''; }
      });
      setTimeout(() => t.focus(), 50);
    }
  }
  function finish() {
    store.data.daily[dayKey()] = true;
    store.save();
    checkAchievements();
    sound('finish');
    host.innerHTML = `<div class="card done-screen" tabindex="-1"><div class="big-ico">${icon('check')}</div>
      <h2>Тренування на сьогодні завершено!</h2>
      <p>Регулярність важливіша за тривалість. До завтра!</p>
      <div class="tiles">
        ${results.warm ? `<div class="tile"><b>${results.warm.acc}%</b><span>точність розминки</span></div>` : ''}
        ${results.speed ? `<div class="tile accent"><b>${results.speed.wpm}</b><span>сл/хв</span></div>` : ''}
        <div class="tile"><b>${streak()}</b><span>днів поспіль</span></div>
      </div>
      <div class="btn-row"><a class="btn primary" href="#/progress">Мій прогрес</a><a class="btn" href="#/home">На головну</a></div></div>`;
    host.firstElementChild.focus();
    announce('Тренування завершено');
  }
  return clear;
}
