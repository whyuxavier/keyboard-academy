// Академія друку: список уроків і проходження уроку.
import { store } from '../core/store.js';
import { icon, esc, speak, speechSupported, sound, fmtDuration, announce, modal, toast } from '../core/ui.js';
import { COURSES, PASS_ACCURACY, starsFor } from '../content/lessons.js';
import { createTypingBlock, createScreenFit } from '../core/typing.js';
import { createKeyboard, createHands, capitalize } from '../core/keyboard.js';
import { FINGER, FINGER_NAMES, FINGER_ORDER, LAYOUT_NAMES, LANG_NAMES, keyName } from '../core/layouts.js';
import { computeStats, checkAchievements, activity } from '../core/stats.js';
import { setLast } from '../core/nav.js';

const key = (lang, i) => `${lang}:${i}`;
export function isUnlocked(lang, i) {
  if (i === 0 || store.data.settings.unlockAll) return true;
  return !!store.data.lessons[key(lang, i - 1)]?.done;
}

export function render(el, { parts, query }) {
  if (parts.length >= 2) return renderLesson(el, parts[0] === 'en' ? 'en' : 'uk', Math.max(0, parseInt(parts[1], 10) || 0));
  return renderList(el, query.lang === 'en' || query.lang === 'uk' ? query.lang : store.data.settings.typingLang);
}

function renderList(el, lang) {
  const lessons = COURSES[lang];
  const done = lessons.filter((l, i) => store.data.lessons[key(lang, i)]?.done).length;
  let nextIdx = lessons.findIndex((l, i) => !store.data.lessons[key(lang, i)]?.done);
  el.innerHTML = `<div class="page">
    <div class="page-head">
      <div><h1>Академія друку</h1><p>Навчіться друкувати всіма пальцями, не дивлячись на клавіатуру. Уроки йдуть від простого до складного.</p></div>
      <div class="seg" role="group" aria-label="Мова курсу">
        <button type="button" data-lang="uk" aria-pressed="${lang === 'uk'}">Українська · ЙЦУКЕН</button>
        <button type="button" data-lang="en" aria-pressed="${lang === 'en'}">English · QWERTY</button>
      </div>
    </div>
    <div class="card" style="margin-bottom:1.2rem">
      <div style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-bottom:.6rem"><b>Пройдено ${done} з ${lessons.length}</b>${nextIdx >= 0 ? `<a class="btn primary small" href="#/academy/${lang}/${nextIdx}">${icon('play')} Урок ${nextIdx + 1}: ${esc(lessons[nextIdx].title)}</a>` : '<span class="pill green">Курс завершено 🎉</span>'}</div>
      <div class="progress green"><span style="width:${(done / lessons.length) * 100}%"></span></div>
    </div>
    <details class="card" id="guide" style="margin-bottom:1.4rem">
      <summary style="cursor:pointer;font-weight:650;font-size:1.1rem;min-height:var(--tap);display:flex;align-items:center;gap:.5rem">${icon('hands')} Посібник: де лежать пальці</summary>
      <p class="muted" style="margin-top:.6rem">Кожен палець відповідає за свої клавіші — вони позначені однаковим кольором. Вказівні пальці лежать на клавішах із горбиками (${lang === 'uk' ? 'А та О' : 'F та J'}), великі — на пробілі. Shift натискаємо мізинцем протилежної руки.</p>
      <div data-kb></div>
      <div data-hands style="margin-top:.8rem"></div>
      <div class="legend" aria-label="Кольори пальців">${FINGER_ORDER.map(f => `<span><i style="background:var(--f-${f})"></i>${capitalize(FINGER_NAMES[f])}</span>`).join('')}</div>
    </details>
    <h2>Уроки</h2>
    <div class="lesson-grid">
      ${lessons.map((l, i) => {
        const r = store.data.lessons[key(lang, i)];
        const open = isUnlocked(lang, i);
        const cls = r?.done ? 'done' : i === nextIdx && open ? 'next' : !open ? 'locked' : '';
        const sub = r?.done ? `<span class="stars" aria-label="${r.stars} з 3 зірок">${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)}</span> · точність ${Math.round(r.bestAcc)}%`
          : !open ? `${icon('lock')} Спершу пройдіть урок ${i}` : r?.attempts ? 'Спробуйте ще раз' : 'Не розпочато';
        return `<a class="lesson-item ${cls}" href="#/academy/${lang}/${i}" ${!open ? 'aria-disabled="true"' : ''}>
          <span class="num">${r?.done ? icon('check') : !open ? icon('lock') : i + 1}</span>
          <span><span class="t">${i + 1}. ${esc(l.title)}</span><br><span class="s">${sub}</span></span>
        </a>`;
      }).join('')}
    </div>
    ${!store.data.settings.unlockAll ? `<p class="muted" style="margin-top:1rem">Наступний урок відкривається, коли точність у попередньому — від ${PASS_ACCURACY}%. Відкрити всі уроки одразу можна в <a href="#/settings">налаштуваннях</a>.</p>` : ''}
  </div>`;
  el.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
    store.data.settings.typingLang = b.dataset.lang; store.save();
    location.hash = `#/academy?lang=${b.dataset.lang}`;
  }));
  const guide = el.querySelector('#guide');
  let built = false;
  guide.addEventListener('toggle', () => {
    if (!guide.open || built) return;
    built = true;
    createKeyboard(guide.querySelector('[data-kb]'), { lang, fingers: true });
    const h = createHands(guide.querySelector('[data-hands]'), { colored: true });
    h.set(null, null, '');
  });
  el.querySelectorAll('.lesson-item.locked').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    announce('Цей урок ще закритий. Спершу пройдіть попередній.');
    a.querySelector('.s').innerHTML = `<b>Спершу пройдіть попередній урок</b>`;
  }));
}

