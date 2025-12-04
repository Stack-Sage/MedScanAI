'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [visible, setVisible] = useState(false)
  const { theme, toggle } = useTheme()
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <header className={`sticky top-0 z-30 ${theme === 'dark' ? 'bg-black/90' : 'bg-white/90'} backdrop-blur border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'} flex items-center justify-between px-6 py-3 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
      <div className="flex items-center gap-4">
        <span className={`font-bold text-xl md:text-2xl tracking-tight transition-all duration-300 cursor-pointer ${theme === 'dark' ? 'text-cyan-400 hover:text-cyan-200' : 'text-cyan-700 hover:text-cyan-900'}`}>
          MedScan AI
        </span>
      </div>
      <nav className={`hidden md:flex gap-2 text-base ${theme === 'dark' ? 'text-zinc-200' : 'text-zinc-700'}`}>
        <Link
          href="/"
          className={`nav-link font-medium transition-all duration-300 hover:text-cyan-400 ${theme === 'light' ? 'hover:text-cyan-700' : ''}`}
        >
          Home
        </Link>
        <Link
          href="/results"
          className={`nav-link font-medium transition-all duration-300 hover:text-cyan-400 ${theme === 'light' ? 'hover:text-cyan-700' : ''}`}
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
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" className={theme === 'dark' ? "text-cyan-400" : "text-cyan-700"} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className={`absolute top-full left-0 w-full ${theme === 'dark' ? 'bg-black' : 'bg-white'} border-b ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'} flex flex-col items-center gap-2 py-4 md:hidden shadow-lg`}>
          <Link
            href="/"
            className={`w-full text-center py-2 rounded transition font-medium ${theme === 'dark' ? 'text-cyan-400 hover:text-cyan-200 hover:bg-zinc-900' : 'text-cyan-700 hover:text-cyan-900 hover:bg-zinc-100'}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/results"
            className={`w-full text-center py-2 rounded transition font-medium ${theme === 'dark' ? 'text-cyan-400 hover:text-cyan-200 hover:bg-zinc-900' : 'text-cyan-700 hover:text-cyan-900 hover:bg-zinc-100'}`}
            onClick={() => setMenuOpen(false)}
          >
            Results
          </Link>
        </div>
      )}
    </header>
  )
}
