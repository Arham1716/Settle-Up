// app/components/FcmProvider.tsx
"use client";

import { useFcmNotifications } from "../hooks/useFcmNotifications";

export function FcmProvider() {
  useFcmNotifications();
  return null; // this component just runs the hook
}