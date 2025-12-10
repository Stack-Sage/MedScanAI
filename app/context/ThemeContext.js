'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({ theme: 'dark' })

export function ThemeProvider({ children }) {
  // Always use dark theme
  const theme = 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
    localStorage.setItem('theme', theme)
  }, [theme])

  // No toggle function
  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
