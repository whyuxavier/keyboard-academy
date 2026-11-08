// Мій прогрес: статистика, графіки, слабкі символи й рекомендації.
import { store } from '../core/store.js';
import { icon, esc, fmtDuration, dayKey } from '../core/ui.js';
import { lineChart, barChart } from '../core/charts.js';
import { COURSES } from '../content/lessons.js';
import { SHORTCUTS, CATEGORIES } from '../content/shortcuts.js';
import { SCENARIOS } from '../content/scenarios.js';
import { weakChars, streak, lessonsDone, mastered, ACHIEVEMENTS } from '../core/stats.js';
import { LANG_NAMES } from '../core/layouts.js';

export function render(el) {
  const d = store.data;
  const best = l => d.records[l]?.wpm || 0;
  const hist = d.speed.slice(-30);
  const avgAcc = hist.length ? Math.round(hist.reduce((a, r) => a + r.acc, 0) / hist.length) : 0;
  const days = [];
  for (let i = 13; i >= 0; i--) { const dt = new Date(); dt.setDate(dt.getDate() - i); days.push(dt); }
  const dayVals = days.map(dt => Math.round((d.practice.days[dayKey(dt)] || 0) / 60));
  const dayLabels = days.map(dt => `${dt.getDate()}.${String(dt.getMonth() + 1).padStart(2, '0')}`);
  const masteredN = SHORTCUTS.filter(s => mastered(s.id)).length;
  const scnDone = SCENARIOS.filter(s => d.scenarios[s.id]?.done).length;
  const achN = Object.keys(d.achievements).length;

  // Рекомендації
  const recos = [];
  for (const lang of ['uk', 'en']) {
    COURSES[lang].forEach((l, i) => {
      const r = d.lessons[`${lang}:${i}`];
      if (r && (!r.done || r.stars === 1) && recos.length < 3) recos.push({ text: `Повторіть урок ${i + 1} «${l.title}» (${LANG_NAMES[lang]}) — точність ${Math.round(r.bestAcc)}%.`, href: `#/academy/${lang}/${i}`, btn: 'До уроку' });
    });
  }
  for (const lang of ['uk', 'en']) {
    const w = weakChars(lang, 4);
    if (w.length) recos.push({ text: `Слабкі символи (${LANG_NAMES[lang]}): ${w.map(x => x.c).join(' ')}. Персональна вправа допоможе.`, href: `#/speed?weak=1&lang=${lang}`, btn: 'Тренувати' });
  }
  const sc = SHORTCUTS.filter(s => !mastered(s.id)).sort((a, b) => a.level - b.level).slice(0, 3);
  sc.forEach(s => recos.push({ text: `Освойте комбінацію ${s.keys.join(' + ')} — ${s.name}.`, href: `#/shortcuts/${s.id}`, btn: 'Практика' }));
  if (!d.daily[dayKey()]) recos.unshift({ text: `Коротке щоденне тренування — ${d.settings.dailyMinutes} хвилин.`, href: '#/daily', btn: 'Почати' });

  el.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Мій прогрес</h1><p>Усе зберігається в цьому браузері. Щоб перенести на інший комп’ютер — експортуйте прогрес у налаштуваннях.</p></div></div>
    <div class="tiles">
      <div class="tile accent"><b>${best('uk')} / ${best('en')}</b><span>рекорд сл/хв (укр / англ)</span></div>
      <div class="tile"><b>${avgAcc ? avgAcc + '%' : '—'}</b><span>середня точність</span></div>
      <div class="tile"><b>${fmtDuration(d.practice.total)}</b><span>загальний час практики</span></div>
      <div class="tile"><b>${streak()}</b><span>днів поспіль</span></div>
      <div class="tile"><b>${d.speed.length}</b><span>тестів швидкості</span></div>
      <div class="tile"><b>${masteredN}/${SHORTCUTS.length}</b><span>комбінацій освоєно</span></div>
      <div class="tile"><b>${scnDone}/${SCENARIOS.length}</b><span>життєвих сценаріїв</span></div>
      <div class="tile"><b>${achN}/${ACHIEVEMENTS.length}</b><span>досягнень</span></div>
    </div>

    <div class="grid c2 section">
      <div class="card"><h3>Швидкість (останні ${hist.length || 0} тестів)</h3>
        ${hist.length > 1 ? lineChart({ series: [{ values: hist.map(r => r.wpm) }], labels: hist.map((r, i) => String(i + 1)), title: 'Історія швидкості, слів за хвилину', height: 210 }) : '<p class="muted">Пройдіть хоча б два тести швидкості, щоб побачити графік.</p>'}
      </div>
      <div class="card"><h3>Точність, %</h3>
        ${hist.length > 1 ? lineChart({ series: [{ values: hist.map(r => r.acc), cls: 'g' }], labels: hist.map((r, i) => String(i + 1)), max: 100, title: 'Історія точності у відсотках', height: 210 }) : '<p class="muted">Тут з’явиться графік точності.</p>'}
      </div>
      <div class="card"><h3>Хвилини практики за 14 днів</h3>${barChart({ values: dayVals, labels: dayLabels, title: 'Хвилини практики за останні 14 днів', unit: 'хв' })}</div>
      <div class="card"><h3>Курси друку</h3>
        ${['uk', 'en'].map(l => `<div style="margin-bottom:1rem"><div style="display:flex;justify-content:space-between"><span>${LANG_NAMES[l]}</span><b>${lessonsDone(l)} / ${COURSES[l].length}</b></div><div class="progress green"><span style="width:${(lessonsDone(l) / COURSES[l].length) * 100}%"></span></div></div>`).join('')}
        <h3 style="margin-top:1.2rem">Комбінації за категоріями</h3>
        ${CATEGORIES.map(c => { const all = SHORTCUTS.filter(s => s.cat === c.id); const m = all.filter(s => mastered(s.id)).length; return `<div style="display:flex;justify-content:space-between;gap:1rem;font-size:.95rem;padding:.2rem 0"><span>${esc(c.name)}</span><span class="muted">${m}/${all.length}</span></div>`; }).join('')}
      </div>
    </div>

    <div class="grid c2 section">
      <div class="card"><h3>Слабкі символи</h3>
        ${['uk', 'en'].map(l => { const w = weakChars(l, 8); return `<p style="margin:.6rem 0 .3rem"><b>${LANG_NAMES[l]}</b></p>${w.length ? `<div class="weak-list">${w.map(x => `<span class="weak-ch"><b>${esc(x.c)}</b><span>${x.e} з ${x.h}</span></span>`).join('')}</div>` : '<p class="muted">Даних поки замало або помилок майже немає.</p>'}`; }).join('')}
      </div>
      <div class="card"><h3>Рекомендації</h3>
        ${recos.length ? recos.slice(0, 7).map(r => `<div class="reco"><span>${esc(r.text)}</span><a class="btn small soft" href="${r.href}">${esc(r.btn)}</a></div>`).join('') : '<p class="muted">Почніть із першого уроку — і тут з’являться поради.</p>'}
      </div>
    </div>
  </div>`;
}
