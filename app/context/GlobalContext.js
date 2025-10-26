'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

const GlobalContext = createContext({ lastResult: null, setLastResult: () => {} })

export function GlobalProvider({ children }) {
  const [lastResult, setLastResultState] = useState(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lastResult')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setLastResultState(JSON.parse(raw))
    } catch (e) {}
  }, [])

  const setLastResult = (r) => {
    try {
      if (r) localStorage.setItem('lastResult', JSON.stringify(r))
      else localStorage.removeItem('lastResult')
    } catch (e) {}
    setLastResultState(r)
  }

  return <GlobalContext.Provider value={{ lastResult, setLastResult }}>{children}</GlobalContext.Provider>
}

export function useGlobal() {
  return useContext(GlobalContext)
}
