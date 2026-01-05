'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InvitePrecheckPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string | undefined;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        const res = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include',
        });

        if (!res.ok) {
          router.replace(`/login?inviteToken=${token}`);
          return;
        }

        if (!cancelled) {
          router.replace(`/invite/${token}/accept`);
        }
      } catch {
        router.replace(`/login?inviteToken=${token}`);
      }
    };

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [token, router, apiUrl]);

  return (
    <p className="text-center mt-20 text-white/60">
      Preparing invite…
    </p>
  );
}
