'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AddBot() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please enter a bot token');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const t = localStorage.getItem('token');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bots`,
        { bot_token: token },
        { headers: { Authorization: `Bearer ${t}` } }
      );
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create bot');
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add New Bot</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Telegram Bot Token</label>
            <input
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Get your bot token from @BotFather on Telegram
            </p>
          </div>
          {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {loading ? 'Creating...' : 'Create Bot'}
          </button>
        </form>
      </div>
    </main>
  )
}
