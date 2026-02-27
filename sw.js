const CACHE = 'mathflow-v4';

const FILES = [
  './index.html',
  './manifest.json',
  './icon.png',
  // CSS
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/screens/home.css',
  './css/screens/subtopic.css',
  './css/screens/mode.css',
  './css/screens/practice.css',
  './css/screens/result.css',
  './css/screens/stats.css',
  // JS — data
  './js/data/pools.js',
  './js/data/generators.js',
  './js/data/topics.js',
  // JS — engine
  './js/engine/srs.js',
  './js/engine/storage.js',
  // JS — UI
  './js/ui/navigation.js',
  './js/ui/settings.js',
  './js/ui/home.js',
  './js/ui/subtopic.js',
  './js/ui/mode.js',
  './js/ui/practice.js',
  './js/ui/result.js',
  './js/ui/stats.js',
  './js/app.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
