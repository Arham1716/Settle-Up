"use client";

import { useEffect } from "react";
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FAQSection } from "@/components/landing/faq-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then(async (registration) => {
          console.log("Service Worker registered with scope:", registration.scope);

          // Request permission to send notifications
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            try {
              const token = await getToken(messaging, {
                vapidKey: "YOUR_VAPID_KEY", // get this from Firebase Console
                serviceWorkerRegistration: registration,
              });
              console.log("FCM Device Token:", token);

              // TODO: send this token to your backend API to save in DB
              // await fetch("/api/save-device-token", { method: "POST", body: JSON.stringify({ token }) });

            } catch (err) {
              console.error("Error getting FCM token:", err);
            }
          } else {
            console.log("Notification permission denied");
          }
        })
        .catch((err) => console.error("Service Worker registration failed:", err));
    }

    // Listen to foreground messages (when app is open)
    onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);
      // You can show a custom in-app notification here
      alert(`Notification: ${payload.notification?.title} - ${payload.notification?.body}`);
    });
  }, []);

  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      <FAQSection />
      <Footer />
    </main>
  );
}
