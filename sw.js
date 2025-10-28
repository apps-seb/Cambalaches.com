// Importar los scripts de Firebase (versión de compatibilidad, como se indica en la memoria del proyecto)
// Este enfoque evita la necesidad de inicializar Firebase dentro del Service Worker,
// previniendo la exposición de claves de configuración.
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// NO se debe llamar a initializeApp aquí. El Service Worker hereda la configuración
// de la aplicación principal que lo registra.

// Manejador para los clics en las notificaciones.
// Abre la URL asociada a la notificación o enfoca la pestaña si ya está abierta.
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Obtener la URL del campo 'data' de la notificación, con un fallback a la raíz.
    const targetUrl = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Si hay una ventana abierta con la URL de destino, la enfoca.
            for (const client of clientList) {
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // Si no hay una ventana abierta, la crea.
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
