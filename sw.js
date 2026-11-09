// Service Worker: офлайн-робота й оновлення. Змініть VERSION під час кожного оновлення файлів.
const VERSION = 'ka-v1.0.4';
const ASSETS = [
  './',
  'css/app.css',
  'fonts/Inter-Bold.woff2',
  'fonts/Inter-Medium.woff2',
  'fonts/Inter-Regular.woff2',
  'fonts/Inter-SemiBold.woff2',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/icon.svg',
  'index.html',
  'js/content/keys.js',
  'js/content/lessons.js',
  'js/content/scenarios.js',
  'js/content/shortcuts.js',
  'js/content/texts.js',
  'js/core/charts.js',
  'js/core/generate.js',
  'js/core/keyboard.js',
  'js/core/layouts.js',
  'js/core/nav.js',
  'js/core/practice.js',
  'js/core/pwa.js',
  'js/core/stats.js',
  'js/core/store.js',
  'js/core/typing.js',
  'js/core/ui.js',
  'js/main.js',
  'js/views/academy.js',
  'js/views/achievements.js',
  'js/views/daily.js',
  'js/views/everyday.js',
  'js/views/explorer.js',
  'js/views/help.js',
  'js/views/home.js',
  'js/views/onboarding.js',
  'js/views/progress.js',
  'js/views/settings.js',
  'js/views/shortcuts.js',
  'js/views/speed.js',
  'manifest.webmanifest',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  // Сторінка: спершу мережа (свіжа версія), без мережі — з кешу.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put('./index.html', copy));
      return res;
    }).catch(() => caches.match('./index.html', { ignoreSearch: true }).then(r => r || caches.match('./'))));
    return;
  }
  // Ресурси: з кешу, інакше з мережі (і додаємо в кеш).
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
    if (res.ok && res.type === 'basic') { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  })));
});
