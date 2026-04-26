// ============================================
// CONCOURS BLANC BONOGO - SERVICE WORKER PWA
// ============================================

var CACHE_NAME = 'bonogo-v1';
var FICHIERS_A_CACHER = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js'
];

// === INSTALLATION : mise en cache des fichiers ===
self.addEventListener('install', function(event) {
    console.log('[SW] Installation...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('[SW] Mise en cache des fichiers');
            return cache.addAll(FICHIERS_A_CACHER).catch(function(err) {
                console.warn('[SW] Certains fichiers non cachés :', err);
            });
        })
    );
    self.skipWaiting();
});

// === ACTIVATION : nettoyage des anciens caches ===
self.addEventListener('activate', function(event) {
    console.log('[SW] Activation...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(name) {
                    if (name !== CACHE_NAME) {
                        console.log('[SW] Suppression ancien cache :', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// === FETCH : stratégie Network First (Firebase en ligne prioritaire) ===
self.addEventListener('fetch', function(event) {
    var url = event.request.url;

    // Firebase et APIs : toujours en ligne, pas de cache
    if (url.includes('firebaseio.com') ||
        url.includes('googleapis.com/identitytoolkit') ||
        url.includes('securetoken.google.com')) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Fonts Google : cache first
    if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        event.respondWith(
            caches.match(event.request).then(function(cached) {
                return cached || fetch(event.request).then(function(response) {
                    return caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            })
        );
        return;
    }

    // Tout le reste : Network First, fallback cache
    event.respondWith(
        fetch(event.request).then(function(response) {
            // Mettre en cache la réponse fraîche
            if (response && response.status === 200 && event.request.method === 'GET') {
                var responseClone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        }).catch(function() {
            // Pas de réseau : utiliser le cache
            return caches.match(event.request).then(function(cached) {
                if (cached) return cached;
                // Page offline de secours si index.html non trouvé
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

// === MESSAGE : forcer la mise à jour ===
self.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
                          
