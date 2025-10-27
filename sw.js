// Import Firebase scripts for messaging
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyBG035jZHTgsqZKIYCHGAUshwRukSccrjU",
    authDomain: "mercadocanje-ffca0.firebaseapp.com",
    projectId: "mercadocanje-ffca0",
    storageBucket: "mercadocanje-ffca0.appspot.com",
    messagingSenderId: "1069590620221",
    appId: "1:1069590620221:web:ea68de5b49395ce42be254",
    measurementId: "G-9KEBKJ84CR"
});

const messaging = firebase.messaging();

// Handle background messages with Firebase.
// This is triggered when the app is in the background or closed.
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message from Firebase', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: './icons/icon-192x192.png', // Corrected relative path
    badge: './icons/icon-192x192.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});


// --- PWA Service Worker Logic ---
const CACHE_NAME = 'mercado-canje-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json', // Add manifest to cache
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Abriendo caché y guardando el app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: App shell cacheado exitosamente');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Falló el cacheo del app shell', err);
      })
  );
});

// Notification click event: handles what happens when a user clicks any notification.
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Clic en notificación recibido.');

  event.notification.close();

  // Default to a safe page if not specified in the notification data
  const clickAction = event.notification.data.click_action || 'page-explorar';
  const chatId = event.notification.data.chatId;

  // Construct the correct relative URL to open
  const urlToOpen = `./index.html?page=${clickAction}${chatId ? `&chatId=${chatId}` : ''}`;

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(clientList => {
      // Check if the app is already open.
      for (const client of clientList) {
        // A simple check to see if the client's URL is the main app page.
        if (client.url.includes('index.html') && 'focus' in client) {
          client.focus();
          // Send a message to the client to navigate internally
          client.postMessage({
              type: 'navigate',
              page: clickAction,
              chatId: chatId
          });
          return;
        }
      }
      // If the app is not open, open a new window to the correct URL.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Borrando caché antiguo', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        console.log('Service Worker: Reclamando clientes...');
        return self.clients.claim();
    })
  );
});

// Fetch event (Cache First strategy)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then(
          networkResponse => {
            // Do not cache Firebase's dynamic requests
            if (event.request.url.includes('firebase') || event.request.url.includes('firestore') || event.request.url.includes('gstatic')) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
               cache.put(event.request, responseToCache);
            });
            return networkResponse;
          }
        ).catch(() => {
            console.warn('Service Worker: Fetch fallido, sin conexión y sin caché para:', event.request.url);
        });
      })
  );
});
