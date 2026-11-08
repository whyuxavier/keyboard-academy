// Курси сліпого друку. Структура уроку:
// { title, intro, type: 'keys' | 'type', steps?: [{codes, text}], exercises?: [рядки], blind? }
// Щоб додати урок — допишіть об'єкт у масив потрібної мови.

const keysLesson = (lang) => ({
  title: 'Знайомство з клавіатурою',
  type: 'keys',
  intro: 'Почнемо з головного: знайдемо найважливіші клавіші. Читайте підказку й натискайте клавішу, яку вона описує. Поспішати не потрібно — синім підсвічено потрібне місце.',
  steps: [
    { codes: ['Space'], text: 'Знайдіть найдовшу клавішу внизу — це Пробіл. Він ставить проміжок між словами. Натисніть його великим пальцем.' },
    { codes: ['Enter', 'NumpadEnter'], text: 'Праворуч є велика клавіша Enter. Вона переносить текст на новий рядок і підтверджує дію. Натисніть Enter.' },
    { codes: ['Backspace'], text: 'Над Enter — Backspace (часто зі стрілкою ←). Вона стирає символ ліворуч від курсору. Натисніть її.' },
    { codes: ['ShiftLeft', 'ShiftRight'], text: 'Shift — їх два, ліворуч і праворуч унизу. Утримуючи Shift, ми пишемо великі літери. Натисніть будь-який Shift.' },
    { codes: ['KeyF'], text: lang === 'uk' ? 'Знайдіть літеру А. На ній є маленький горбик — його можна намацати пальцем. Натисніть А.' : 'Знайдіть літеру F. На ній є маленький горбик — його можна намацати пальцем. Натисніть F.' },
    { codes: ['KeyJ'], text: lang === 'uk' ? 'Тепер знайдіть О — на ній теж є горбик. За цими горбиками руки знаходять своє місце наосліп. Натисніть О.' : 'Тепер знайдіть J — на ній теж є горбик. За цими горбиками руки знаходять своє місце наосліп. Натисніть J.' },
    { codes: ['CapsLock'], text: 'Ліворуч є Caps Lock. Він вмикає режим ВЕЛИКИХ ЛІТЕР — на клавіатурі може засвітитися лампочка. Натисніть Caps Lock.' },
    { codes: ['CapsLock'], text: 'Натисніть Caps Lock ще раз, щоб вимкнути великі літери. Лампочка згасне.' },
    { codes: ['Tab'], text: 'Над Caps Lock — Tab. Вона переходить до наступного поля або робить великий відступ. Натисніть Tab.' },
  ],
});

