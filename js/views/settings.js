// Налаштування.
import { store } from '../core/store.js';
import { icon, esc, toast, confirmDialog, modal, speak, speechSupported, ukVoice, dayKey } from '../core/ui.js';
import { canInstall, promptInstall, isStandalone } from '../core/pwa.js';

export function render(el) {
  const s = store.data.settings;
  const seg = (key, opts, val) => `<div class="seg" role="group" aria-label="${esc(key)}">${opts.map(([v, l]) => `<button type="button" data-set="${key}" data-v="${v}" aria-pressed="${String(v) === String(val)}">${esc(l)}</button>`).join('')}</div>`;
  const sw = (key, title, sub = '') => `<label class="switch"><span class="txt"><span>${esc(title)}</span>${sub ? `<small>${esc(sub)}</small>` : ''}</span><input type="checkbox" data-sw="${key}" ${s[key] ? 'checked' : ''}></label>`;
  const voiceNote = !speechSupported() ? 'Ваш браузер не підтримує озвучення.' : 'Озвучуються пояснення уроків і завдання.';

  el.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Налаштування</h1><p>Зміни застосовуються одразу й зберігаються автоматично.</p></div></div>
    <div class="grid c2" style="align-items:start">
      <section class="card stack" aria-labelledby="s-look">
        <h2 id="s-look">Вигляд і зручність</h2>
        <div class="field"><span class="lbl">Тема</span>${seg('theme', [['system', 'Як у системі'], ['light', 'Світла'], ['dark', 'Темна']], s.theme)}</div>
        <div class="field"><span class="lbl">Розмір тексту</span>${seg('fontScale', [[1, 'Звичайний'], [1.125, 'Більший'], [1.25, 'Великий'], [1.4, 'Дуже великий']], s.fontScale)}</div>
        <div class="field"><span class="lbl">Анімації</span>${seg('motion', [['system', 'Як у системі'], ['reduce', 'Мінімум'], ['full', 'Увімкнені']], s.motion)}</div>
        <div>
          ${sw('large', 'Великий інтерфейс', 'Більші кнопки й відступи — зручніше натискати.')}
          ${sw('contrast', 'Висока контрастність', 'Чорний текст на білому, чіткі рамки.')}
          ${sw('showFingers', 'Кольори пальців на клавіатурі', 'Підказує, яким пальцем натискати кожну клавішу.')}
        </div>
      </section>

      <section class="card stack" aria-labelledby="s-sound">
        <h2 id="s-sound">Звук і голос</h2>
        <div>
          ${sw('sound', 'Звукові сигнали', 'Тихі звуки правильного й неправильного натискання.')}
          ${sw('speech', 'Озвучення інструкцій', voiceNote)}
        </div>
        ${speechSupported() ? `<div class="btn-row"><button class="btn small" type="button" data-testvoice>${icon('speak')} Перевірити голос</button></div><p class="muted" data-voice style="margin:0;font-size:.92rem"></p>` : ''}
        <h2 style="margin-top:1rem">Мова і клавіатура</h2>
        <p style="margin:0">Мова інтерфейсу: <b>українська</b></p>
        <div class="field"><span class="lbl">Мова вправ (за замовчуванням)</span>${seg('typingLang', [['uk', 'Українська'], ['en', 'English']], s.typingLang)}</div>
        <div class="field"><span class="lbl">Підписи на віртуальній клавіатурі</span>${seg('kbLayout', [['auto', 'Як мова вправи'], ['uk', 'Завжди УКР'], ['en', 'Завжди ENG']], s.kbLayout)}<small>Розкладку вашої справжньої клавіатури змінюйте в системі: Alt + Shift або Win + Пробіл.</small></div>
      </section>

      <section class="card stack" aria-labelledby="s-learn">
        <h2 id="s-learn">Навчання</h2>
        ${sw('unlockAll', 'Відкрити всі уроки', 'Можна проходити уроки в будь-якому порядку.')}
        <div class="field"><span class="lbl">Тривалість щоденного тренування</span>${seg('dailyMinutes', [[3, '3 хв'], [5, '5 хв'], [10, '10 хв']], s.dailyMinutes)}</div>
        <div class="field"><span class="lbl">Мова щоденного тренування</span>${seg('dailyLang', [['auto', 'Як мова вправ'], ['uk', 'Українська'], ['en', 'English']], s.dailyLang)}</div>
      </section>

      <section class="card stack" aria-labelledby="s-data">
        <h2 id="s-data">Мої дані</h2>
        <p class="muted" style="margin:0">Прогрес зберігається лише в цьому браузері. Збережіть файл, щоб перенести його на інший пристрій.</p>
        <div class="btn-row">
          <button class="btn" type="button" data-export>${icon('download')} Експорт прогресу</button>
          <label class="btn" style="cursor:pointer">${icon('upload')} Імпорт прогресу<input type="file" accept=".json,application/json" data-import class="sr-only"></label>
        </div>
        <button class="btn danger" type="button" data-reset style="align-self:flex-start">${icon('trash')} Скинути весь прогрес</button>
        <h2 style="margin-top:1rem">Застосунок</h2>
        <p class="muted" style="margin:0">${isStandalone() ? 'Тренажер встановлено як застосунок.' : 'Тренажер можна встановити як застосунок — він працюватиме навіть без інтернету.'}</p>
        <div class="btn-row"><button class="btn primary" type="button" data-install ${canInstall() ? '' : 'hidden'}>${icon('download')} Встановити застосунок</button></div>
        ${!canInstall() && !isStandalone() ? '<p class="muted" style="margin:0;font-size:.92rem">Якщо кнопки встановлення немає: у Chrome чи Edge відкрийте меню браузера (⋮) → «Встановити Keyboard Academy». На iPhone — «Поділитися» → «На початковий екран».</p>' : ''}
      </section>
    </div>
  </div>`;

  const apply = () => window.dispatchEvent(new CustomEvent('ka:settings'));
  el.querySelectorAll('[data-set]').forEach(b => b.addEventListener('click', () => {
    const k = b.dataset.set;
    let v = b.dataset.v;
    if (k === 'fontScale' || k === 'dailyMinutes') v = Number(v);
    s[k] = v;
    store.save();
    el.querySelectorAll(`[data-set="${k}"]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  }));
  el.querySelectorAll('[data-sw]').forEach(c => c.addEventListener('change', () => {
    s[c.dataset.sw] = c.checked;
    store.save();
    apply();
    if (c.dataset.sw === 'speech' && c.checked) speak('Озвучення увімкнено.');
  }));
  const vEl = el.querySelector('[data-voice]');
  const showVoice = () => { if (vEl) vEl.textContent = ukVoice() ? `Український голос: ${ukVoice().name}.` : 'На цьому пристрої не знайдено українського голосу — текст може звучати з акцентом. Український голос можна додати в налаштуваннях мови вашої системи.'; };
  if (vEl) { showVoice(); speechSynthesis.addEventListener?.('voiceschanged', showVoice); }
  el.querySelector('[data-testvoice]')?.addEventListener('click', () => speak('Добрий день! Я допомагатиму вам вчитися друкувати.', true));

  el.querySelector('[data-export]').addEventListener('click', () => {
    try {
      const blob = new Blob([store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `keyboard-academy-progress-${dayKey()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      toast('Файл прогресу збережено в «Завантаження».', { icon: 'check' });
    } catch (e) { toast('Не вдалося створити файл.', { icon: 'warn' }); }
  });
  el.querySelector('[data-import]').addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { modal({ title: 'Файл завеликий', body: '<p>Це не схоже на файл прогресу Keyboard Academy.</p>' }); return; }
    const ok = await confirmDialog('Імпортувати прогрес?', 'Поточний прогрес у цьому браузері буде замінено даними з файлу.', 'Імпортувати');
    if (!ok) return;
    const res = store.importJSON(await f.text());
    if (res.ok) { apply(); toast('Прогрес імпортовано.', { icon: 'check' }); render(el); }
    else modal({ title: 'Не вдалося імпортувати', body: `<p>${esc(res.error)}</p><p class="muted">Ваш поточний прогрес не змінено.</p>` });
  });
  el.querySelector('[data-reset]').addEventListener('click', async () => {
    const ok = await confirmDialog('Скинути весь прогрес?', 'Буде видалено уроки, результати тестів, досягнення та статистику. Налаштування залишаться. Цю дію неможливо скасувати — за потреби спершу зробіть експорт.', 'Так, скинути', true);
    if (!ok) return;
    store.reset();
    toast('Прогрес скинуто.');
    render(el);
  });
  const inst = el.querySelector('[data-install]');
  inst.addEventListener('click', () => promptInstall());
  const onInst = () => { inst.hidden = !canInstall(); };
  window.addEventListener('ka:install-changed', onInst);
  return () => window.removeEventListener('ka:install-changed', onInst);
}
