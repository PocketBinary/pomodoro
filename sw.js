// ============================================================
// SERVICE WORKER - POMODORO PWA
// Stratégie : Network-First pour HTML (navigation) & Cache-First pour Assets
// ============================================================

const CACHE_NAME = "pomodoro-cache-v7";

// Assets essentiels pré-mis en cache à l'installation
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./script.js",
  "./break-media.js",
  "./manifest.json",
  "./pomodoro.png",
  "./pomodoro-192.png",
  "./pomodoro-512.png",
  "./fonts/archivo-latin.woff2",
  "./fonts/archivo-latin-ext.woff2",
  "./fonts/chivo-mono-latin.woff2",
  "./fonts/chivo-mono-latin-ext.woff2",
  "./media/media.json",
  "./media/ZenMan.svg",
  "./media/ZenNenuphar.svg",
  "./media/ZENWoman.svg"
];

// 1. INSTALLATION : Mise en cache immédiate des assets statiques critiques
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("[SW] Erreur pré-cache :", err);
        return self.skipWaiting();
      })
  );
});

// 2. ACTIVATION : Nettoyage immédiat des versions obsolètes du cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. FETCH
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (!url.protocol.startsWith("http")) return;

  // A. Pour les navigations (page HTML) : Network-First pour toujours avoir le dernier code, fallback cache si hors-ligne
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match("./index.html")))
    );
    return;
  }

  // B. Pour tous les assets (JS, CSS, images, SVG, sons, JSON) : CACHE-FIRST
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          (networkResponse.ok || networkResponse.type === "opaque" || networkResponse.type === "cors")
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});
