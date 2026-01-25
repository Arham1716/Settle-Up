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
    <div className="min-h-screen flex">
      {/* LEFT SIDE — White background + Dark Green Signup Card */}
      <div className="flex-1 flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md">
          <AuthCard
            title="Sign Up"
            className="text-white p-8"
            style={{ backgroundColor: '#064e3b' }}
          >
            {error && (
              <p className="mb-4 text-center text-sm text-destructive">{error}</p>
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
                      `/login${inviteToken ? `?inviteToken=${inviteToken}` : ''}`
                    )
                  }
                  className="text-green-400 hover:text-green-300 underline font-large"
                >
                  Log in
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
          <h1 className="text-5xl font-bold mb-4">SPLIT. SETTLE. LIVE EASY</h1>
          <p className="text-xl text-white/80 max-w-md">
            Sign up now and let SettleUp manage your expenses
          </p>
        </div>
      </div>
    </div>
  );
}
