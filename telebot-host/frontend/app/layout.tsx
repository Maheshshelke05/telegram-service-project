import './globals.css'
import React from 'react'
import NavBar from '../components/NavBar'

export const metadata = {
  title: 'TeleBotHost'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <NavBar />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
