"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "../../components/ui/AuthCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectAfterLogin = (inviteToken?: string) => {
    if (inviteToken) {
      setTimeout(() => {
        router.replace(`/invite/${inviteToken}`);
      }, 50);
    } else {
      router.replace("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim();
    const password = (formData.get("password") as string).trim();

    try {
      // ✅ Signup request with credentials
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for cookie handling
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Signup failed");
        return;
      }

      // Auto-login after signup
      const loginRes = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const loginData = await loginRes.json();
        setError(loginData.message || "Login after signup failed");
        return;
      }

      const inviteToken = new URLSearchParams(window.location.search).get("inviteToken") ?? undefined;
      redirectAfterLogin(inviteToken);
    } catch (err) {
      console.error(err);
      setError("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthCard title="Create Account">
          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.replace(`/login${window.location.search}`)}
                className="text-primary hover:underline"
              >
                Log in
              </button>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
