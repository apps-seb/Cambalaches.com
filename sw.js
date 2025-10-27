// Importar los scripts de Firebase.
// Firebase detectará automáticamente el Service Worker y lo inicializará
// usando la configuración del 'firebase-messaging-sw.js' virtual que gestiona en segundo plano.
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// NOTA: No es necesario volver a definir 'firebaseConfig' ni llamar a 'initializeApp'.
// El Service Worker se asocia con la configuración de la app principal
// cuando Firebase Messaging lo registra.

// Firebase Messaging buscará una configuración aquí usando firebase.messaging().
// Si no la encuentra, usará la de la app principal.
// Este es el comportamiento deseado para no duplicar credenciales.
firebase.messaging();

self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push Recibido.');
    console.log(`[Service Worker] Datos del Push: "${event.data.text()}"`);

    const notificationData = event.data.json();
    const title = notificationData.notification.title || 'Nueva Notificación';
    const options = {
        body: notificationData.notification.body || 'Has recibido una nueva actualización.',
        icon: notificationData.notification.icon || './icons/icon-192x192.png',
        badge: './icons/badge-72x72.png',
        data: {
            url: notificationData.fcmOptions.link // El link para abrir al hacer clic
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Clic en notificación recibido.');

    event.notification.close();

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((clientList) => {
            // Si hay una ventana de la app abierta, la enfoca.
            for (const client of clientList) {
                // Comprueba si el cliente puede ser enfocado y si la URL ya es la correcta.
                // Si no, navega a la URL correcta.
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no hay ninguna ventana abierta, abre una nueva.
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
