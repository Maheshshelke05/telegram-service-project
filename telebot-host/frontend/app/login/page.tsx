import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    router.push('/');
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input className="w-full p-2 border" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" />
        <button className="px-4 py-2 bg-blue-600 text-white">Login</button>
      </form>
    </main>
  )
}
