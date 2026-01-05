'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AuthCard from '../../components/ui/AuthCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
      // Confirm auth before redirect
      const meRes = await fetch(`${apiUrl}/auth/me`, {
        credentials: 'include',
      });

      if (!meRes.ok) {
        setError('Login succeeded but session was not established');
        return;
      }

      if (inviteToken) {
        router.replace(`/invite/${inviteToken}/precheck`);
      } else {
        router.replace('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthCard title="Login">
          {error && <p className="mb-4 text-center text-sm text-destructive">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Password" required />
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Do not have an account?{' '}
              <Link
                href={`/signup${inviteToken ? `?inviteToken=${inviteToken}` : ''}`}
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}
