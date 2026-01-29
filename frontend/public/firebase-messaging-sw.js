importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Initialize Firebase inside the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAs398C7kw6VNZ10cGmEfkrTPn7_Ka2HbY",
  authDomain: "settle-up-e996b.firebaseapp.com",
  projectId: "settle-up-e996b",
  storageBucket: "settle-up-e996b.firebasestorage.app",
  messagingSenderId: "88331472268",
  appId: "1:88331472268:web:30dbb00fc347e5be1edaa9",
  measurementId: "G-06FVV1SMWK"
});

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Optional: Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // optional
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
