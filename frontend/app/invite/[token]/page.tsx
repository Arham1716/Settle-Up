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
    if (!token) return;

    const processInvite = async () => {
      try {
        // 1️⃣ Verify invite
        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invite/verify/${token}`);
        if (!verifyRes.ok) throw new Error('Invalid or expired invite link');
        const data = await verifyRes.json(); // { groupId, email, groupName }
        setGroupName(data.groupName);

        console.log("Checking auth/me");
        // 2️⃣ Check if user is logged in
        const authRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, { credentials: 'include' });

        if (!authRes.ok) {
          console.log("auth/me failed — redirecting to login");
          // Not logged in → redirect to login with inviteToken
          router.replace(`/login?inviteToken=${token}`);
          return;
        }

        // Logged in → show display name form
        setShowForm(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    processInvite();
  }, [token, router]);

  const handleAcceptInvite = async () => {
    if (!displayName.trim()) return alert('Please enter your display name');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invite/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, displayName }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to accept invite');
      }

      const data = await res.json();
      // ✅ Redirect to the specific group page
      router.replace(`/dashboard/groups/group/${data.groupId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to join group');
    }
  };

  if (loading) return <p>Processing invite...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  console.log("Invite page mounted, token:", token);


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
