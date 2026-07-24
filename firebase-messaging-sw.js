// ============================================================================
// HEROCK NOTIFICATION SERVICE WORKER (sw.js)
// Real-time Push Listener, URL Tracker & Auto-Permission Handler
// ============================================================================

// 1. Load Firebase Compatibility SDKs for Service Workers
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 2. Initialize Firebase inside the Service Worker
const firebaseConfig = {
    apiKey: "AIzaSyAjdPgb9Py3u7c0JEd2svzkpuYnTMfnR2k",
    authDomain: "herock-notification.firebaseapp.com",
    projectId: "herock-notification",
    storageBucket: "herock-notification.firebasestorage.app",
    messagingSenderId: "69308803783",
    appId: "1:69308803783:web:9876fed0786a65063a6ce2"
};

// Initialize app instance
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 3. Service Worker Lifecycle Events
self.addEventListener('install', (event) => {
    // Force immediate activation when updated
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Claim active clients immediately
    event.waitUntil(clients.claim());
});

// 4. Background Message Listener (Fires when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
    // Extract Notification Details
    const title = payload.notification?.title || "Herock Notification";
    const body = payload.notification?.body || "You have a new update.";
    
    // Fallback images if custom images aren't passed
    const icon = payload.notification?.icon || "https://placehold.co/192x192/2563eb/ffffff.png?text=HGT";
    const image = payload.notification?.image || payload.data?.image || null;
    const targetUrl = payload.data?.click_action || payload.fcmOptions?.link || self.location.origin;

    const notificationOptions = {
        body: body,
        icon: icon,
        image: image,
        badge: icon,
        vibrate: [200, 100, 200],
        tag: 'herock-push-tag',
        renotify: true,
        requireInteraction: true, // Holds notification on Android/Desktop until user acts
        data: {
            url: targetUrl,
            timestamp: Date.now()
        },
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    return self.registration.showNotification(title, notificationOptions);
});

// 5. Generic Raw Web Push Listener (Backup for raw payload dispatch)
self.addEventListener('push', (event) => {
    if (event.data) {
        try {
            const data = event.data.json();
            const title = data.title || "Herock Notification [hgt.]";
            const options = {
                body: data.body || data.desc || "New message received",
                icon: data.icon || "https://placehold.co/192x192/2563eb/ffffff.png?text=HGT",
                data: { url: data.url || self.location.origin }
            };
            event.waitUntil(self.registration.showNotification(title, options));
        } catch (e) {
            // Raw text fallback
            const text = event.data.text();
            event.waitUntil(
                self.registration.showNotification("Herock Notification", {
                    body: text,
                    data: { url: self.location.origin }
                })
            );
        }
    }
});

// 6. Handle Notification Clicks (Opens or focuses target URL)
self.addEventListener('notificationclick', (event) => {
    event.notification.close(); // Dismiss visual popup

    if (event.action === 'dismiss') return;

    const targetUrl = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if window is already open
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === targetUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not open, open new window/tab
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
