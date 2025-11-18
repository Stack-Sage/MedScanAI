'use client'
import React from "react"
import ResultCard from "../components/results/ResultCard"
import { motion } from "framer-motion"
import { useTheme } from "../context/ThemeContext"
import { useGlobal } from "../context/GlobalContext"
import Content from "../components/content"
import Loader from "../components/ui/Loader"

export default function ResultsPage() {
  const { theme } = useTheme();
  const { lastResult, geminiResponse, setGeminiResponse } = useGlobal();
  const [loading, setLoading] = React.useState(false);
  const getContent = Content().getContent;

  React.useEffect(() => {
    if (!lastResult) return;

    // Reset old response so UI can't show stale content
    setGeminiResponse(null);

    if (lastResult.noDisease) {
      // Skip Gemini, just stop loading quickly
      setLoading(false);
      return;
    }

    const extractText = (res) =>
      res?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    (async () => {
      setLoading(true);
      try {
        // If UploadForm already computed Gemini, use it
        if (lastResult.gemini) {
          setGeminiResponse(extractText(lastResult.gemini) || "No Gemini response");
          return;
        }
        // Otherwise compute now
        const geminiRes = await getContent(lastResult);
        setGeminiResponse(extractText(geminiRes) || "No Gemini response");
      } catch (e) {
        setGeminiResponse("Gemini request failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, [lastResult, setGeminiResponse]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans ${theme === 'dark' ? 'bg-black text-zinc-100' : 'bg-white text-zinc-900'}`}
    >
      <main className="flex-1 flex flex-col items-center py-12 px-4 w-full">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'}`}
        >
          Your Results
        </motion.h1>
        <div className="w-full max-w-5xl flex flex-col gap-6">
          {loading ? <Loader /> : <ResultCard />}
        </div>
        <div className={`mt-8 text-center text-sm ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <b>Tip:</b> Click Upload your scan on the home page to add a new result.
        </div>
      </main>
    </div>
  )
}
