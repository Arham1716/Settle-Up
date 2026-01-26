'use client';

import { useState } from 'react';
import AuthCard from '@/components/ui/AuthCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const email = (new FormData(e.currentTarget).get('email') as string).trim();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      setMessage('If this email is registered, a reset link has been sent.');
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-6"
      style={{
        background:
          'radial-gradient(circle at top right, #064e3b 0%, #022c22 60%)',
      }}
    >
      {/* LOGO */}
      <div className="absolute top-6 right-8">
        <img src="/logo.png" alt="Settle-Up Logo" className="h-14 w-auto opacity-90" />
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-xl bg-[#064e3b] shadow-2xl">
          <AuthCard
            title="Reset Password"
            className="bg-transparent border-none text-white p-8"
          >
            {message ? (
              <p className="text-center text-green-200">{message}</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-center text-sm text-red-300">{error}</p>
                )}

                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-green-100 text-green-900 placeholder-green-700 border-none focus:ring-2 focus:ring-green-400"
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-700 hover:bg-green-600"
                >
                  {loading ? 'Sending link...' : 'Send reset link'}
                </Button>
              </form>
            )}
          </AuthCard>
        </div>
      </div>
    </div>
  );
}
