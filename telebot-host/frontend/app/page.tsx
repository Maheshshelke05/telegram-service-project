'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Dashboard() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const [bots, setBots] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/bots`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBots(res.data))
      .catch(() => {});
  }, [token]);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="space-y-3">
        {bots.length === 0 && <div>No bots yet</div>}
        {bots.map(b => (
          <div key={b.id} className="p-4 bg-white rounded shadow">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">Bot #{b.id}</div>
                <div className="text-sm text-gray-500">{new Date(b.created_at).toLocaleString && new Date(b.created_at).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded ${b.status==='running'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-700'}`}>{b.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