const INTRO = {
  hands: (l) => `Покладіть пальці лівої руки на ${l === 'uk' ? 'Ф І В А' : 'A S D F'}, а правої — на ${l === 'uk' ? 'О Л Д Ж' : 'J K L ;'}. Великі пальці — над пробілом. Вказівні пальці відчувають горбики на ${l === 'uk' ? 'А та О' : 'F та J'}. Це «основна позиція»: після кожного натискання пальці повертаються сюди.`,
  home: (l) => `Основний (середній) ряд — ${l === 'uk' ? 'Ф І В А П Р О Л Д Ж Є' : 'A S D F G H J K L ;'}. Звідси пальці дотягуються до всіх інших клавіш. Дивіться на екран, а не на руки: підказка покаже, яким пальцем натискати.`,
  top: (l) => `Верхній ряд — ${l === 'uk' ? 'Й Ц У К Е Н Г Ш Щ З Х Ї' : 'Q W E R T Y U I O P'}. Пальці тягнуться вгору зі своїх місць і одразу повертаються на основний ряд.`,
  bottom: (l) => `Нижній ряд — ${l === 'uk' ? 'Я Ч С М И Т Ь Б Ю і крапка' : 'Z X C V B N M , . /'}. Пальці трохи згинаються донизу. ${l === 'uk' ? 'Крапка — праворуч від Ю, кома — та сама клавіша разом із Shift.' : ''}`,
  left: (l) => `Тренуємо пальці лівої руки. Кожен палець має свою «колонку» клавіш: мізинець — ${l === 'uk' ? 'Й Ф Я' : 'Q A Z'}, безіменний — ${l === 'uk' ? 'Ц І Ч' : 'W S X'}, середній — ${l === 'uk' ? 'У В С' : 'E D C'}, вказівний — ${l === 'uk' ? 'К Е А П М И' : 'R T F G V B'}.`,
  right: (l) => `Тренуємо пальці правої руки: вказівний — ${l === 'uk' ? 'Н Г Р О Т Ь' : 'Y U H J N M'}, середній — ${l === 'uk' ? 'Ш Л Б' : 'I K ,'}, безіменний — ${l === 'uk' ? 'Щ Д Ю' : 'O L .'}, мізинець — ${l === 'uk' ? 'З Х Ї Ж Є та крапка' : 'P ; / та інші клавіші праворуч'}.`,
  both: () => 'Тепер руки працюють по черзі. Чергування рук — секрет рівного, спокійного ритму. Друкуйте повільно й рівномірно.',
  shift: () => 'Велика літера = Shift + літера. Правило: Shift натискаємо мізинцем ПРОТИЛЕЖНОЇ руки. Літера ліворуч — правий Shift, літера праворуч — лівий Shift. Спершу натисніть і тримайте Shift, потім літеру.',
  caps: () => 'Caps Lock вмикає режим ВЕЛИКИХ ЛІТЕР, доки ви не натиснете його знову. Зручно для коротких слів-написів. Для звичайного тексту краще використовувати Shift.',
  numbers: () => 'Цифри — у верхньому ряду. Тягніться до них тими самими пальцями, що й до літер під ними, і повертайтеся на основний ряд. Якщо є окремий цифровий блок праворуч, ним теж можна користуватися (коли увімкнено Num Lock).',
  punct: (l) => l === 'uk'
    ? 'В українській розкладці: крапка — праворуч від Ю; кома — Shift + та сама клавіша. «!» — Shift + 1, «"» — Shift + 2, «;» — Shift + 4, «:» — Shift + 6, «?» — Shift + 7. Апостроф — клавіша ліворуч від 1 (над Tab).'
    : 'В англійській розкладці: кома і крапка — праворуч від M, «?» — Shift + /, «!» — Shift + 1, «:» — Shift + ;, апостроф — праворуч від ;, лапки — Shift + апостроф.',
  combos: () => 'Деякі поєднання літер трапляються дуже часто. Якщо руки запам’ятають їх як один рух, друк стане швидшим і впевненішим.',
  short: () => 'Короткі слова — основа будь-якого тексту. Після кожного слова — пробіл великим пальцем.',
  long: () => 'Довгі слова вимагають уважності. Не поспішайте: читайте слово по складах і друкуйте рівномірно.',
  sentences: () => 'Справжні речення: велика літера на початку, розділові знаки й пробіли. Тримайте спокійний темп — точність важливіша за швидкість.',
  paragraphs: () => 'Довший текст — тренування витривалості. Сядьте зручно, розслабте плечі. Якщо втомилися — зробіть перерву, прогрес збережеться.',
  blind: () => 'Літери на віртуальній клавіатурі приховано. Спробуйте друкувати, не дивлячись на клавіатуру: пальці вже знають дорогу. Якщо двічі помилитеся — з’явиться підказка.',
};

function course(lang, X) {
  return [
    keysLesson(lang),
    { title: 'Положення рук', type: 'type', intro: INTRO.hands(lang), exercises: X.hands },
    { title: 'Основний ряд', type: 'type', intro: INTRO.home(lang), exercises: X.home },
    { title: 'Верхній ряд', type: 'type', intro: INTRO.top(lang), exercises: X.top },
    { title: 'Нижній ряд', type: 'type', intro: INTRO.bottom(lang), exercises: X.bottom },
    { title: 'Пальці лівої руки', type: 'type', intro: INTRO.left(lang), exercises: X.left },
    { title: 'Пальці правої руки', type: 'type', intro: INTRO.right(lang), exercises: X.right },
    { title: 'Дві руки разом', type: 'type', intro: INTRO.both(lang), exercises: X.both },
    { title: 'Великі літери з Shift', type: 'type', intro: INTRO.shift(lang), exercises: X.shift },
    { title: 'Caps Lock', type: 'type', intro: INTRO.caps(lang), exercises: X.caps },
    { title: 'Цифри', type: 'type', intro: INTRO.numbers(lang), exercises: X.numbers },
    { title: 'Розділові знаки та символи', type: 'type', intro: INTRO.punct(lang), exercises: X.punct },
    { title: 'Часті поєднання літер', type: 'type', intro: INTRO.combos(lang), exercises: X.combos },
    { title: 'Короткі слова', type: 'type', intro: INTRO.short(lang), exercises: X.short },
    { title: 'Довгі слова', type: 'type', intro: INTRO.long(lang), exercises: X.long },
    { title: 'Цілі речення', type: 'type', intro: INTRO.sentences(lang), exercises: X.sentences },
    { title: 'Абзаци', type: 'type', intro: INTRO.paragraphs(lang), exercises: X.paragraphs },
    { title: 'Друк наосліп', type: 'type', intro: INTRO.blind(lang), exercises: X.blind, blind: true },
  ];
}

