'use client'
import { motion, AnimatePresence } from "framer-motion";
import { useGlobal } from "../../context/GlobalContext";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Tooltip from "../Tooltip"

export default function ResultCard({ result: propResult }) {
  const { geminiResponse } = useGlobal();
  const [text, setText] = useState(geminiResponse || (propResult?.summary ?? null));
  const [cards, setCards] = useState([]);
  const containerRef = useRef(null)
  const { theme } = useTheme();

  useEffect(() => {
    if (geminiResponse) setText(geminiResponse);
    else if (propResult?.summary) setText(propResult.summary);
  }, [geminiResponse, propResult]);

  useEffect(() => {
    if (!text) {
      setCards([]);
      return;
    }
    const regex = /(?:\*?\d+\.\s*)([^\n:]+):([\s\S]*?)(?=(?:\*?\d+\.\s*[^\n:]+:)|$)/g;
    const found = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const title = match[1]?.trim();
      const points = match[2].split('\n').map(l => l.trim()).filter(Boolean);
      found.push({ title, points });
    }
    setCards(found.length ? found.slice(0, 5) : []);
  }, [text]);

  if (!text || !cards.length) return null;

  return (
    <motion.div
      ref={containerRef}
      className={`grid md:grid-cols-2 gap-6 ${
        theme === 'dark' ? 'text-cyan-100' : 'text-sky-900'
      }`}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } }
      }}
    >
      {cards.map((card, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{
            scale: 1.08,
            boxShadow: "0 12px 40px 0 #22d3ee66",
            borderColor: "#22d3ee",
            background: "linear-gradient(135deg, #18181b 60%, #0e7490 100%)",
            color: "#e0f2fe"
          }}
          whileTap={{
            scale: 0.97,
            background: "linear-gradient(135deg, #0e7490 60%, #18181b 100%)"
          }}
          transition={{ duration: 0.7, type: "spring", stiffness: 70, damping: 16 }}
          className={`result-card-item relative group rounded-2xl shadow-xl border flex flex-col gap-2 cursor-pointer overflow-hidden transition-all duration-300
            ${theme === 'dark'
              ? 'bg-gradient-to-br from-[#18181b]/90 to-[#0e172a]/90 border-cyan-800 text-cyan-100 backdrop-blur-md'
              : 'bg-gradient-to-br from-white via-sky-100 to-blue-100 border-sky-200 text-sky-900 backdrop-blur-[2px]'}
          `}
          style={
            theme === 'dark'
              ? {
                  boxShadow: '0 8px 32px 0 #0ea5e988, 0 1.5px 8px 0 #22d3ee55',
                  backgroundImage: 'linear-gradient(120deg, #18181b 0%, #0ea5e9 100%)',
                  backgroundBlendMode: 'screen',
                  borderColor: '#0ea5e9',
                  color: '#e0f2fe',
                  transformStyle: 'preserve-3d'
                }
              : {
                  boxShadow: '0 8px 32px 0 #bae6fdcc, 0 1.5px 8px 0 #a7f3d0cc',
                  backgroundImage: 'linear-gradient(120deg, #f0f9ff 0%, #bae6fd 100%)',
                  backgroundBlendMode: 'normal',
                  transformStyle: 'preserve-3d'
                }
          }
        >
          {/* Animated border glow */}
          <motion.div
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-1 rounded-2xl z-0"
            style={{
              background: "radial-gradient(ellipse at 60% 40%, #22d3ee33 0%, #000 80%)",
              filter: "blur(16px)",
            }}
          />
          <div className="flex items-center gap-3 mb-2 z-10 relative">
            <span className="text-lg font-bold">{card.title || `Section ${idx + 1}`}</span>
            <Tooltip text="This section summarizes a key aspect of your scan analysis." position="right">
              <svg className="w-4 h-4 text-cyan-400 ml-1 cursor-pointer" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" />
                <path d="M10 7v3m0 4h.01" />
              </svg>
            </Tooltip>
          </div>
          <motion.ul
            className="pl-5 list-disc space-y-1 text-zinc-100/90 z-10 relative"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            <AnimatePresence>
              {card.points.map((pt, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Tooltip text="This is an AI-generated point. For more info, consult a doctor." position="right">
                    {pt}
                  </Tooltip>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
          <motion.div
            layoutId={`card-underline-${idx}`}
            className="absolute left-6 bottom-4 h-1 w-10 rounded-full bg-cyan-400/40 opacity-0 group-hover:opacity-100 group-hover:w-20 transition-all duration:500"
          />
          <div className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-inset ring-cyan-400/10" />
        </motion.div>
      ))}
      <div className="mt-6 flex justify-center">
        <Tooltip text="Results are for demonstration. For real medical advice, consult a professional.">
          <span className="text-xs text-cyan-400 underline cursor-pointer">What does this mean?</span>
        </Tooltip>
      </div>
    </motion.div>
  );
}
