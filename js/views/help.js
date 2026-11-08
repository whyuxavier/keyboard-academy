// Довідка: як почати, розкладки, формули, офлайн-режим, поширені запитання.
import { icon, esc } from '../core/ui.js';
import { scriptOf, LANG_NAMES } from '../core/layouts.js';
import { REPO_URL } from '../core/nav.js';
import { showOnboarding } from './onboarding.js';

export function render(el, { query }) {
  el.innerHTML = `<div class="page">
    <div class="page-head"><div><h1>Довідка</h1><p>Відповіді на часті запитання та поради, якщо щось не виходить.</p></div>
      <button class="btn" type="button" data-onb>${icon('play')} Показати вступ ще раз</button></div>
    <nav class="help-toc" aria-label="Розділи довідки">
      <a class="btn small" href="#/help?s=start">Як почати</a>
      <a class="btn small" href="#/help?s=layout">Мова клавіатури</a>
      <a class="btn small" href="#/help?s=uk">Українська розкладка</a>
      <a class="btn small" href="#/help?s=formulas">Як рахується швидкість</a>
      <a class="btn small" href="#/help?s=sim">Симуляція</a>
      <a class="btn small" href="#/help?s=offline">Без інтернету</a>
      <a class="btn small" href="#/help?s=faq">Запитання</a>
    </nav>
    <div class="stack">
      <section class="card prose" id="h-start"><h2>Як почати</h2>
        <ol>
          <li>Відкрийте <a href="#/academy">Академію друку</a> й почніть з уроку 1 — він знайомить з основними клавішами.</li>
          <li>Сядьте зручно: спина пряма, лікті зігнуті, екран — на рівні очей. Пальці легко лежать на клавішах, не тисніть сильно.</li>
          <li>Дивіться на екран, а не на руки. Синя клавіша на підказці — та, яку треба натиснути; підсвічений палець — яким саме.</li>
          <li>Не поспішайте. Точність важливіша за швидкість. 10 хвилин щодня — найкращий темп.</li>
          <li>Щоб вийти з поля набору й користуватися клавішею Tab для навігації, натисніть <kbd class="kc">Esc</kbd>.</li>
        </ol>
      </section>

      <section class="card prose" id="h-layout"><h2>Як перемкнути мову клавіатури</h2>
        <p>Якщо замість «привіт» друкується «ghbdsn» — увімкнена не та мова. Сайт не може сам змінити мову вашої клавіатури, але легко підкаже, яка зараз увімкнена.</p>
        <div class="notice" style="margin:1rem 0">${icon('keyboard')}<div style="flex:1"><p><b>Перевірка:</b> клацніть у поле й натисніть будь-яку літеру.</p>
          <input type="text" data-detect aria-label="Поле для перевірки мови клавіатури" placeholder="Натисніть будь-яку літеру" style="margin-top:.5rem;max-width:340px" autocomplete="off"><p data-detected style="margin-top:.5rem;font-weight:650" aria-live="polite"></p></div></div>
        <table class="t">
          <tr><th>Система</th><th>Як перемкнути</th></tr>
          <tr><td>Windows</td><td><kbd class="kc">Alt</kbd> + <kbd class="kc">Shift</kbd> або <kbd class="kc">Win</kbd> + <kbd class="kc">Пробіл</kbd>. Також можна клацнути «УКР»/«ENG» унизу праворуч.</td></tr>
          <tr><td>macOS</td><td><kbd class="kc">Ctrl</kbd> + <kbd class="kc">Пробіл</kbd> або клавіша 🌐 (Fn). Прапорець мови — угорі праворуч.</td></tr>
          <tr><td>ChromeOS</td><td><kbd class="kc">Ctrl</kbd> + <kbd class="kc">Пробіл</kbd>.</td></tr>
          <tr><td>Linux</td><td>Зазвичай <kbd class="kc">Super</kbd> + <kbd class="kc">Пробіл</kbd> або <kbd class="kc">Alt</kbd> + <kbd class="kc">Shift</kbd>.</td></tr>
          <tr><td>Телефон чи планшет</td><td>Кнопка 🌐 або довге натискання на пробіл на екранній клавіатурі.</td></tr>
        </table>
        <h3>Як додати українську мову</h3>
        <p>Windows: <kbd class="kc">Win</kbd> + <kbd class="kc">I</kbd> → «Час і мова» → «Мова й регіон» → «Додати мову» → «Українська». macOS: «Системні параметри» → «Клавіатура» → «Джерела вводу» → «+» → «Українська».</p>
      </section>

      <section class="card prose" id="h-uk"><h2>Особливості української розкладки</h2>
        <ul>
          <li><b>Крапка</b> — клавіша праворуч від Ю. <b>Кома</b> — та сама клавіша разом із Shift.</li>
          <li><b>Апостроф</b> (м’ята, сім’я) — клавіша ліворуч від 1, над Tab.</li>
          <li><b>Ґ</b> — у розкладці «Українська (розширена)» вона на клавіші над Enter (\\). У старій розкладці «Українська» — <kbd class="kc">Alt Gr</kbd> + Г. Якщо Ґ не друкується, увімкніть розширену розкладку в налаштуваннях мови Windows.</li>
          <li><b>«?»</b> — Shift + 7, <b>«!»</b> — Shift + 1, <b>«:»</b> — Shift + 6, <b>«"»</b> — Shift + 2, <b>«№»</b> — Shift + 3.</li>
          <li>Літери Й Ц У К Е… стоять на тих самих фізичних клавішах, що й Q W E R T…, тому пальці працюють однаково в обох мовах.</li>
        </ul>
        <h3>Корисно знати</h3>
        <ul>
          <li><b>Усе друкується ВЕЛИКИМИ</b> — увімкнено Caps Lock. Натисніть його ще раз.</li>
          <li><b>Цифри праворуч не друкуються</b> — натисніть Num Lock.</li>
          <li><b>Ноутбук без цифрового блоку</b> — користуйтеся цифрами у верхньому ряду. Клавіші Home, End, Page Up на ноутбуках часто працюють разом із клавішею Fn.</li>
          <li><b>Текст «з’їдає» літери праворуч</b> — увімкнено режим заміни. Натисніть Insert.</li>
        </ul>
      </section>

      <section class="card prose" id="h-formulas"><h2>Як рахується швидкість</h2>
        <ul>
          <li><b>«Слово»</b> — це 5 знаків разом із пробілами. Так рахують в усьому світі, щоб результати були порівнянні.</li>
          <li><b>Натискання</b> — усі введені знаки (без Backspace). <b>Помилки</b> — усі неправильні натискання, навіть якщо потім їх виправили.</li>
          <li><b>Валова швидкість</b> = (натискання ÷ 5) ÷ хвилини.</li>
          <li><b>Чиста швидкість (сл/хв)</b> = валова швидкість − (невиправлені помилки ÷ хвилини). Саме вона показується як головний результат.</li>
          <li><b>Знаків за хвилину</b> = правильно надруковані знаки ÷ хвилини.</li>
          <li><b>Точність</b> = (натискання − помилки) ÷ натискання × 100%.</li>
          <li>Час рахується від першого натискання. Результати коротші за 10 секунд не зберігаються в історії.</li>
        </ul>
        <p>В уроках Академії друку курсор не рушить далі, доки не натиснете правильну клавішу, — тож невиправлених помилок там не буває.</p>
      </section>

      <section class="card prose" id="h-sim"><h2>Справжня перевірка і симуляція</h2>
        <p>Більшість комбінацій (Ctrl + C, Ctrl + Z, Ctrl + S, Home…) сайт перевіряє по-справжньому: ви натискаєте клавіші на своїй клавіатурі.</p>
        <p>Але деякі комбінації керують самою Windows або браузером: Alt + Tab, Win + D, Ctrl + W (закриває вкладку), Ctrl + T. Браузер не дозволяє сайтам їх перехоплювати — і це правильно, бо інакше можна було б випадково закрити сторінку. Такі вправи позначені фіолетовою міткою <span class="sim-badge">Симуляція</span>: ви натискаєте екранні кнопки в правильному порядку, а потім пробуєте комбінацію самостійно в справжній програмі.</p>
      </section>

      <section class="card prose" id="h-offline"><h2>Робота без інтернету і встановлення</h2>
        <p>Після першого відкриття тренажер зберігається в браузері й працює навіть без інтернету. Прогрес зберігається лише на цьому пристрої, в цьому браузері.</p>
        <p>Щоб відкривати тренажер як окрему програму: у Chrome чи Edge — меню (⋮) → «Встановити Keyboard Academy»; на iPhone — «Поділитися» → «На початковий екран». Або скористайтеся кнопкою в <a href="#/settings">налаштуваннях</a>.</p>
        <p>Щоб перенести прогрес на інший комп’ютер, зробіть експорт у налаштуваннях і відкрийте файл через «Імпорт» на новому пристрої.</p>
      </section>

      <section class="card" id="h-faq"><h2>Поширені запитання</h2>
        <details class="faq"><summary>Чи потрібна реєстрація?</summary><p>Ні. Усе працює одразу, дані зберігаються лише у вашому браузері.</p></details>
        <details class="faq"><summary>Я друкую повільно. Це нормально?</summary><p>Так! Спочатку всі друкують повільно. Сліпий друк спершу навіть сповільнює, але за кілька тижнів регулярних занять швидкість зростає й залишається з вами назавжди.</p></details>
        <details class="faq"><summary>Урок не відкривається</summary><p>Уроки відкриваються по черзі, коли в попередньому точність від 80%. Щоб відкрити всі одразу, увімкніть «Відкрити всі уроки» в налаштуваннях.</p></details>
        <details class="faq"><summary>Натискаю правильну клавішу, а сайт каже «інша мова»</summary><p>Увімкнена не та розкладка. Перемкніть мову (Alt + Shift або Win + Пробіл) — вправа продовжиться з того самого місця.</p></details>
        <details class="faq"><summary>Чи можна користуватися на телефоні?</summary><p>Так, сайт працює на телефонах і планшетах, але тренажер створений насамперед для справжньої клавіатури комп’ютера чи ноутбука.</p></details>
        <details class="faq"><summary>Як вийти з поля, де я друкую?</summary><p>Натисніть Esc або клацніть мишкою в іншому місці. Щоб продовжити — клацніть по тексту вправи.</p></details>
      </section>

      <section class="card prose"><h2>Про проєкт</h2>
        <p>Keyboard Academy — відкритий навчальний проєкт. Код: <a href="${REPO_URL}" target="_blank" rel="noopener">${esc(REPO_URL.replace('https://', ''))}</a>.</p>
        <p class="ai-note">Сайт створено за допомогою штучного інтелекту.</p>
      </section>
    </div>
  </div>`;
  el.querySelector('[data-onb]').addEventListener('click', showOnboarding);
  const inp = el.querySelector('[data-detect]'), out = el.querySelector('[data-detected]');
  inp.addEventListener('keydown', e => {
    if (e.key.length !== 1) return;
    const sc = scriptOf(e.key);
    if (sc) out.textContent = `Зараз увімкнена мова: ${LANG_NAMES[sc]} ${sc === 'uk' ? '(УКР)' : '(ENG)'}.`;
    else out.textContent = 'Натисніть літеру, а не цифру чи знак.';
  });
  inp.addEventListener('input', () => { if (inp.value.length > 20) inp.value = inp.value.slice(-5); });
  if (query.s) {
    const t = el.querySelector('#h-' + query.s);
    if (t) setTimeout(() => { t.scrollIntoView({ block: 'start' }); t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }, 50);
  }
}
