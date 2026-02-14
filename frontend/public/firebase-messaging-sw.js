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

// Handle background messages (data-only)
messaging.onBackgroundMessage(payload => {
  console.log('[SW] Background message received:', payload);

  const title = payload.data?.title || 'FCM Notification';
  const body = payload.data?.body || 'You have a new activity';
  const icon = '/logo.png';

  self.registration.showNotification(title, { body, icon, data: payload.data });
});

self.addEventListener("notificationclick", event => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(clients.openWindow(url));
});
