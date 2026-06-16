const CACHE_NAME = 'pomodoro-v1';
const ASSETS = [
  './',
  './index.html',
  './script.js',
  './pomodoro-192.png',   // ✅ Icône PWA 192x192
  './pomodoro-512.png',   // ✅ Icône PWA 512x512
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
