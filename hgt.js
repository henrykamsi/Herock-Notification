// hgt.js - Herock Notification Client SDK
(function () {
  // 1. Get the App ID passed in the script tag
  const scriptTag = document.currentScript || document.querySelector('script[src*="hgt.js"]');
  const appId = scriptTag ? scriptTag.getAttribute('data-app-id') : null;

  // 2. Load required Firebase SDKs dynamically
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  Promise.all([
    loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js'),
    loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js'),
    loadScript('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js')
  ]).then(() => {
    // 3. Initialize Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyAjdPgb9Py3u7c0JEd2svzkpuYnTMfnR2k",
      authDomain: "herock-notification.firebaseapp.com",
      projectId: "herock-notification",
      messagingSenderId: "69308803783",
      appId: "1:69308803783:web:9876fed0786a65063a6ce2"
    };

    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);

    const messaging = firebase.messaging();
    const db = firebase.firestore();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          messaging.useServiceWorker(registration);
          return Notification.requestPermission();
        })
        .then((permission) => {
          if (permission === 'granted') return messaging.getToken();
        })
        .then((token) => {
          if (token) {
            const currentDomain = window.location.origin;
            const ua = navigator.userAgent;
            let browser = "Chrome";
            if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
            if (ua.includes("Firefox")) browser = "Firefox";
            if (ua.includes("Edg")) browser = "Edge";

            db.collection("subscribers").doc(token).set({
              token: token,
              appId: appId, // Links this subscriber to the specific user's app
              domain: currentDomain,
              browser: browser,
              subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
        })
        .catch((err) => console.error("Herock SDK Error:", err));
    }
  }).catch((err) => console.error("Failed to load Herock dependencies:", err));
})();
