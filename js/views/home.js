// Головна сторінка.
import { store } from '../core/store.js';
import { icon, esc, fmtDuration, dayKey, flameArt, plural } from '../core/ui.js';
import { COURSES } from '../content/lessons.js';
import { SHORTCUTS } from '../content/shortcuts.js';
import { SCENARIOS } from '../content/scenarios.js';
import { lessonsDone, streak, practicedToday, mastered, dailyFlame } from '../core/stats.js';

export function nextLessonIndex(lang) {
  const c = COURSES[lang];
  for (let i = 0; i < c.length; i++) if (!store.data.lessons[`${lang}:${i}`]?.done) return i;
  return c.length - 1;
}

function heroArt() {
  // Клавіші: ряди з позиціями. Підсвічуються під час «набору» слова «Привіт».
  const rows = [
    { y: 194, x0: 34, n: 12 },
    { y: 232, x0: 46, n: 11, home: [3, 6] },
    { y: 270, x0: 58, n: 10 },
  ];
  const press = { '1-4': 0, '1-5': 1, '2-4': 2, '1-2': 3, '1-1': 4, '2-5': 5 }; // П Р И В І Т
  let keys = '';
  rows.forEach((r, ri) => {
    for (let i = 0; i < r.n; i++) {
      const x = r.x0 + i * 38;
      const id = `${ri}-${i}`;
      const home = r.home && r.home.includes(i);
      const pr = id in press ? ` ha-press" style="animation-delay:${(0.5 + press[id] * 0.162).toFixed(2)}s` : '';
      keys += `<rect class="ha-key${home ? ' home' : ''}${pr}" x="${x}" y="${r.y}" width="33" height="33" rx="7"/>`;
      if (home) keys += `<rect class="ha-blue" x="${x + 11}" y="${r.y + 25}" width="11" height="3" rx="1.5"/>`;
    }
  });
  // широкі клавіші
  keys += `<rect class="ha-key" x="${34}" y="308" width="66" height="33" rx="7"/>
    <rect class="ha-key ha-press" style="animation-delay:${(0.5 + 7 * 0.162).toFixed(2)}s" x="108" y="308" width="226" height="33" rx="7"/>
    <rect class="ha-key" x="342" y="308" width="66" height="33" rx="7"/>
    <rect class="ha-key" x="416" y="308" width="70" height="33" rx="7"/>
    <rect class="ha-key" x="${470}" y="232" width="16" height="33" rx="5"/>
    <rect class="ha-key" x="${438}" y="270" width="48" height="33" rx="7"/>`;
  return `<svg viewBox="0 0 520 430" role="img" aria-label="Ілюстрація: на клавіатурі по черзі натискаються клавіші, а у вікні з’являється текст «Привіт, світе!»" class="ha-anim">
    <defs><clipPath id="haClip"><rect x="62" y="74" width="380" height="60"/></clipPath></defs>
    <!-- вікно з текстом -->
    <rect class="ha-surface" x="40" y="26" width="440" height="128" rx="18" stroke="var(--border-strong)" stroke-width="1.5"/>
    <circle class="ha-muted" cx="64" cy="48" r="5" opacity=".35"/><circle class="ha-muted" cx="80" cy="48" r="5" opacity=".35"/><circle class="ha-muted" cx="96" cy="48" r="5" opacity=".35"/>
    <rect class="ha-surface2" x="130" y="40" width="210" height="16" rx="8"/>
    <text class="ha-text" x="72" y="118" font-size="34" font-weight="600" style="font-family:var(--font)">Привіт, світе!</text>
    <g clip-path="url(#haClip)"><rect class="ha-surface ha-cover" x="66" y="76" width="300" height="56"/></g>
    <rect class="ha-blue ha-caret" x="340" y="86" width="3" height="40" rx="1.5"/>
    <!-- клавіатура -->
    <rect class="ha-surface2" x="20" y="178" width="480" height="180" rx="22" stroke="var(--border-strong)" stroke-width="1.5"/>
    ${keys}
    <!-- пальці на основній позиції -->
    <circle class="ha-violet" cx="${46 + 3 * 38 + 16.5}" cy="248" r="5" opacity=".55"/>
    <circle class="ha-violet" cx="${46 + 6 * 38 + 16.5}" cy="248" r="5" opacity=".55"/>
    <!-- бейдж швидкості -->
    <g class="ha-pop" style="animation-delay:2.7s">
      <rect class="ha-green-soft" x="366" y="4" width="142" height="44" rx="22" stroke="var(--green)" stroke-width="1.5"/>
      <path d="M388 34a12 12 0 0124 0" fill="none" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"/><path d="M400 34l6-7" stroke="var(--green)" stroke-width="2.5" stroke-linecap="round"/>
      <text x="420" y="32" font-size="16" font-weight="700" fill="var(--green)" style="font-family:var(--font)">42 сл/хв</text>
    </g>
    <!-- комбінація клавіш -->
    <g class="ha-pop" style="animation-delay:2.95s">
      <rect class="ha-surface" x="18" y="376" width="148" height="46" rx="14" stroke="var(--border-strong)" stroke-width="1.5"/>
      <rect class="ha-blue-soft" x="28" y="384" width="52" height="30" rx="7" stroke="var(--blue)" stroke-width="1.5"/>
      <text x="54" y="405" text-anchor="middle" font-size="14" font-weight="700" fill="var(--blue)" style="font-family:var(--font)">Ctrl</text>
      <text x="92" y="405" text-anchor="middle" font-size="16" font-weight="700" class="ha-muted" style="font-family:var(--font)">+</text>
      <rect class="ha-blue-soft" x="104" y="384" width="52" height="30" rx="7" stroke="var(--blue)" stroke-width="1.5"/>
      <text x="130" y="405" text-anchor="middle" font-size="14" font-weight="700" fill="var(--blue)" style="font-family:var(--font)">C</text>
    </g>
    <!-- мови -->
    <g class="ha-pop" style="animation-delay:3.2s">
      <rect class="ha-violet-soft" x="376" y="378" width="126" height="42" rx="21" stroke="var(--violet)" stroke-width="1.5"/>
      <text x="439" y="405" text-anchor="middle" font-size="15" font-weight="700" fill="var(--violet)" style="font-family:var(--font)">УКР · ENG</text>
    </g>
  </svg>`;
}

