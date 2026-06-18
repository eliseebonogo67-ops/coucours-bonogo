// Changer v3 → v4 force tous les utilisateurs
// à télécharger la nouvelle version
var CACHE_NAME = 'bonogo-v4';
var urlsToCache = [
  '/coucours-bonogo/',
  '/coucours-bonogo/index.html',
  '/coucours-bonogo/style.css',
  '/coucours-bonogo/script.js',
  '/coucours-bonogo/icon-192.png',
  '/coucours-bonogo/icon-512.png'
];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) {
          return k !== CACHE_NAME;
        }).map(function(k) {
          return caches.delete(k);
        })
      );
    })
  );
  return self.clients.claim();
});

// Stratégie : réseau en priorité,
// cache en fallback si hors ligne
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // Si succès réseau, mettre en cache
        // ET retourner la réponse fraîche
        var responseClone = response.clone();
        caches.open(CACHE_NAME)
          .then(function(cache) {
            cache.put(e.request, responseClone);
          });
        return response;
      })
      .catch(function() {
        // Hors ligne : utiliser le cache
        return caches.match(e.request)
          .then(function(cached) {
            return cached
              || caches.match(
                '/coucours-bonogo/index.html');
          });
      })
  );
});

// Écouter les notifications push
self.addEventListener('push', function(e) {
  var data = {};
  try {
    data = e.data ? e.data.json() : {};
  } catch(err) {
    data = {
      title:   'Concours Blanc Bonogo',
      body:    e.data ? e.data.text() : ''
    };
  }
  e.waitUntil(
    self.registration.showNotification(
      data.title || 'Concours Blanc Bonogo', {
      body:    data.body || '',
      icon:    '/coucours-bonogo/icon-192.png',
      badge:   '/coucours-bonogo/icon-192.png',
      vibrate: [200, 100, 200],
      tag:     'bonogo-notif'
    })
  );
});
