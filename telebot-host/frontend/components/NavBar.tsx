import React from 'react';
import Link from 'next/link';

export default function NavBar(){
  return (
    <nav className="bg-white p-4 shadow">
      <div className="max-w-6xl mx-auto flex justify-between">
        <div className="font-bold">TeleBotHost</div>
        <div className="space-x-4">
          <Link href="/">Dashboard</Link>
          <Link href="/bots/add">Add Bot</Link>
          <Link href="/login">Login</Link>
        </div>
      </div>
    </nav>
  )
}
