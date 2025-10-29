// Importar los scripts de Firebase (versión de compatibilidad, como se indica en la memoria del proyecto)
// Este enfoque evita la necesidad de inicializar Firebase dentro del Service Worker,
// previniendo la exposición de claves de configuración.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// NO se debe llamar a initializeApp aquí. El Service Worker hereda la configuración
// de la aplicación principal que lo registra.

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = new URL(event.notification.data.url, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            // Revisa si una ventana con la misma URL (sin query params) ya está abierta
            const baseUrl = targetUrl.split('?')[0];
            for (const client of clientList) {
                if (client.url.startsWith(baseUrl)) {
                    // Si la encontramos, envía un mensaje para que la app navegue internamente
                    // en lugar de recargar la página completa.
                    client.postMessage({
                        type: 'navigate',
                        page: new URL(targetUrl).searchParams.get('page'),
                        chatId: new URL(targetUrl).searchParams.get('chatId')
                    });
                    return client.focus();
                }
            }
            // Si no hay ventana abierta, crea una nueva.
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});

// Nota: El manejador onBackgroundMessage es opcional. Firebase maneja automáticamente
// las notificaciones "display" enviadas a través de la consola de Firebase o la API de FCM
// cuando la app está en segundo plano. Este archivo asegura que el SW se registre
// correctamente y pueda manejar los clics.
