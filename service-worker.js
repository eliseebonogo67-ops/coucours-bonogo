var CACHE_NAME = 'bonogo-v3';
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
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request).catch(function() {
        return caches.match('/coucours-bonogo/index.html');
      });
    })
  );
});
