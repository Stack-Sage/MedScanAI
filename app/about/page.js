'use client'
import { useTheme } from "../context/ThemeContext"
import Tooltip from "../components/Tooltip"

export default function About() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-16 font-sans ${
        theme === 'dark'
          ? 'bg-primary-dark text-primary'
          : 'bg-gradient-to-br from-[#f1f5f9] via-[#e0e7ef] to-[#bae6fd] text-[#334155]'
      }`}
      style={{
        background: theme === 'dark'
          ? 'linear-gradient(120deg, #0f111a 0%, #1a1e2c 100%)'
          : 'linear-gradient(120deg, #f1f5f9 0%, #e0e7ef 60%, #bae6fd 100%)'
      }}
    >
      <div className={`max-w-2xl w-full rounded-2xl shadow-md shadow-black/40 border p-8 mx-auto ${
        theme === 'dark'
          ? 'bg-secondary-dark border-border-primary text-primary'
          : 'bg-white border-[#bae6fd] text-[#334155]'
      }`}>
        <div className="flex items-center gap-2 mb-4">
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'
          } drop-shadow-lg`}>
            About MedScan AI
          </h1>
          <Tooltip text="What is MedScan AI?">
            <svg className={`w-5 h-5 ml-1 cursor-pointer ${
              theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'
            }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="9" />
              <path d="M10 7v3m0 4h.01" />
            </svg>
          </Tooltip>
        </div>
        <p className={`mb-4 text-lg ${theme === 'dark' ? 'text-primary/90' : 'text-sky-900/90'}`}>
          MedScan AI is a modern platform for instant, AI-powered medical scan analysis and health guidance.
        </p>
        <ul className={`list-disc pl-6 space-y-2 mb-4 ${theme === 'dark' ? 'text-primary/90' : 'text-sky-900/90'}`}>
          <li>
            Fast, accurate scan analysis with confidence scores
            <Tooltip text="AI analyzes your scan and gives a confidence score." position="right">
              <svg className={`w-4 h-4 ml-1 cursor-pointer inline ${
                theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'
              }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" />
                <path d="M10 7v3m0 4h.01" />
              </svg>
            </Tooltip>
          </li>
          <li>
            Personalized, privacy-focused health insights
            <Tooltip text="Your data is secure and never shared." position="right">
              <svg className={`w-4 h-4 ml-1 cursor-pointer inline ${
                theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'
              }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" />
                <path d="M10 7v3m0 4h.01" />
              </svg>
            </Tooltip>
          </li>
          <li>
            Accessible, easy-to-use, and secure
            <Tooltip text="Designed for everyone, everywhere." position="right">
              <svg className={`w-4 h-4 ml-1 cursor-pointer inline ${
                theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'
              }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" />
                <path d="M10 7v3m0 4h.01" />
              </svg>
            </Tooltip>
          </li>
        </ul>
        <div className={`mt-6 text-sm ${theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'}`}>
          <b>Note:</b> This is a demonstration project. No real medical advice is provided.
        </div>
        <div className="mt-6 flex justify-center">
          <Tooltip text="Need help? Contact support@medscan.ai">
            <span className={`text-xs underline cursor-pointer ${
              theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'
            }`}>Need help or have questions?</span>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
