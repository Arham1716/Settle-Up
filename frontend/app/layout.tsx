import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { FcmProvider } from "./components/FcmProvider";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Settle Up - Split. Settle. Live Easy",
  description:
    "Split expenses effortlessly with friends, roommates, and family. Track shared costs, settle debts, and manage group finances with ease.",
  generator: "v0.app",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* Mount FCM notifications globally */}
        <FcmProvider />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
