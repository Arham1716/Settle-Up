'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setMessage(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <p className="text-center mt-20 text-red-500">Invalid or missing token</p>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#064e3b] px-6">
      <div className="w-full max-w-md rounded-xl bg-[#064e3b] shadow-2xl p-8 text-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
        {message && <p className="mb-4 text-center text-red-300">{message}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-green-100 text-green-900 placeholder-green-700 border-none focus:ring-2 focus:ring-green-400"
          />
          <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-600">
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
