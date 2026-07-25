// ============================================================
// HEROCK SERVICE WORKER - sw.js
// ============================================================

// Install event
self.addEventListener('install', function(event) {
    console.log('✅ SW: Installing...');
    self.skipWaiting();
});

// Activate event - take control immediately
self.addEventListener('activate', function(event) {
    console.log('✅ SW: Activating...');
    event.waitUntil(self.clients.claim());
});

// ============================================================
// PUSH NOTIFICATION RECEIVED
// ============================================================
self.addEventListener('push', function(event) {
    console.log('📨 SW: Push received');
    
    let title = 'Herock Notification';
    let body = 'You have a new notification';
    let icon = 'https://henrykamsi.github.io/Herock-Notification/icon-192.png';
    let url = '/';
    
    try {
        if (event.data) {
            const data = event.data.json();
            title = data.title || title;
            body = data.body || body;
            icon = data.icon || icon;
            url = data.url || url;
        }
    } catch(e) {
        console.log('⚠️ Could not parse push data');
    }
    
    event.waitUntil(
        self.registration.showNotification(title, {
            body: body,
            icon: icon,
            vibrate: [200, 100, 200],
            data: { url: url }
        })
    );
});

// ============================================================
// NOTIFICATION CLICKED
// ============================================================
self.addEventListener('notificationclick', function(event) {
    console.log('📨 SW: Notification clicked');
    event.notification.close();
    
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(clientList) {
            for (let client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            return clients.openWindow(url);
        })
    );
});

console.log('🚀 Service Worker loaded!');
