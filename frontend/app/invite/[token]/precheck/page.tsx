'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InvitePrecheckPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  useEffect(() => {
    if (!token) {
      router.replace('/'); // fallback
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const checkAuth = async () => {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include',
        });

        if (!res.ok || res.status === 401) {
          // Not logged in → redirect to login with inviteToken
          router.replace(`/login?inviteToken=${token}`);
          return;
        }

        // User is logged in → go to accept page
        router.replace(`/invite/${token}/accept`);
      } catch (err) {
        console.error(err);
        router.replace(`/login?inviteToken=${token}`);
      }
    };

    checkAuth();
  }, [token, router]);

  return (
    <p className="text-center mt-20 text-white/60">
      Checking invite link...
    </p>
  );
}
