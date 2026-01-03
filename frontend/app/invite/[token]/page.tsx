'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function InviteTokenPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string | undefined;

  useEffect(() => {
    if (token) {
      router.replace(`/invite/${token}/precheck`);
    } else {
      router.replace('/');
    }
  }, [token, router]);

  return (
    <p className="text-center mt-20 text-white/60">
      Redirecting to invite...
    </p>
  );
}
