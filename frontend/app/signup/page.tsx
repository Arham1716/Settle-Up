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
      // Signup
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

      // Auto-login
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthCard title="Create Account">
          {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}
          <form onSubmit={handleSignup} className="space-y-4">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Creating account...' : 'Sign Up'}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() =>
                  router.replace(`/login${inviteToken ? `?inviteToken=${inviteToken}` : ''}`)
                }
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
