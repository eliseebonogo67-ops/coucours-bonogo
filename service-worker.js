// ============================================
// SERVICE WORKER — CONCOURS BLANC BONOGO
// Rôle : Cache l'app pour fonctionner
// hors-ligne et accélérer le chargement
// ============================================

var CACHE_NOM     = 'bonogo-cache-v3';
var CACHE_FICHIERS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon-192.png'
];

// === INSTALLATION ===
// Se déclenche quand le SW est installé
// pour la première fois
// Il met en cache tous les fichiers
// de l'application
self.addEventListener('install', function(e) {
    console.log('[SW] Installation...');
    e.waitUntil(
        caches.open(CACHE_NOM)
            .then(function(cache) {
                console.log(
                    '[SW] Mise en cache des fichiers');
                return cache.addAll(
                    CACHE_FICHIERS);
            })
            .then(function() {
                // Activer immédiatement
                // sans attendre
                return self.skipWaiting();
            })
            .catch(function(err) {
                console.log(
                    '[SW] Erreur cache:', err);
            })
    );
});

// === ACTIVATION ===
// Se déclenche après l'installation
// Supprime les anciens caches
// pour libérer de la mémoire
self.addEventListener('activate', function(e) {
    console.log('[SW] Activation...');
    e.waitUntil(
        caches.keys().then(function(cles) {
            return Promise.all(
                cles.map(function(cle) {
                    // Supprimer les anciens
                    // caches (versions précédentes)
                    if (cle !== CACHE_NOM) {
                        console.log(
                            '[SW] Suppression '
                            + 'ancien cache:', cle);
                        return caches.delete(cle);
                    }
                })
            );
        }).then(function() {
            // Prendre le contrôle
            // de toutes les pages
            // immédiatement
            return self.clients.claim();
        })
    );
});

// === INTERCEPTION DES REQUÊTES ===
// Se déclenche à chaque chargement
// de fichier par l'app
// Stratégie : Cache d'abord (offline first)
// Si le fichier est dans le cache → le servir
// Sinon → aller chercher sur internet
// et mettre en cache pour la prochaine fois
self.addEventListener('fetch', function(e) {

    // Ignorer les requêtes Firebase
    // (toujours en ligne pour Firebase)
    if (e.request.url.indexOf(
        'firebaseio.com') !== -1
        || e.request.url.indexOf(
        'firebase.googleapis.com') !== -1
        || e.request.url.indexOf(
        'gstatic.com') !== -1) {
        return;
    }

    // Ignorer les requêtes non-GET
    if (e.request.method !== 'GET') return;

    e.respondWith(
        caches.match(e.request)
            .then(function(reponseCache) {

            // Si trouvé dans le cache
            // → servir depuis le cache
            // (fonctionne hors-ligne)
            if (reponseCache) {
                return reponseCache;
            }

            // Sinon → aller sur internet
            return fetch(e.request)
                .then(function(reponseReseau) {

                // Vérifier que la réponse
                // est valide
                if (!reponseReseau
                    || reponseReseau.status !== 200
                    || reponseReseau.type
                    === 'opaque') {
                    return reponseReseau;
                }

                // Cloner la réponse
                // (on peut la lire qu'une fois)
                var reponseClone =
                    reponseReseau.clone();

                // Mettre en cache
                // pour la prochaine fois
                caches.open(CACHE_NOM)
                    .then(function(cache) {
                    cache.put(
                        e.request,
                        reponseClone);
                });

                return reponseReseau;
            })
            .catch(function() {
                // Hors-ligne et pas dans
                // le cache → retourner
                // la page principale
                return caches.match(
                    './index.html');
            });
        })
    );
});

// === NOTIFICATIONS PUSH ===
// Reçoit les notifications même
// quand l'app est fermée
self.addEventListener('push', function(e) {
    var data = {};
    try {
        data = e.data ? e.data.json() : {};
    } catch(err) {
        data = {
            title: 'Concours Blanc Bonogo',
            body:  e.data
                ? e.data.text()
                : 'Nouvelle notification'
        };
    }

    var options = {
        body:    data.body
            || 'Notification Bonogo',
        icon:    './icon-192.png',
        badge:   './icon-192.png',
        vibrate: [200, 100, 200],
        data:    { url: './' },
        actions: [
            {
                action: 'ouvrir',
                title:  'Ouvrir l\'app'
            },
            {
                action: 'fermer',
                title:  'Fermer'
            }
        ]
    };

    e.waitUntil(
        self.registration.showNotification(
            data.title
            || 'Concours Blanc Bonogo',
            options
        )
    );
});

// === CLIC SUR NOTIFICATION ===
// Ouvre l'app quand on clique
// sur la notification
self.addEventListener(
    'notificationclick', function(e) {
    e.notification.close();

    if (e.action === 'fermer') return;

    e.waitUntil(
        clients.matchAll({
            type:          'window',
            includeUncontrolled: true
        }).then(function(clientList) {
            // Si l'app est déjà ouverte
            // → la mettre au premier plan
            for (var i = 0;
                i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url.indexOf(
                    'index.html') !== -1
                    && 'focus' in client) {
                    return client.focus();
                }
            }
            // Sinon → ouvrir une nouvelle
            // fenêtre
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});

// ============================================
// FIN SERVICE WORKER ✅
// ============================================
