const CACHE_NAME = 'mercado-canje-cache-v1';
const urlsToCache = [
  '.',
  'index.html',
  // No hay un archivo CSS o JS separado, todo está en index.html
  // Agregaremos los iconos al caché para que se muestren offline
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Evento de instalación: se dispara cuando el SW se instala por primera vez.
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
        return self.skipWaiting(); // Forzar al SW a activarse inmediatamente
      })
      .catch(err => {
        console.error('Service Worker: Falló el cacheo del app shell', err);
      })
  );
});

// Evento de activación: se dispara después de la instalación.
// Aquí se pueden limpiar cachés antiguos.
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
        return self.clients.claim(); // Tomar control de las páginas abiertas
    })
  );
});

// Evento fetch: intercepta todas las peticiones de red.
self.addEventListener('fetch', event => {
  // Solo interceptamos peticiones GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Estrategia: Cache First (para el app shell)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si la respuesta está en el caché, la retornamos
        if (cachedResponse) {
          // console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return cachedResponse;
        }

        // Si no está en caché, vamos a la red
        return fetch(event.request).then(
          networkResponse => {
            // No cacheamos las peticiones a Firebase para mantener los datos actualizados
            if (event.request.url.includes('firebase') || event.request.url.includes('firestore') || event.request.url.includes('gstatic')) {
              return networkResponse;
            }

            // Para otras peticiones, las clonamos y las guardamos en caché para futuras visitas
            // Esto no es ideal para una PWA compleja, pero funciona para assets estáticos
            return caches.open(CACHE_NAME).then(cache => {
               // console.log('Service Worker: Cacheando nuevo recurso:', event.request.url);
               cache.put(event.request, networkResponse.clone());
               return networkResponse;
            });
          }
        ).catch(() => {
            // Si la red falla y no hay nada en caché, podríamos mostrar una página offline genérica
            // Por ahora, simplemente dejamos que el navegador maneje el error de red.
            console.warn('Service Worker: Fetch fallido, sin conexión y sin caché para:', event.request.url);
        });
      })
  );
});
