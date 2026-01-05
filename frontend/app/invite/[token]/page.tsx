'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InvitePrecheckPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string | undefined;

  useEffect(() => {
    if (!token) {
      router.replace('/'); // fallback
      return;
    }

    // Force redirect to login/signup page
    router.replace(`/signup?inviteToken=${token}`);
  }, [token, router]);

  return (
    <p className="text-center mt-20 text-white/60">
      Preparing invite…
    </p>
  );
}
