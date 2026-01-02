"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthCard from "../../components/ui/AuthCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const redirectAfterLogin = (inviteToken?: string) => {
    if (inviteToken) {
      // Slight delay to ensure cookie is usable on invite page
      setTimeout(() => {
        router.replace(`/invite/${inviteToken}`);
      }, 50);
    } else {
      router.replace("/dashboard");
    }
  };

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = (formData.get("password") as string).trim();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important: send/receive cookies
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("LOGIN RESPONSE STATUS:", response.status);
      console.log("LOGIN RESPONSE BODY:", result);
      console.log("LOGIN RESPONSE HEADERS:", response.headers.get("set-cookie"));

      if (!response.ok) {
        setError(result.message || "Login failed");
        return;
      }

      // Wait a bit longer to ensure cookie is set before redirect
      const inviteToken = new URLSearchParams(window.location.search).get("inviteToken") ?? undefined;
      if (inviteToken) {
        // Give more time for cookie to be available
        setTimeout(() => {
          router.replace(`/invite/${inviteToken}`);
        }, 100);
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthCard title="Login">
          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Logging in..." : "Log In"}
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Do not have an account?{" "}
              <Link
                href={`/signup${window.location.search}`}
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
