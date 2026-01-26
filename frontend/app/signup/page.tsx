'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthCard from '../../components/ui/AuthCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteToken, setInviteToken] = useState<string | undefined>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('inviteToken');
    if (token) setInviteToken(token);
  }, []);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim();
    const password = (formData.get('password') as string).trim();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.message || 'Signup failed');
        return;
      }

      const loginRes = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const loginData = await loginRes.json();
        setError(loginData.message || 'Login after signup failed');
        return;
      }

      if (inviteToken) {
        router.replace(`/invite/${inviteToken}/precheck`);
      } else {
        router.replace('/dashboard');
      }    
    } catch (err) {
      console.error(err);
      setError('Signup failed');
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
      {/* LEFT — Signup Card */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md">
          {/* Card wrapper (controls background & removes borders) */}
          <div className="rounded-xl bg-[#064e3b] shadow-2xl">
            <AuthCard
              title="Sign Up"
              className="bg-transparent border-none text-white p-8"
            >
              {error && (
                <p className="mb-4 text-center text-sm text-red-300">
                  {error}
                </p>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
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
                  {loading ? 'Creating account...' : 'Sign Up'}
                </Button>

                <p className="mt-4 text-center text-sm text-white/70">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() =>
                      router.replace(
                        `/login${
                          inviteToken ? `?inviteToken=${inviteToken}` : ''
                        }`
                      )
                    }
                    className="text-green-300 hover:text-green-200 underline font-medium"
                  >
                    Log in
                  </button>
                </p>
              </form>
            </AuthCard>
          </div>
        </div>
      </div>

      {/* RIGHT — Marketing Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-12 text-white">
        <h1 className="text-5xl font-bold mb-4">
          SPLIT. SETTLE. LIVE EASY
        </h1>

        <p className="text-xl text-white/80 max-w-md">
          Sign up now and let SettleUp manage your expenses
        </p>
      </div>
    </div>
  </div>
);

}
