'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AddBot() {
  const [token, setToken] = useState('');
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    const t = localStorage.getItem('token');
    await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/bots`, { bot_token: token }, { headers: { Authorization: `Bearer ${t}` } });
    router.push('/');
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Bot</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border" value={token} onChange={e=>setToken(e.target.value)} placeholder="Telegram Bot Token" />
        <button className="px-4 py-2 bg-blue-600 text-white">Create Bot</button>
      </form>
    </main>
  )
}
