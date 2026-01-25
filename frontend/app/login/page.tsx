'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthCard from '../../components/ui/AuthCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteToken, setInviteToken] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('inviteToken');
    if (token) setInviteToken(token);
  }, []);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim();
    const password = (formData.get('password') as string).trim();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'Login failed');
        return;
      }

      const meRes = await fetch(`${apiUrl}/auth/me`, { credentials: 'include' });
      if (!meRes.ok) {
        setError('Login succeeded but session was not established');
        return;
      }

      router.replace(inviteToken ? `/invite/${inviteToken}/precheck` : '/dashboard');
    } catch (err) {
      console.error(err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT SIDE — White background + Dark Green AuthCard */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">
          <AuthCard
            title="Login"
            className="text-white p-8"
            style={{ backgroundColor: '#064e3b' }}
          >
            {error && (
              <p className="mb-4 text-center text-sm text-destructive">{error}</p>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                required
                className="bg-green-100 text-green-900 placeholder-green-700 border-none focus:ring-2 focus:ring-green-400"
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="bg-green-100 text-green-900 placeholder-green-700 border-none focus:ring-2 focus:ring-green-400"
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-600"
                size="lg"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </Button>

              <p className="mt-4 text-center text-sm text-white/70">
                Do not have an account?{' '}
                <button
                  type="button"
                  onClick={() =>
                    router.replace(
                      `/signup${inviteToken ? `?inviteToken=${inviteToken}` : ''}`
                    )
                  }
                  className="text-green-400 hover:text-green-300 underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </form>
          </AuthCard>
        </div>
      </div>

      {/* RIGHT SIDE — Green Gradient + Branding Text */}
      <div
        className="flex-1 relative flex flex-col items-center justify-center text-center px-8 text-white"
        style={{
          background:
            'radial-gradient(circle at top left, #064e3b 100%)',
        }}
      >
        {/* Logo at Top Right */}
        <div className="absolute top-6 right-8">
          <img src="/logo.png" alt="Settle-Up Logo" className="h-16 w-auto" />
        </div>

        {/* Centered Title and Subtitle */}
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to SettleUp</h1>
          <p className="text-xl text-white/80 max-w-md">
            Log back in to view your expenses
          </p>
        </div>
      </div>
    </div>
  );
}
