"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CreateGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3000/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || "Failed to create group");
      } else {
        router.push("/dashboard/groups/all");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold text-white">Create Group</h1>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleCreateGroup} className="space-y-4">
        <Input name="name" placeholder="Group name" required />
        <Input name="description" placeholder="Description (optional)" />
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Group"}
        </Button>
      </form>
    </div>
  );
}
