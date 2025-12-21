"use client";

import { useState } from "react";
import AuthCard from "../../components/ui/AuthCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: (formData.get("email") as string).trim(),
      password: formData.get("password") as string,
    };

    try {
      const res = await fetch("http://localhost:3000/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      console.log("Signup result:", result);

      if (!res.ok) {
        setError(result.message || "Signup failed.");
      } else {
        alert("Signup successful!");
      }
    } catch (err) {
      console.error(err);
      setError("Signup failed.");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthCard title="Create Account" subtitle="Join SettleUp to manage expenses easily">
          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}
          <form onSubmit={handleSignup} className="space-y-4">
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
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}