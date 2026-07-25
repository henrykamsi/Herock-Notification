// ============================================================
// HEROCK NOTIFICATION - hgt.js
// ============================================================

(function() {
    'use strict';
    
    let appId = null;
    let userId = null;
    
    // Get config from script tag
    const scripts = document.getElementsByTagName('script');
    for (let script of scripts) {
        if (script.src && script.src.includes('hgt.js')) {
            appId = script.getAttribute('data-app-id');
            userId = script.getAttribute('data-user-id');
            break;
        }
    }
    
    if (!appId || !userId) {
        console.error('❌ Herock: Missing data-app-id or data-user-id');
        return;
    }
    
    console.log('✅ Herock: App ID:', appId);
    console.log('✅ Herock: User ID:', userId);
    
    // Check for service worker support
    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Workers not supported');
        return;
    }
    
    // Register service worker
    navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
            console.log('✅ SW registered!');
            
            // Check permission
            if (Notification.permission === 'granted') {
                subscribe(registration);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(function(permission) {
                    if (permission === 'granted') {
                        subscribe(registration);
                    }
                });
            }
        })
        .catch(function(err) {
            console.error('❌ SW registration failed:', err);
        });
    
    function subscribe(registration) {
        const vapidKey = 'BLXamEd4_CJnbp1OXVCL_YDJa7Sv_QxtZ2nHs98DIINAKkIO3ECkS2p79HANYSaJ7DI_Fc7pUkmRKSqCh1VtCJI';
        
        registration.pushManager.getSubscription()
            .then(function(subscription) {
                if (subscription) {
                    console.log('✅ Already subscribed');
                    saveToken(subscription);
                    return;
                }
                
                return registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey)
                })
                .then(function(subscription) {
                    console.log('✅ Subscribed!');
                    saveToken(subscription);
                })
                .catch(function(err) {
                    console.error('❌ Subscribe failed:', err);
                });
            });
    }
    
    function saveToken(subscription) {
        const token = subscription.endpoint.split('/').pop();
        console.log('📋 Token:', token);
        
        // Try to save to Firestore
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                const db = firebase.firestore();
                db.collection('subscribers').add({
                    appId: appId,
                    userId: userId,
                    fcmToken: token,
                    active: true,
                    subscribedAt: new Date().toISOString()
                }).then(function() {
                    console.log('✅ Token saved to Firestore!');
                }).catch(function(err) {
                    console.error('❌ Save failed:', err);
                });
            } catch(e) {
                console.error('❌ Firestore error:', e);
            }
        }
    }
    
    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
    
    console.log('🚀 Herock loaded!');
})();