function renderLesson(el, lang, idx) {
  const course = COURSES[lang];
  if (idx >= course.length) idx = course.length - 1;
  const lesson = course[idx];
  if (!isUnlocked(lang, idx)) {
    el.innerHTML = `<div class="page"><a class="back" href="#/academy?lang=${lang}">${icon('left')} Усі уроки</a>
      <div class="card done-screen"><div class="big-ico" style="background:var(--surface-2);color:var(--muted)">${icon('lock')}</div>
      <h1>Урок ${idx + 1} ще закритий</h1><p class="muted">Уроки відкриваються по черзі, щоб навчання було поступовим. Спершу пройдіть урок ${idx}.</p>
      <div class="btn-row"><a class="btn primary" href="#/academy/${lang}/${idx - 1}">Перейти до уроку ${idx}</a><a class="btn" href="#/settings">Відкрити всі уроки в налаштуваннях</a></div></div></div>`;
    return;
  }
  setLast(`Урок ${idx + 1}: ${lesson.title} (${LANG_NAMES[lang]})`);
  const total = lesson.type === 'keys' ? lesson.steps.length : lesson.exercises.length;
  const draft = store.data.lessonDraft;
  const resume = draft && draft.lang === lang && draft.idx === idx && draft.ex > 0 && draft.ex < total;
  let ex = resume ? draft.ex : 0;
  let acc = resume ? { k: draft.k, e: draft.e, ms: draft.ms } : { k: 0, e: 0, ms: 0 };
  let block = null, cleanupKeys = null, infoDialog = null;

  el.innerHTML = `<div class="page">
    <div class="lesson-bar exercise">
      <a class="btn ghost small" href="#/academy?lang=${lang}" aria-label="Усі уроки" title="Усі уроки">${icon('left')}<span class="lbl">Усі уроки</span></a>
      <span class="muted lesson-bar-meta lesson-bar-num">Урок ${idx + 1} з ${course.length}</span>
      <h1 class="lesson-bar-title">${esc(lesson.title)}</h1>
      <b data-exlabel class="lesson-bar-meta"></b>
      <div class="lesson-ex-progress" aria-hidden="true">${Array.from({ length: total }, () => '<i></i>').join('')}</div>
      <button class="btn soft small" type="button" data-act="info" aria-label="Про урок" title="Про урок">${icon('info')}<span class="lbl-wide">Про урок</span></button>
      <button class="btn ghost small" type="button" data-act="repeat" aria-label="Повторити вправу" title="Повторити вправу">${icon('repeat')}<span class="lbl">Повторити вправу</span></button>
    </div>
    <div data-ex></div>
  </div>`;
  const bar = el.querySelector('.lesson-bar');
  const exHost = el.querySelector('[data-ex]');
  const exLabel = el.querySelector('[data-exlabel]');
  if (store.data.settings.speech) setTimeout(() => speak(lesson.intro), 300);
  if (resume) toast(`Продовжуємо з того місця, де ви зупинилися: вправа ${ex + 1}.`, { duration: 4000 });
  el.querySelector('[data-act="info"]').addEventListener('click', showLessonInfo);
  el.querySelector('[data-act="repeat"]').addEventListener('click', () => startEx());

  function showLessonInfo() {
    const body = document.createElement('div');
    body.innerHTML = `<p><span class="pill blue">Урок ${idx + 1} з ${course.length} · ${LANG_NAMES[lang]} (${LAYOUT_NAMES[lang]})</span></p>
      <p style="font-size:1.08rem">${esc(lesson.intro)}</p>
      ${speechSupported() ? `<button class="btn small soft" type="button" data-speak>${icon('speak')} Прочитати вголос</button>` : ''}`;
    body.querySelector('[data-speak]')?.addEventListener('click', () => speak(lesson.intro, true));
    const started = ex > 0;
    infoDialog = modal({
      title: lesson.title, body,
      // modal повертає фокус на попередній елемент уже після onClose, тому чекаємо наступного кроку.
      onClose: () => { infoDialog = null; setTimeout(resumeExercise, 0); },
      actions: [
        ...(started ? [{ label: 'Почати урок спочатку', onClick: () => { ex = 0; acc = { k: 0, e: 0, ms: 0 }; saveDraft(); startEx(); } }] : []),
        { label: started ? 'Продовжити' : 'Почати', primary: true },
      ],
    });
  }
  function resumeExercise() {
    if (block) block.focus();
    else exHost.querySelector('.practice-zone')?.focus({ preventScroll: true });
  }

  function paintProgress() {
    exLabel.textContent = lesson.type === 'keys' ? `Крок ${Math.min(ex + 1, total)} з ${total}` : `Вправа ${Math.min(ex + 1, total)} з ${total}`;
    el.querySelectorAll('.lesson-ex-progress i').forEach((i, n) => { i.className = n < ex ? 'done' : n === ex ? 'cur' : ''; });
  }
  function saveDraft() {
    store.data.lessonDraft = { lang, idx, ex, k: acc.k, e: acc.e, ms: acc.ms, at: Date.now() };
    store.save();
  }

  function startEx() {
    if (block) { block.destroy(); block = null; }
    if (cleanupKeys) { cleanupKeys(); cleanupKeys = null; }
    exHost.innerHTML = '';
    paintProgress();
    if (lesson.type === 'keys') return startKeysLesson();
    block = createTypingBlock(exHost, {
      text: lesson.exercises[ex], lang, stopOnError: true, stats: 'lesson', blind: !!lesson.blind,
      startLabel: ex === 0 ? 'Натисніть тут і почніть друкувати' : 'Натисніть тут, щоб продовжити',
      anchor: bar,
      onFinish: (st) => {
        acc.k += st.keystrokes; acc.e += st.errors; acc.ms += st.ms;
        ex++;
        if (ex >= total) return finish();
        saveDraft();
        sound('success');
        announce(`Вправу виконано. Точність ${st.acc}%. Наступна вправа.`);
        setTimeout(startEx, 700);
      },
    });
  }

  function startKeysLesson() {
    let step = ex;
    // На телефоні чи планшеті немає фізичних Tab, Caps Lock тощо — там клавіші натискають дотиком на намальованій клавіатурі.
    const touch = matchMedia('(pointer: coarse)').matches;
    exHost.innerHTML = `<div class="card keys-step">
      <p data-step style="font-size:1.2rem;font-weight:600;min-height:3em"></p>
      <div class="practice-zone${touch ? ' touch-hint' : ''}" tabindex="0" role="application" aria-label="Зона натискання. Натискайте клавішу, описану вище. Esc — вийти.">${icon('keyboard')}&nbsp; ${touch ? 'Торкніться потрібної клавіші на клавіатурі нижче' : 'Клацніть тут, а потім натисніть клавішу — або клацніть її на клавіатурі нижче'}</div>
      <p class="tb-feedback" aria-live="polite" style="margin-top:.8rem"></p>
      <div class="tb-visual" data-vis></div>
    </div>`;
    const stepEl = exHost.querySelector('[data-step]'), zone = exHost.querySelector('.practice-zone'), fb = exHost.querySelector('.tb-feedback');
    const s = store.data.settings;
    const kb = createKeyboard(exHost.querySelector('[data-vis]'), { lang, fingers: s.showFingers });
    const hands = createHands(exHost.querySelector('[data-vis]'), { colored: s.showFingers });
    const screen = createScreenFit({ el: exHost.querySelector('.keys-step'), visual: exHost.querySelector('[data-vis]'), hands, anchor: bar });
    const show = () => {
      const st = lesson.steps[step];
      stepEl.textContent = st.text;
      kb.highlight([st.codes[0]].concat(st.codes[0] === 'ShiftLeft' ? ['ShiftRight'] : []));
      const f = FINGER[st.codes[0]];
      hands.set(f, null, f ? `Натискайте: ${FINGER_NAMES[f]}` : '');
      if (s.speech) speak(st.text);
      ex = step; paintProgress();
      screen.fit();
    };
    let busy = false;
    const onKey = e => {
      if (e.key === 'Escape') { zone.blur(); return; }
      if (e.code !== 'Tab' || lesson.steps[step].codes.includes('Tab')) e.preventDefault();
      press(e.code);
    };
    const onTap = e => {
      const key = e.target.closest('.key[data-code]');
      if (key) press(key.dataset.code);
    };
    const press = code => {
      if (busy || !code) return;
      activity();
      const st = lesson.steps[step];
      kb.flash(code, st.codes.includes(code) ? 'ok' : 'bad', 300);
      acc.k++;
      if (st.codes.includes(code)) {
        busy = true;
        sound('success');
        fb.className = 'tb-feedback ok';
        fb.textContent = `Правильно! Це ${keyName(code, lang)}.`;
        setTimeout(() => {
          busy = false; fb.textContent = '';
          step++;
          if (step >= total) { ex = total; finish(); return; }
          ex = step; saveDraft(); show();
        }, 900);
      } else {
        acc.e++;
        sound('error');
        fb.className = 'tb-feedback bad';
        fb.textContent = `Це клавіша ${keyName(code, lang)}. Спробуйте ще раз — потрібна клавіша підсвічена синім.`;
      }
    };
    zone.addEventListener('keydown', onKey);
    kb.el.addEventListener('click', onTap);
    kb.el.classList.add('kb-tap');
    zone.addEventListener('click', () => zone.focus());
    zone.addEventListener('focus', screen.reveal);
    show();
    if (!touch) setTimeout(() => zone.focus({ preventScroll: true }), 80);
    cleanupKeys = () => { zone.removeEventListener('keydown', onKey); screen.stop(); };
  }

  function finish() {
    if (block) { block.destroy(); block = null; }
    const st = computeStats({ keystrokes: acc.k, errors: acc.e, correct: acc.k - acc.e, uncorrected: 0, ms: Math.max(acc.ms, 1000) });
    const accPct = lesson.type === 'keys' ? 100 : st.acc;
    const passed = lesson.type === 'keys' || accPct >= PASS_ACCURACY;
    const stars = passed ? starsFor(accPct) : 0;
    const k = key(lang, idx);
    const prev = store.data.lessons[k] || { done: false, bestAcc: 0, bestCpm: 0, stars: 0, attempts: 0 };
    store.data.lessons[k] = {
      done: prev.done || passed, bestAcc: Math.max(prev.bestAcc, accPct), bestCpm: Math.max(prev.bestCpm, lesson.type === 'keys' ? 0 : st.cpm),
      stars: Math.max(prev.stars, stars), attempts: prev.attempts + 1, at: Date.now(),
    };
    store.data.lessonDraft = null;
    store.save();
    checkAchievements();
    sound('finish');
    const hasNext = idx + 1 < course.length;
    const msg = passed
      ? (stars === 3 ? 'Чудова точність! Ви готові до наступного кроку.' : stars === 2 ? 'Добре вийшло! Можна йти далі або повторити для кращого результату.' : 'Урок пройдено! Повторення допоможе пальцям запам’ятати клавіші.')
      : `Ви молодець, що пройшли урок до кінця! Щоб відкрити наступний, потрібна точність від ${PASS_ACCURACY}%. Спробуйте ще раз — повільніше, без поспіху.`;
    exHost.innerHTML = `<div class="card done-screen" tabindex="-1">
      <div class="big-ico">${icon(passed ? 'check' : 'repeat')}</div>
      <h2>${passed ? 'Урок пройдено' : 'Майже вийшло'}</h2>
      ${passed && lesson.type !== 'keys' ? `<div class="stars" style="font-size:2rem" aria-label="${stars} з 3 зірок">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>` : ''}
      <p style="max-width:52ch;margin:.6rem auto">${esc(msg)}</p>
      ${lesson.type !== 'keys' ? `<div class="tiles">
        <div class="tile accent"><b>${accPct}%</b><span>точність</span></div>
        <div class="tile"><b>${st.cpm}</b><span>знаків за хвилину</span></div>
        <div class="tile"><b>${fmtDuration(st.sec)}</b><span>час</span></div>
        <div class="tile"><b>${st.errors}</b><span>помилок</span></div>
      </div>` : ''}
      <div class="btn-row">
        ${passed && hasNext ? `<a class="btn primary" href="#/academy/${lang}/${idx + 1}">${icon('right')} Наступний урок</a>` : ''}
        <button class="btn${passed ? '' : ' primary'}" type="button" data-again>${icon('repeat')} Повторити урок</button>
        <a class="btn ghost" href="#/academy?lang=${lang}">До списку уроків</a>
      </div>
    </div>`;
    exLabel.textContent = 'Готово';
    el.querySelectorAll('.lesson-ex-progress i').forEach(i => { i.className = 'done'; });
    exHost.querySelector('[data-again]').addEventListener('click', () => { ex = 0; acc = { k: 0, e: 0, ms: 0 }; startEx(); });
    const card = exHost.querySelector('.done-screen');
    card.focus({ preventScroll: false });
    announce(passed ? 'Урок пройдено.' : 'Урок завершено. Спробуйте ще раз.');
  }

  startEx();
  // Пояснення нового уроку показуємо одразу, далі воно доступне за кнопкою «Про урок».
  if (!resume && !store.data.lessons[key(lang, idx)]) showLessonInfo();
  return () => { if (infoDialog) infoDialog.close(); if (block) block.destroy(); if (cleanupKeys) cleanupKeys(); };
}