const UK = {
  hands: ['а о а о а о', 'ф і в а о л д ж', 'аа оо аа оо вв лл', 'фф іі вв аа оо лл дд жж', 'фа ол ві дж ав ло'],
  home: ['ааа ооо ааа ооо', 'фа ів ал од жа ав', 'вода лава пава рада', 'два дар жар фара пара', 'лід рід ліра ідол права', 'водопад долар парад орда пора'],
  top: ['кк ее нн гг', 'ка ке ко ку не', 'кава нога рука ріка', 'гора шкода щока їжак', 'зірка хрущ шапка дерево', 'пекар голова озеро вікно цукор'],
  bottom: ['мм тт сс ии', 'ма ми ті сь бю яч', 'мама тато бабуся', 'час сто сміх мить', 'стіл юнак яблуко місто', 'ми читаємо, ти пишеш.'],
  left: ['фйф іці вув ака пеп', 'аяа іч ісі вмв аиа', 'кава сама вуса каса', 'суп мак сік яма квас', 'уява сівач вівця мавка', 'чай мийка пес ківі'],
  right: ['оро лол дод жож', 'нн гг тт ьь бб юю', 'рот дощ борщ горб', 'хор тон лото горох', 'болото гроно оболонь', 'що хто до тло дорого'],
  both: ['ар ок ст ні ло ва', 'сон день ніч рік', 'книга вікно сонце', 'лампа стілець весна місто', 'дім сад ліс поле річка', 'мама пече смачний пиріг'],
  shift: ['А О І Б', 'Анна Олег Ірина Тарас', 'Київ Львів Одеса Полтава', 'Карпати Дніпро Світязь', 'Добрий ранок, Марко'],
  caps: ['ТАК НІ ОК', 'УВАГА ВХІД ВИХІД', 'КАВА І ЧАЙ', 'ТАК так ТАК', 'ВІДЧИНЕНО ЗАЧИНЕНО'],
  numbers: ['1 2 3 4 5', '6 7 8 9 0', '10 20 30 40 50', '12 34 56 78 90', '3 кг яблук і 2 л молока', 'з 9 до 18 щодня'],
  punct: ['так. ні. так, ні.', 'Привіт! Як справи?', 'Увага: зачинено; вхід ліворуч.', "ім'я, м'ята, сім'я, п'ять", 'Знижка 20% (до неділі)!', 'Він сказав: "Добре".'],
  combos: ['ст ов на ко то', 'про при пре пра', 'ння ття сть ість', 'ова ова ння ння', 'стати пробувати ранок'],
  short: ['дім ліс сад', 'кіт пес сир хліб', 'мак сік чай мед', 'день ніч ранок вечір', 'так ні я ти ми ви', 'сонце море гори небо'],
  long: ["клавіатура комп'ютер", 'інформація повідомлення', 'електронна бібліотека', 'розклад навчання', 'привітання надзвичайно', 'відповідальність майбутнє'],
  sentences: ['Сьогодні тепла сонячна погода.', 'Я вчуся друкувати всіма пальцями.', 'Бабуся пече смачні пиріжки з вишнями.', 'Ввечері ми гуляли в парку біля річки.', 'Добре слово й кішці приємне.'],
  paragraphs: [
    "Осінь прийшла тихо. Дерева вбралися в жовте й червоне листя, а вранці над річкою стелиться легкий туман. Люди дістають теплі светри й п'ють гарячий чай.",
    'Щоранку я виходжу на коротку прогулянку. Свіже повітря допомагає прокинутися, а спокійний крок налаштовує на добрий день. Повернувшись додому, я готую сніданок.',
  ],
  blind: ['Друкуйте, не дивлячись на клавіатуру.', 'Пальці самі знають дорогу до клавіш.', 'Якщо помилилися, просто продовжуйте.', 'Спокій і точність важливіші за швидкість.'],
};

