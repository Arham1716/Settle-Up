"use client";

import { useEffect } from "react";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";
import { firebaseApp } from "../lib/firebase";

export function useFcmNotifications() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const messaging = getMessaging(firebaseApp);

    // Register service worker & get FCM token
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(async (registration) => {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Get FCM device token
        const fcmToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
          serviceWorkerRegistration: registration,
        });

        if (!fcmToken) return;
        console.log("FCM Device Token:", fcmToken);

        // Send FCM token to backend (cookie-based JWT auth)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/device-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // <-- automatically send JWT cookie
          body: JSON.stringify({ token: fcmToken, platform: "web" }),
        });
      })
      .catch(console.error);

    // Foreground messages (active tab)
    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      console.log("Foreground FCM message received:", payload);

      const title = payload.notification?.title ?? "Notification";
      const body = payload.notification?.body ?? "";

      if (Notification.permission === "granted") {
        // Show native system notification
        new Notification(title, { body, icon: "/icon.png" });
      }
    });

    return () => unsubscribe();
  }, []);
}
