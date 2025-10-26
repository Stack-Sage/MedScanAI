'use client'
import React from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { GlobalProvider } from './context/GlobalContext'
import Navbar from './components/Navbar'

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <GlobalProvider>
        <Navbar />
        {children}
      </GlobalProvider>
    </ThemeProvider>
  )
}
