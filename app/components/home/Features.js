import { motion } from "framer-motion"
import Tooltip from "../Tooltip"

const features = [
  {
    title: "AI-Powered Analysis",
    desc: "Get fast, accurate scan analysis with confidence scores and clear next steps.",
  },
  {
    title: "Privacy & Security",
    desc: "Your uploads are encrypted, processed securely, and never shared.",
  },
  {
    title: "Personalized Guidance",
    desc: "Receive prevention tips, specialist recommendations, and survivor stories.",
  },
]

export default function Features() {
  const { theme } = require('../../context/ThemeContext').useTheme();

  return (
    <section
      className="w-full py-12 px-4 bg-black text-cyan-100"
      style={{ background: "#000" }}
    >
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.12, ease: "easeOut" }}
            whileHover={{
              boxShadow: theme === 'dark'
                ? "0 8px 32px 0 #22d3eecc, 0 1.5px 8px 0 #0ea5e9cc"
                : "0 8px 32px 0 #38bdf855",
              background: theme === 'dark'
                ? "linear-gradient(135deg, #0ea5e9 60%, #18181b 100%)"
                : "linear-gradient(135deg, #e0f2fe 60%, #38bdf8 100%)",
              borderColor: theme === 'dark' ? "#67e8f9" : "#38bdf8",
              color: theme === 'dark' ? "#e0f2fe" : undefined
            }}
            whileTap={{
              background: theme === 'dark'
                ? "linear-gradient(135deg, #18181b 60%, #0ea5e9 100%)"
                : "linear-gradient(135deg, #38bdf8 60%, #e0f2fe 100%)",
            }}
            className={`rounded-2xl shadow-2xl p-6 border transition-all duration-300
              ${theme === 'dark'
                ? 'bg-gradient-to-br from-[#18181b]/90 to-[#0e172a]/90 border-cyan-800 hover:shadow-cyan-900/10 text-cyan-100 backdrop-blur-md'
                : 'bg-gradient-to-br from-white via-sky-100 to-blue-100 border-sky-200 hover:shadow-sky-200/20 backdrop-blur-[2px] text-sky-900'
            }`}
            style={
              theme === 'dark'
                ? {
                    boxShadow: '0 8px 32px 0 #0ea5e988, 0 1.5px 8px 0 #22d3ee55',
                    backgroundImage:
                      'linear-gradient(120deg, #18181b 0%, #0ea5e9 100%)',
                    backgroundBlendMode: 'screen',
                    borderColor: '#0ea5e9',
                    color: '#e0f2fe'
                  }
                : {
                    boxShadow: '0 8px 32px 0 #bae6fdcc, 0 1.5px 8px 0 #7dd3fcbb',
                    backgroundImage:
                      'linear-gradient(120deg, #f0f9ff 0%, #bae6fd 100%)',
                    backgroundBlendMode: 'normal'
                  }
            }
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-lg font-bold text-cyan-300 drop-shadow-lg">{f.title}</h3>
              <Tooltip text={f.desc}>
                <svg className="w-4 h-4 text-cyan-400 ml-1 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="9" />
                  <path d="M10 7v3m0 4h.01" />
                </svg>
              </Tooltip>
            </div>
            <p className="text-cyan-100/90">{f.desc}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Tooltip text="Features are for demonstration. For real medical advice, consult a professional.">
          <span className="text-xs text-cyan-400 underline cursor-pointer">Learn more about these features</span>
        </Tooltip>
      </div>
    </section>
  )
}
