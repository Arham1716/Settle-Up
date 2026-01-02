'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link.');
      setLoading(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const processInvite = async () => {
      try {
        // 1️⃣ Check if user is logged in
        const authRes = await fetch(`${apiUrl}/auth/me`, {
          credentials: 'include',
        });

        if (authRes.status === 401 || !authRes.ok) {
          // Not logged in → redirect to login/signup with inviteToken
          router.replace(`/login?inviteToken=${token}`);
          return;
        }

        const userData = await authRes.json();
        if (!userData?.id) {
          router.replace(`/login?inviteToken=${token}`);
          return;
        }

        // 2️⃣ User is logged in → verify invite token
        const verifyRes = await fetch(`${apiUrl}/invite/verify/${token}`);
        if (!verifyRes.ok) {
          const data = await verifyRes.json().catch(() => ({}));
          throw new Error(data.message || 'Invalid or expired invite link');
        }

        const inviteData = await verifyRes.json(); // { groupId, email, groupName }
        setGroupName(inviteData.groupName);
        setShowForm(true);
      } catch (err: any) {
        console.error('Invite processing error:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    processInvite();
  }, [token, router]);

  const handleAcceptInvite = async () => {
    if (!displayName.trim()) {
      return alert('Please enter your display name');
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/invite/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, displayName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to accept invite');
      }

      const data = await res.json(); // { groupId }
      router.replace(`/dashboard/groups/group/${data.groupId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to join group');
    }
  };

  // Loading state
  if (loading) return <p className="text-center mt-20">Processing invite...</p>;
  // Error state
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;

  return (
    <>
      {showForm && (
        <div className="max-w-md mx-auto mt-20 space-y-4 bg-black/40 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white">
            Join "{groupName}" group
          </h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 rounded-md bg-black/30 text-white outline-none"
          />
          <button
            onClick={handleAcceptInvite}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
          >
            Join Group
          </button>
        </div>
      )}
    </>
  );
}
