'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const { theme } = useTheme()
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <header className={`sticky top-0 z-30 bg-[#23272f]/90 border-[#164e63] backdrop-blur flex items-center justify-between px-6 py-3 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="flex items-center gap-4">
        <span className="font-bold text-xl md:text-2xl tracking-tight transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-[#60a5fa] hover:text-[#bae6fd]">
          MedScan AI
        </span>
      </div>
      <nav className="hidden md:flex gap-2 text-base text-[#e0e7ef]">
        <Link
          href="/"
          className="nav-link font-medium transition-all duration-300 hover:text-[#60a5fa] hover:scale-105 active:scale-95"
        >
          Home
        </Link>
        <Link
          href="/results"
          className="nav-link font-medium transition-all duration-300 hover:text-[#60a5fa] hover:scale-105 active:scale-95"
        >
          Results
        </Link>
      </nav>
      <div className="flex items-center gap-2">
        <button
          className="md:hidden flex items-center px-2 py-1 rounded hover:bg-zinc-800 transition"
          onClick={() => setMenuOpen(m => !m)}
          aria-label="Open menu"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-black border-b border-zinc-800 flex flex-col items-center gap-2 py-4 md:hidden shadow-lg">
          <Link
            href="/"
            className="w-full text-center py-2 rounded transition font-medium text-cyan-400 hover:text-cyan-200 hover:bg-zinc-900"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/results"
            className="w-full text-center py-2 rounded transition font-medium text-cyan-400 hover:text-cyan-200 hover:bg-zinc-900"
            onClick={() => setMenuOpen(false)}
          >
            Results
          </Link>
        </div>
      )}
    </header>
  )
}
