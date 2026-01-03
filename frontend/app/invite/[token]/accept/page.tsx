'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [groupName, setGroupName] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid invite link.');
      setLoading(false);
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    const fetchInvite = async () => {
      try {
        const res = await fetch(`${apiUrl}/invite/verify/${token}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || 'Invalid or expired invite link');
        }

        const inviteData = await res.json();
        setGroupName(inviteData.groupName);
        setShowForm(true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!displayName.trim()) return alert('Please enter your name');

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

  if (loading) return <p className="text-center mt-20">Loading invite...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;

  return (
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
        onClick={handleAccept}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
      >
        Join Group
      </button>
    </div>
  );
}
