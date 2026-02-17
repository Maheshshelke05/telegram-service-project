'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface Bot {
  id: number;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchBots();
  }, [token]);

  const fetchBots = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/bots`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBots(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const startBot = async (id: number) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/bots/${id}/start`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBots();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start bot');
    }
    setLoading(false);
  };

  const stopBot = async (id: number) => {
    setLoading(true);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/bots/${id}/stop`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBots();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to stop bot');
    }
    setLoading(false);
  };

  const deleteBot = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bot?')) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/bots/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBots();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete bot');
    }
    setLoading(false);
  };

  const viewLogs = async (id: number) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/bots/${id}/logs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to get logs');
    }
  };

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Bots</h1>
        <button
          onClick={() => router.push('/bots/add')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Add New Bot
        </button>
      </div>

      {bots.length === 0 && (
        <div className="text-center py-12 bg-gray-100 rounded">
          <p className="text-gray-600 mb-4">No bots yet. Create your first bot!</p>
          <button
            onClick={() => router.push('/bots/add')}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create Bot
          </button>
        </div>
      )}

      <div className="grid gap-4">
        {bots.map(bot => (
          <div key={bot.id} className="p-6 bg-white rounded-lg shadow border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold mb-2">Bot #{bot.id}</h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(bot.created_at).toLocaleString()}
                </p>
                <div className="mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    bot.status === 'running' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {bot.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                {bot.status === 'stopped' ? (
                  <button
                    onClick={() => startBot(bot.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Start
                  </button>
                ) : (
                  <button
                    onClick={() => stopBot(bot.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => viewLogs(bot.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Logs
                </button>
                <button
                  onClick={() => deleteBot(bot.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
