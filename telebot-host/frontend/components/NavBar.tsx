'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NavBar(){
  const router = useRouter();
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">TeleBotHost</Link>
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <>
              <Link href="/" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
              <Link href="/bots/add" className="text-gray-700 hover:text-blue-600">Add Bot</Link>
              <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
              <Link href="/signup" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
