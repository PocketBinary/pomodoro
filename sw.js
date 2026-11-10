/**
 * ============================================================================
 * SERVICE WORKER - APPLICATION POMODORO PWA (sw.js)
 * ============================================================================
 * 
 * Ce script s'exécute en arrière-plan pour assurer le fonctionnement hors-ligne
 * complet et la mise en cache ultra-rapide de l'application.
 * 
 * Stratégie de mise en cache :
 * - Navigation HTML (index.html, requêtes de page) : NETWORK-FIRST avec secours CACHE
 *   Permet d'afficher toujours la version la plus fraîche quand le réseau est disponible,
 *   tout en garantissant l'accès immédiat hors-ligne si la connexion est coupée.
 * 
 * - Assets statiques (CSS, JavaScript, Polices WOFF2, Médias SVG/MP3, Icônes) : CACHE-FIRST
 *   Sert instantanément les fichiers depuis le cache local pour des performances maximales
 *   et met à jour le cache en arrière-plan si le réseau répond.
 * ============================================================================
 */

// Nom et version du cache (à incrémenter lors de chaque mise à jour majeure)
const CACHE_NAME = "pomodoro-cache-v8";

// Liste des ressources essentielles pré-chargées dès l'installation du Service Worker
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/break-media.js",
  "./manifest.json",
  "./icons/pomodoro.png",
  "./icons/pomodoro-192.png",
  "./icons/pomodoro-512.png",
  "./pomodoro.png",
  "./fonts/archivo-latin.woff2",
  "./fonts/archivo-latin-ext.woff2",
  "./fonts/chivo-mono-latin.woff2",
  "./fonts/chivo-mono-latin-ext.woff2",
  "./media/media.json",
  "./media/Zen Ying-Yang.svg",
  "./media/ZenMan.svg",
  "./media/ZenNenuphar.svg",
  "./media/ZENWoman.svg"
];

// ============================================================================
// 1. ÉVÉNEMENT 'INSTALL' : Téléchargement et mise en cache immédiate des assets
// ============================================================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // Pré-chargement des ressources critiques
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Force l'activation immédiate sans attendre la fermeture des autres onglets
        return self.skipWaiting();
      })
      .catch((error) => {
        console.warn("Échec partiel de pré-cache lors de l'installation du SW :", error);
      })
  );
});

// ============================================================================
// 2. ÉVÉNEMENT 'ACTIVATE' : Nettoyage automatique des anciens caches obsolètes
// ============================================================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Suppression des caches dont le nom ne correspond pas à la version courante
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Prend immédiatement le contrôle de toutes les pages ouvertes
        return self.clients.claim();
      })
  );
});

// ============================================================================
// 3. ÉVÉNEMENT 'FETCH' : Interception des requêtes réseau & distribution du cache
// ============================================================================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // On ignore les requêtes non-GET (ex: POST, PUT) ou les schémas non-HTTP(S)
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  // A. Navigation HTML principale : Stratégie Network-First
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          // Si le réseau échoue (hors-ligne), on renvoie index.html depuis le cache
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match("./index.html");
        })
    );
    return;
  }

  // B. Ressources statiques (CSS, JS, Polices, Images, Médias) : Stratégie Cache-First
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // La ressource est en cache : on la sert immédiatement.
        // On tente discrètement un rafraîchissement réseau en arrière-plan (stale-while-revalidate)
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {
            // Erreur réseau normale en mode hors-ligne, ignorée silencieusement
          });
        return cachedResponse;
      }

      // Si la ressource n'est pas encore en cache, on la télécharge et on l'y enregistre
      return fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return networkResponse;
      });
    })
  );
});
