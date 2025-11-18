'use client'
import React, { createContext, useContext, useState } from 'react'

const GlobalContext = createContext(null)

export function GlobalProvider({ children }) {
	// shared state for Gemini response and last upload result
	const [geminiResponse, setGeminiResponse] = useState(null)
	const [lastResult, setLastResult] = useState(null)
	const [geminiLoading, setGeminiLoading] = useState(false)

	return (
		<GlobalContext.Provider value={{
			geminiResponse, setGeminiResponse,
			lastResult, setLastResult,
			geminiLoading, setGeminiLoading
		}}>
			{children}
		</GlobalContext.Provider>
	)
}

export function useGlobal() {
	const ctx = useContext(GlobalContext)
	if (!ctx) throw new Error('useGlobal must be used within GlobalProvider')
	return ctx
}
