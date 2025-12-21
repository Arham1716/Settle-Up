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

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: (formData.get("email") as string).trim(),
          password: formData.get("password") as string,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login failed");
      } else {
        alert("Login successful");
        localStorage.setItem("token", result.access_token);
        router.replace("/dashboard");
      }
    } catch (err) {
      setError("Login failed");
      console.error(err);
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
            <div className="space-y-2">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}