"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlossyButton } from "@/components/ui/glossy-button";
import { SectionHeader } from "@/components/ui/section-header";
import { ArrowLeft } from "lucide-react";

export default function ContactSupportPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/settings/support/contact", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send support request");

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/settings");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_rgba(34,197,94,0.3)_0%,_rgba(34,197,94,0.1)_30%,_transparent_70%)]" />
      <div className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_top_right,_rgba(34,197,94,0.15)_0%,_transparent_60%)]" />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
        <GlossyButton
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </GlossyButton>

        <SectionHeader className="mb-6">
          <h1>Contact Support</h1>
          <p>Send us a message and we'll get back to you</p>
        </SectionHeader>

        {success ? (
          <div className="bg-green-600/20 border border-green-600 rounded-lg p-6 text-center">
            <p className="text-green-400 font-medium">Support request sent successfully!</p>
            <p className="text-white/60 text-sm mt-2">Redirecting...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-black/40 rounded-lg p-6 space-y-4">
            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={8}
                maxLength={2000}
                className="w-full rounded-md bg-black/40 px-3 py-2 text-white outline-none resize-none"
              />
              <p className="text-white/60 text-xs mt-1">{message.length}/2000</p>
            </div>

            <GlossyButton type="submit" disabled={submitting} className="w-full">
              {submitting ? "Sending..." : "Send Message"}
            </GlossyButton>
          </form>
        )}
      </div>
    </section>
  );
}

