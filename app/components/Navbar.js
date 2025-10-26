'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <header className={`sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-blue-100 flex items-center justify-between px-6 py-3 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="flex items-center gap-4">
        <span className="font-bold text-xl md:text-2xl text-blue-700 tracking-tight">MedScan AI</span>
      </div>
      <nav className="hidden md:flex gap-2 text-zinc-700 text-base">
        <Link href="/" className="nav-link font-medium">Home</Link>
        <Link href="/about" className="nav-link font-medium">About</Link>
        <Link href="/results" className="nav-link font-medium">Results</Link>
        <Link href="/login" className="nav-link font-medium">Login</Link>
      </nav>
      <div className="flex items-center gap-2">
        {/* Theme toggle removed for light-only */}
        <button
          className="md:hidden flex items-center px-2 py-1 rounded hover:bg-blue-100 transition"
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Open menu"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-700" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-blue-100 flex flex-col items-center gap-2 py-4 md:hidden shadow-lg">
          <Link href="/" className="w-full text-center py-2 hover:bg-blue-50 rounded transition font-medium" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href="/about" className="w-full text-center py-2 hover:bg-blue-50 rounded transition font-medium" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href="/results" className="w-full text-center py-2 hover:bg-blue-50 rounded transition font-medium" onClick={() => setMenuOpen(false)}>Results</Link>
          <Link href="/login" className="w-full text-center py-2 hover:bg-blue-50 rounded transition font-medium" onClick={() => setMenuOpen(false)}>Login</Link>
        </div>
      )}
    </header>
  )
}
