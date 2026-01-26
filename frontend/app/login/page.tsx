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
  <div
    className="min-h-screen relative flex items-center justify-center px-6"
    style={{
      background:
        'radial-gradient(circle at top right, #064e3b 0%, #022c22 60%)',
    }}
  >
    {/* LOGO — TOP RIGHT CORNER */}
    <div className="absolute top-6 right-8 z-10">
      <img
        src="/logo.png"
        alt="Settle-Up Logo"
        className="h-14 w-auto opacity-90"
      />
    </div>

    <div className="flex w-full max-w-6xl items-center">
      {/* LEFT — Login Card */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md">
          {/* Card wrapper */}
          <div className="rounded-xl bg-[#064e3b] shadow-2xl">
            <AuthCard
              title="Log In"
              className="bg-transparent border-none text-white p-8"
            >
              {error && (
                <p className="mb-4 text-center text-sm text-red-300">
                  {error}
                </p>
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
                        `/signup${
                          inviteToken ? `?inviteToken=${inviteToken}` : ''
                        }`
                      )
                    }
                    className="text-green-300 hover:text-green-200 underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
                <p className="mt-2 text-center text-sm text-white/70">
                
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-green-300 hover:text-green-200 underline font-medium"
                  >
                    Forgot your password?
                  </button>
                </p>
              </form>
            </AuthCard>
          </div>
        </div>
      </div>

      {/* RIGHT — Login Marketing Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12 text-white">
        <h1 className="text-5xl font-bold mb-4">
          WELCOME BACK
        </h1>

        <p className="text-xl text-white/80 max-w-md">
          Pick up right where you left off and stay on top of your shared
          expenses with SettleUp.
        </p>
      </div>
    </div>
  </div>
);

}