export function render(el) {
  const d = store.data;
  const lang = d.settings.typingLang;
  const anyLesson = Object.values(d.lessons).some(l => l.done);
  const next = nextLessonIndex(lang);
  const primaryHref = `#/academy/${lang}/${next}`;
  const primaryLabel = anyLesson ? `Продовжити: урок ${next + 1}` : 'Почати перший урок';
  const best = Math.max(0, ...['uk', 'en'].map(l => d.records[l]?.wpm || 0));
  const totalLessons = COURSES.uk.length + COURSES.en.length;
  const doneLessons = lessonsDone('uk') + lessonsDone('en');
  const st = streak();
  const today = practicedToday();
  const hasProgress = doneLessons > 0 || d.speed.length > 0 || d.practice.total > 0;
  const masteredN = SHORTCUTS.filter(s => mastered(s.id)).length;
  const scnDone = SCENARIOS.filter(s => d.scenarios[s.id]?.done).length;
  const dailyDone = !!d.daily[dayKey()];
  const fl = dailyFlame();
  const flDays = `${fl.n} ${plural(fl.n, 'день', 'дні', 'днів')} поспіль`;
  const flLabel = { lit: `вогник горить, ${flDays}`, risk: `${flDays}, сьогодні ще не виконано`, out: 'вогник згас', new: 'вогник ще не запалено' }[fl.state];

  el.innerHTML = `<div class="page">
    <section class="hero" aria-labelledby="hero-title">
      <div>
        <h1 id="hero-title">Клавіатура — <em>це просто</em></h1>
        <p class="hero-lead">Сліпий друк, швидкість і корисні комбінації клавіш. Для будь-якого віку, українською та англійською.</p>
        <div class="btn-row">
          <a class="btn primary" href="${primaryHref}">${icon('play')} ${esc(primaryLabel)}</a>
          <a class="btn" href="#/speed">${icon('gauge')} Перевірити швидкість</a>
          <a class="btn btn-daily fl-${fl.state}" href="#/daily" aria-label="Щоденне тренування: ${flLabel}">${flameArt(fl.state)} Щоденне тренування${fl.n ? `<span class="fl-count" aria-hidden="true">${fl.n}</span>` : ''}</a>
        </div>
      </div>
      <div class="hero-art">${heroArt()}</div>
    </section>

    ${d.last && d.last.hash !== '#/home' ? `<section class="section card continue-card" aria-label="Продовжити">
      <div><div class="muted" style="font-size:.9rem">Ви зупинилися тут</div><h3 style="margin:0">${esc(d.last.title)}</h3></div>
      <a class="btn soft" href="${esc(d.last.hash)}">${icon('right')} Продовжити</a>
    </section>` : ''}

    ${hasProgress ? `<section class="section" aria-labelledby="ov-title">
      <h2 id="ov-title" class="sr-only">Ваш прогрес</h2>
      <div class="tiles">
        <div class="tile"><b>${doneLessons}/${totalLessons}</b><span>уроків пройдено</span></div>
        <div class="tile"><b>${best}</b><span>найкраща швидкість, сл/хв</span></div>
        <div class="tile"><b>${fmtDuration(today)}</b><span>практики сьогодні</span></div>
        <div class="tile"><b>${st}</b><span>днів поспіль</span></div>
      </div>
    </section>` : ''}

    <section class="section" aria-labelledby="mod-title">
      <h2 id="mod-title">Що будемо вчити?</h2>
      <div class="grid mods">
        <a class="card module-card" href="#/academy">
          <span class="m-ico mi-blue">${icon('hands')}</span>
          <h3>Академія друку</h3>
          <p>Уроки сліпого друку всіма десятьма пальцями — крок за кроком.</p>
          <span class="go">${lessonsDone(lang)} з ${COURSES[lang].length} уроків ${icon('right')}</span>
        </a>
        <a class="card module-card" href="#/speed">
          <span class="m-ico mi-green">${icon('gauge')}</span>
          <h3>Швидкість друку</h3>
          <p>Тести на швидкість і точність, тренування слабких літер.</p>
          <span class="go">${best ? `Рекорд: ${best} сл/хв` : 'Пройти тест'} ${icon('right')}</span>
        </a>
        <a class="card module-card" href="#/shortcuts">
          <span class="m-ico mi-violet">${icon('combo')}</span>
          <h3>Комбінації клавіш</h3>
          <p>Копіювати, вставити, скасувати, перемкнути вікно — з практикою.</p>
          <span class="go">Освоєно ${masteredN} з ${SHORTCUTS.length} ${icon('right')}</span>
        </a>
        <a class="card module-card" href="#/explorer">
          <span class="m-ico mi-amber">${icon('keyboard')}</span>
          <h3>Знайомство з клавіатурою</h3>
          <p>Що робить кожна клавіша, і гра «Знайди клавішу».</p>
          <span class="go">Вивчено клавіш: ${d.keys.length} ${icon('right')}</span>
        </a>
      </div>
      <div class="grid mods" style="margin-top:1rem">
        <a class="card module-card" href="#/everyday" style="min-height:0">
          <span class="m-ico mi-blue">${icon('window')}</span>
          <h3>Комп'ютер щодня</h3>
          <p>Лист рідним, пошук в інтернеті, збереження документа.</p>
          <span class="go">Виконано ${scnDone} з ${SCENARIOS.length} ${icon('right')}</span>
        </a>
        <a class="card module-card" href="#/daily" style="min-height:0">
          <span class="m-ico mi-green">${icon('calendar')}</span>
          <h3>Щоденне тренування</h3>
          <p>Близько ${d.settings.dailyMinutes} хвилин: розминка, друк на швидкість і коротке завдання.</p>
          <span class="go">${dailyDone ? 'Сьогодні вже виконано ✓' : 'Почати'} ${icon('right')}</span>
        </a>
      </div>
    </section>
  </div>`;
}
