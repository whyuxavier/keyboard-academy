// Вступ під час першого запуску.
import { store } from '../core/store.js';
import { modal, icon, speechSupported, speak } from '../core/ui.js';

export function showOnboarding() {
  const s = store.data.settings;
  let step = 0;
  let start = 'beginner';
  const steps = [
    () => `<p style="font-size:1.12rem">Тут можна навчитися впевнено користуватися клавіатурою — від перших кроків до швидкого друку всіма пальцями.</p>
      <ul style="padding-left:1.2rem">
        <li>Уроки сліпого друку крок за кроком</li>
        <li>Тренажер швидкості й точності</li>
        <li>Корисні комбінації клавіш із практикою</li>
        <li>Пояснення кожної клавіші простими словами</li>
      </ul>
      <p class="muted">Без реєстрації. Прогрес зберігається автоматично. Поспішати нікуди — вчіться у своєму темпі.</p>`,
    () => `<p>Якою мовою будемо друкувати? Пізніше можна змінити будь-коли.</p>
      <div class="stack" style="gap:.6rem">
        <button class="choice" type="button" data-lang="uk" aria-pressed="${s.typingLang === 'uk'}"><span style="font-size:1.4rem">УКР</span><span>Українська<small>Розкладка ЙЦУКЕН</small></span></button>
        <button class="choice" type="button" data-lang="en" aria-pressed="${s.typingLang === 'en'}"><span style="font-size:1.4rem">ENG</span><span>English<small>Розкладка QWERTY</small></span></button>
      </div>`,
    () => `<p>Як вам зручніше?</p>
      <div class="stack" style="gap:.6rem">
        <button class="choice" type="button" data-size="1" aria-pressed="${s.fontScale === 1 && !s.large}"><span style="font-size:1rem">Аа</span><span>Звичайний розмір</span></button>
        <button class="choice" type="button" data-size="1.25" aria-pressed="${s.fontScale > 1 || s.large}"><span style="font-size:1.5rem">Аа</span><span>Великий текст і кнопки<small>Легше читати й натискати</small></span></button>
        ${speechSupported() ? `<button class="choice" type="button" data-speech aria-pressed="${s.speech}">${icon('speak')}<span>Читати інструкції вголос<small>Натисніть, щоб увімкнути або вимкнути</small></span></button>` : ''}
      </div>`,
    () => `<p>З чого почнемо?</p>
      <div class="stack" style="gap:.6rem">
        <button class="choice" type="button" data-start="beginner" aria-pressed="${start === 'beginner'}">${icon('hands')}<span>Я тільки починаю<small>Перший урок: знайомство з клавіатурою</small></span></button>
        <button class="choice" type="button" data-start="speed" aria-pressed="${start === 'speed'}">${icon('gauge')}<span>Я вже вмію друкувати<small>Перевірити швидкість і точність</small></span></button>
        <button class="choice" type="button" data-start="shortcuts" aria-pressed="${start === 'shortcuts'}">${icon('combo')}<span>Хочу вивчити комбінації клавіш<small>Копіювати, вставити, скасувати…</small></span></button>
      </div>`,
  ];
  const titles = ['Вітаємо в Keyboard Academy!', 'Мова друку', 'Зручність', 'Перший крок'];
  let dlg = null;
  let navigating = false;
  function go(fn) { navigating = true; setTimeout(fn); }
  function draw() {
    navigating = false;
    dlg = modal({
      title: titles[step],
      body: steps[step]() + `<div class="onb-dots" aria-hidden="true">${steps.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('')}</div><p class="sr-only">Крок ${step + 1} з ${steps.length}</p>`,
      actions: [
        step > 0 ? { label: 'Назад', onClick: () => go(() => { step--; draw(); }) } : { label: 'Пропустити', onClick: finishSkip },
        { label: step === steps.length - 1 ? 'Почати' : 'Далі', primary: true, onClick: () => { if (step === steps.length - 1) go(finish); else go(() => { step++; draw(); }); } },
      ],
      onClose: () => { if (!navigating) finishSkip(); },
    });
    const b = dlg.body;
    b.querySelectorAll('[data-lang]').forEach(x => x.addEventListener('click', () => { s.typingLang = x.dataset.lang; store.save(); b.querySelectorAll('[data-lang]').forEach(y => y.setAttribute('aria-pressed', String(y === x))); }));
    b.querySelectorAll('[data-size]').forEach(x => x.addEventListener('click', () => {
      const big = x.dataset.size !== '1';
      s.fontScale = big ? 1.25 : 1; s.large = big; store.save();
      window.dispatchEvent(new CustomEvent('ka:settings'));
      b.querySelectorAll('[data-size]').forEach(y => y.setAttribute('aria-pressed', String(y === x)));
    }));
    b.querySelector('[data-speech]')?.addEventListener('click', e => {
      s.speech = !s.speech; store.save();
      e.currentTarget.setAttribute('aria-pressed', String(s.speech));
      if (s.speech) speak('Озвучення увімкнено.');
    });
    b.querySelectorAll('[data-start]').forEach(x => x.addEventListener('click', () => { start = x.dataset.start; b.querySelectorAll('[data-start]').forEach(y => y.setAttribute('aria-pressed', String(y === x))); }));
  }
  function finishSkip() { store.data.onboarded = true; store.save(); }
  function finish() {
    finishSkip();
    const target = start === 'speed' ? '#/speed' : start === 'shortcuts' ? '#/shortcuts' : `#/academy/${s.typingLang}/0`;
    if (location.hash === target) window.dispatchEvent(new HashChangeEvent('hashchange')); else location.hash = target;
  }
  draw();
}
