import { useTheme } from "../context/ThemeContext"
import Tooltip from "../components/Tooltip"

export default function About() {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-6 py-16 font-sans transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#0a0f1a] via-[#111827] to-[#0e172a] text-cyan-100'
          : 'bg-gradient-to-br from-white via-sky-100 to-blue-100 text-sky-900'
      }`}
      style={
        theme === 'dark'
          ? {
              backgroundImage:
                'radial-gradient(circle at 60% 40%, #0ea5e9 0%, #18181b 80%, #09090b 100%), linear-gradient(120deg, #0a0f1a 0%, #0e172a 100%)',
              backgroundBlendMode: 'screen, normal'
            }
          : {
              backgroundImage: 'linear-gradient(120deg, #e0f2fe 0%, #f0f9ff 60%, #bae6fd 100%)',
              backgroundBlendMode: 'normal'
            }
      }
    >
      <div className={`max-w-2xl w-full rounded-2xl shadow-2xl border p-8 mx-auto transition-all duration-500
        ${theme === 'dark'
          ? 'bg-gradient-to-br from-[#18181b]/90 to-[#0e172a]/90 border-cyan-800 text-cyan-100 backdrop-blur-md'
          : 'bg-white/80 border-sky-200 text-sky-900 backdrop-blur-[2px]'}`}>
        <div className="flex items-center gap-2 mb-4">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-cyan-300 drop-shadow-lg' : 'text-sky-700'}`}>
            About MedScan AI
          </h1>
          <Tooltip text="What is MedScan AI?">
            <svg className="w-5 h-5 text-cyan-400 ml-1 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="9" />
              <path d="M10 7v3m0 4h.01" />
            </svg>
          </Tooltip>
        </div>
        <p className={`mb-4 text-lg ${theme === 'dark' ? 'text-cyan-100/90' : ''}`}>
          MedScan AI is a modern platform for instant, AI-powered medical scan analysis and health guidance.
        </p>
        <ul className={`list-disc pl-6 space-y-2 mb-4 ${theme === 'dark' ? 'text-cyan-100/90' : ''}`}>
          <li>
            Fast, accurate scan analysis with confidence scores
            <Tooltip text="AI analyzes your scan and gives a confidence score." position="right">
              <svg className="w-4 h-4 text-cyan-400 ml-1 cursor-pointer inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" />
                <path d="M10 7v3m0 4h.01" />
              </svg>
            </Tooltip>
          </li>
          <li>
            Personalized, privacy-focused health insights
            <Tooltip text="Your data is secure and never shared." position="right">
              <svg className="w-4 h-4 text-cyan-400 ml-1 cursor-pointer inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" />
                <path d="M10 7v3m0 4h.01" />
              </svg>
            </Tooltip>
          </li>
          <li>
            Accessible, easy-to-use, and secure
            <Tooltip text="Designed for everyone, everywhere." position="right">
              <svg className="w-4 h-4 text-cyan-400 ml-1 cursor-pointer inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" />
                <path d="M10 7v3m0 4h.01" />
              </svg>
            </Tooltip>
          </li>
        </ul>
        <div className={`mt-6 text-sm ${theme === 'dark' ? 'text-cyan-300' : 'text-sky-600'}`}>
          <b>Note:</b> This is a demonstration project. No real medical advice is provided.
        </div>
        <div className="mt-6 flex justify-center">
          <Tooltip text="Need help? Contact support@medscan.ai">
            <span className="text-xs text-cyan-400 underline cursor-pointer">Need help or have questions?</span>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
