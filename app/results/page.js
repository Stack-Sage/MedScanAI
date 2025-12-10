'use client'
import React from "react"
import ResultCard from "../components/results/ResultCard"
import { useGlobal } from "../context/GlobalContext"
import Content from "../components/content"
import Loader from "../components/ui/Loader"
import { extractGeminiText } from "../api/upload/gemini"

export default function ResultsPage() {
  const {
    lastResult,
    geminiResponse,
    geminiLoading,
    setGeminiResponse,
    setGeminiLoading,
    setLastResult
  } = useGlobal();
  const ready = lastResult && (lastResult.noDisease || lastResult.gemini || geminiResponse);
  const [loading, setLoading] = React.useState(false);
  const getContent = Content().getContent; // added

  React.useEffect(() => {
    if (!lastResult || lastResult.noDisease) return
    if (lastResult.gemini || geminiResponse) return // already have
    let active = true
    ;(async () => {
      setGeminiLoading(true)
      try {
        const geminiRes = await getContent(lastResult)
        if (!active) return
        setGeminiResponse(extractGeminiText(geminiRes) || 'No Gemini response')
        setLastResult(r => r ? { ...r, gemini: geminiRes } : r)
      } catch {
        if (active) setGeminiResponse('Gemini request failed.')
      } finally {
        if (active) setGeminiLoading(false)
      }
    })()
    return () => { active = false }
  }, [lastResult, geminiResponse, getContent, setGeminiResponse, setGeminiLoading, setLastResult])

  return (
    <div
      className="min-h-screen flex flex-col font-sans bg-black text-zinc-100"
    >
      <main className="flex-1 flex flex-col items-center py-12 px-4 w-full">
        <h1
          className="text-3xl font-bold mb-8 text-zinc-100"
        >
          Your Results
        </h1>
        <div className="w-full max-w-5xl flex flex-col gap-6">
          {!ready || geminiLoading ? <Loader /> : <ResultCard />}
        </div>
        <div className="mt-8 text-center text-sm text-zinc-400">
          <b>Tip:</b> Click Upload your scan on the home page to add a new result.
        </div>
      </main>
    </div>
  )
}
