"use client";

import { useEffect } from "react";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";
import { firebaseApp } from "../../lib/firebase";

export function useFcmNotifications() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const messaging = getMessaging(firebaseApp);
console.log("Registering service worker...");
navigator.serviceWorker.register("/firebase-messaging-sw.js")
  .then(async (registration) => {
    console.log("Service Worker registered:", registration.scope);

    const permission = await Notification.requestPermission();
    console.log("Notification permission:", permission);
    if (permission !== "granted") return;

    const fcmToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      serviceWorkerRegistration: registration,
    });
    console.log("FCM token retrieved:", fcmToken);

    if (!fcmToken) {
      console.error("No FCM token returned. Check VAPID key & Firebase config.");
      return;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/device-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: fcmToken, platform: "web" }),
    });
    console.log("Device token POST response:", res.status, await res.text());
  })
  .catch(err => console.error("Service Worker registration failed:", err));

    // Foreground messages (active tab)
   const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
  console.log("Foreground message received:", payload);

  if (!payload.notification) {
    console.warn("No notification payload in message:", payload);
    return;
  }

  const title = payload.notification?.title || payload.data?.title || 'FCM Notification';
  const body = payload.notification?.body || payload.data?.body || 'You have a new activity';

  if (Notification.permission === "granted") {
    console.log(`Displaying system notification: ${title} - ${body}`);
    new Notification(title, { body, icon: "/logo.png" });
  } else {
    console.warn("Notification permission not granted.");
  }
});

    return () => unsubscribe();
  }, []);
}
