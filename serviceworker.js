<!-- Add this directly before </head> on your test website or index.html -->
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js"></script>

<script>
  // 1. Initialize Firebase on the target site
  const firebaseConfig = {
      apiKey: "AIzaSyAjdPgb9Py3u7c0JEd2svzkpuYnTMfnR2k",
      authDomain: "herock-notification.firebaseapp.com",
      projectId: "herock-notification",
      messagingSenderId: "69308803783",
      appId: "1:69308803783:web:9876fed0786a65063a6ce2"
  };

  if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
  }

  const messaging = firebase.messaging();

  // 2. Request Notification Permission and register Service Worker
  navigator.serviceWorker.register('/sw.js').then((registration) => {
      messaging.useServiceWorker(registration);

      // Request user permission
      Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
              console.log('Notification permission granted.');
              
              // Get FCM device registration token
              messaging.getToken().then((currentToken) => {
                  if (currentToken) {
                      console.log('Device Push Token:', currentToken);
                      // Send this token to your Herock Firestore database under tokens
                  } else {
                      console.log('No registration token available.');
                  }
              }).catch((err) => {
                  console.error('An error occurred while retrieving token: ', err);
              });
          } else {
              console.warn('Notification permission denied by user.');
          }
      });
  }).catch((err) => {
      console.error('Service Worker registration failed:', err);
  });
</script>
