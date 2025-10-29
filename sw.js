// Import the Firebase messaging scripts (compat version for simplicity in service workers)
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// NOTE: No Firebase initialization is needed here.
// The service worker inherits its configuration from the main app that registers it.
// This is a crucial security best practice to avoid exposing config keys.

// Set up the Firebase Messaging object
// This check is to ensure that the firebase object is available.
if (firebase.messaging.isSupported()) {
    const messaging = firebase.messaging();

    // Add an event listener for background push messages.
    // Firebase automatically handles displaying the notification if the payload is correct.
    // This is useful for customizing the notification content if needed.
    messaging.onBackgroundMessage((payload) => {
        console.log('[sw.js] Received background message ', payload);

        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon || './icons/icon-192x192.png',
            data: {
                url: payload.data.url // Pass the URL from the data payload
            }
        };

        self.registration.showNotification(notificationTitle, notificationOptions);
    });
}

// Event listener for when the user clicks on a notification.
self.addEventListener('notificationclick', (event) => {
    // Close the notification
    event.notification.close();

    // Get the target URL from the notification's data payload
    const targetUrl = event.notification.data.url;

    // Use waitUntil to ensure the browser doesn't terminate the service worker
    // before the new window/tab has been created.
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(clientList => {
            // Check if a window with the target URL is already open.
            for (const client of clientList) {
                // If a client is found, focus it.
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // If no client is found, open a new window.
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