const EN = {
  hands: ['f j f j f j', 'a s d f j k l ;', 'aa ss dd ff jj kk ll ;;', 'fj dk sl a; fj dk', 'asdf jkl; asdf jkl;'],
  home: ['fff jjj fff jjj', 'aa ss dd ff jj kk ll', 'as ad all fall', 'dad sad lad glass', 'flash salad half flag', 'ask a lad; add a dash'],
  top: ['ee ii rr uu', 're ri ro ru', 'tree fire road', 'were your quiet', 'write paper story', 'the tired puppy is quiet'],
  bottom: ['nn mm cc vv', 'an in on am', 'man van can', 'box zone come', 'bank music brown', 'the new cab came back.'],
  left: ['qaz wsx edc rfv tgb', 'red cars, wet grass', 'tree, street, grade', 'water, desert, garage', 'we eat a sweet treat', 'brave cats get bread'],
  right: ['jhn kiu lo; ;p/', 'you only look', 'hill pink jump', 'moon noon pool', 'upon my kimono', 'holy mill lion join'],
  both: ['hand work goes', 'the sun is warm', 'a cup of tea', 'big blue sky', 'good morning to you', 'learn to type with ease'],
  shift: ['A S D F J K L', 'Anna Peter Maria', 'London Paris Kyiv', 'Monday Friday Sunday', 'Good Morning, Tom'],
  caps: ['OK YES NO', 'STOP EXIT OPEN', 'TEA AND COFFEE', 'YES yes YES', 'OPEN CLOSED'],
  numbers: ['1 2 3 4 5', '6 7 8 9 0', '10 20 30 40 50', '12 34 56 78 90', 'buy 3 apples and 2 pears', 'open from 9 to 18'],
  punct: ['yes. no. yes, no.', 'Hello! How are you?', 'Note: closed; use the side door.', "it's, don't, we're", 'Save 20% (until Sunday)!', 'She said: "Fine."'],
  combos: ['th he in er an', 'the then there', 'ing ion ent', 'and end ant', 'this thing is interesting'],
  short: ['cat dog sun sea', 'red big new old', 'home book tree milk', 'day night week year', 'yes no me you we', 'rain snow wind cloud'],
  long: ['keyboard computer', 'information message', 'beautiful wonderful', 'understand remember', 'comfortable important', 'neighbourhood everything'],
  sentences: ['The weather is warm and sunny today.', 'I am learning to type with all my fingers.', 'Grandma bakes delicious cherry pies.', 'In the evening we walked by the river.', 'Practice makes progress, not perfection.'],
  paragraphs: [
    'Autumn arrived quietly. The trees turned yellow and red, and a light mist lies over the river every morning. People take out warm sweaters and drink hot tea.',
    'Every morning I go for a short walk. Fresh air helps me wake up, and a calm pace sets the mood for a good day. When I get back home, I make breakfast.',
  ],
  blind: ['Type without looking at the keyboard.', 'Your fingers know the way to each key.', 'If you make a mistake, just keep going.', 'Calm and accuracy matter more than speed.'],
};

export const COURSES = { uk: course('uk', UK), en: course('en', EN) };
export const PASS_ACCURACY = 80; // мінімальна точність, щоб відкрити наступний урок
export function starsFor(acc) { return acc >= 97 ? 3 : acc >= 90 ? 2 : 1; }
// Слова з уроків — додаткове джерело для адаптивних вправ.
export function lessonWords(lang) {
  const X = lang === 'uk' ? UK : EN;
  const out = new Set();
  Object.values(X).flat().join(' ').split(/[\s.,!?:;"()%]+/).forEach(w => { if (w.length >= 2 && /^[\p{L}']+$/u.test(w)) out.add(w.toLowerCase()); });
  return [...out];
}
