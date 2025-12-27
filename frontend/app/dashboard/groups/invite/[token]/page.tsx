'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface InviteResponse {
  groupId: string;
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const acceptInvite = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invite/${params.token}`);
        if (!res.ok) {
          throw new Error('Invalid invite link');
        }
        const data: InviteResponse = await res.json();
        router.push(`/dashboard/groups/group/${data.groupId}`);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to accept invite');
      } finally {
        setLoading(false);
      }
    };

    acceptInvite();
  }, [params.token, router]);

  if (loading) return <p>Accepting invite...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return null;
}
