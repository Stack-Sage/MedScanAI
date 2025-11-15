'use client'
import { motion, AnimatePresence } from "framer-motion";
import { useGlobal } from "../../context/GlobalContext";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import Tooltip from "../Tooltip"

// --- New subcomponents ---

function ScanImage({ file }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => url && URL.revokeObjectURL(url);
    } else if (typeof file === "string" && file.startsWith("blob:")) {
      setPreviewUrl(file);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);
  return (
    <motion.div
      className="flex-shrink-0 flex items-center justify-center w-full md:w-[260px] h-[220px] bg-zinc-900/40 rounded-2xl border border-cyan-900 shadow-lg overflow-hidden"
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.7, type: "spring" }}
    >
      {previewUrl ? (
        <motion.img
          src={previewUrl}
          alt="Scan"
          className="object-contain w-full h-full rounded-2xl"
          initial={{ opacity: 0.7, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, type: "spring" }}
        />
      ) : (
        <span className="text-cyan-300 text-lg">No image available</span>
      )}
    </motion.div>
  );
}

function DiagnosisInfo({ diagnosis, confidence }) {
  return (
    <motion.div
      className="flex flex-col md:flex-row md:items-center gap-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.6 }}
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-cyan-900/40 shadow w-12 h-12 border border-cyan-700">
          <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 20l9-5-9-5-9 5 9 5z" /><path d="M12 12V4" /><path d="M12 12l9-5-9-5-9 5 9 5z" />
          </svg>
        </span>
        <div className="flex flex-col">
          <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wide">Disease</span>
          <span className="text-xl font-bold text-cyan-300">{diagnosis}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center justify-center rounded-full bg-green-900/40 shadow w-12 h-12 border border-green-700">
          <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
        </span>
        <div className="flex flex-col">
          <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">Confidence</span>
          <span className="text-xl font-bold text-green-300">{confidence}</span>
        </div>
      </div>
    </motion.div>
  );
}

function cleanLine(l) {
  return l
    .replace(/^[*\-•\d]+\s*/,'')    // leading symbols, numbers
    .replace(/\s{2,}/g,' ')
    .trim();
}

function buildCardsFromGemini(raw) {
  if (!raw) return [];
  const text = raw.replace(/\r/g,'').trim();

  // Normalize headings (may start with "1." or just the question text)
  const questionOrder = [
    'What are the common symptoms',
    'What are the primary causes',
    'How is this disease typically diagnosed',
    'What treatment options are available'
  ];

  // Split by numbered headings
  const sections = text
    .split(/\n(?=\d+\s*\.)/) // keep numbered groups
    .map(s => s.trim())
    .filter(Boolean);

  // Map question keyword to collected lines
  const lookup = {};
  sections.forEach(sec => {
    // Extract heading line
    const firstLine = sec.split('\n')[0];
    const heading = firstLine
      .replace(/^\d+\s*\.\s*/,'')
      .replace(/[:]*$/,'')
      .toLowerCase();

    const matchKey = questionOrder.find(q =>
      heading.startsWith(q.toLowerCase())
    );
    if (matchKey) {
      const bodyLines = sec
        .split('\n')
        .slice(1) // skip heading
        .map(cleanLine)
        .filter(l => l.length && !/^AI Health Guidance/i.test(l));
      lookup[matchKey] = bodyLines;
    }
  });

  // Fallback: if Gemini returned bullets without numbered headings
  if (Object.keys(lookup).length === 0) {
    // Try naive split by headings inside raw text
    questionOrder.forEach(q => {
      const r = new RegExp(q + '.*?(?:\\n|$)','i');
      if (r.test(text)) {
        // crude extraction
        const after = text.split(r)[1] || '';
        const lines = after.split('\n').slice(0,8)
          .map(cleanLine).filter(Boolean);
        lookup[q] = lines;
      }
    });
  }

  // Build exactly four cards (empty arrays if missing)
  return questionOrder.map((q,i) => ({
    title: ['Symptoms','Causes','Diagnosis','Treatment'][i],
    points: (lookup[q] && lookup[q].length ? lookup[q].slice(0,8) : ['No data'])
  }));
}

function GuidanceCard({ title, points, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{
        scale: 1.08,
        boxShadow: theme === 'dark'
          ? "0 12px 40px 0 #22d3eecc, 0 1.5px 8px 0 #0ea5e9cc"
          : "0 12px 40px 0 #38bdf8cc, 0 1.5px 8px 0 #7dd3fcbb",
        borderColor: "#22d3ee",
        background: theme === 'dark'
          ? "linear-gradient(135deg, #18181b 60%, #0e7490 100%)"
          : "linear-gradient(135deg, #e0f2fe 60%, #38bdf8 100%)",
        color: theme === 'dark' ? "#e0f2fe" : undefined,
        transition: {
          duration: 0.14,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
      whileTap={{
        scale: 0.97,
        background: theme === 'dark'
          ? "linear-gradient(135deg, #0e7490 60%, #18181b 100%)"
          : "linear-gradient(135deg, #38bdf8 60%, #e0f2fe 100%)"
      }}
      transition={{ duration: 0.3, type: "spring", stiffness: 80, damping: 18 }}
      className={`result-card-item relative group rounded-2xl shadow-xl border flex flex-col gap-2 cursor-pointer overflow-hidden transition-all duration-150 p-4
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
      <div className="flex items-center gap-3 mb-2 z-10 relative">
        <span className="text-lg font-bold">{title}</span>
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
          {points.map((pt, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Tooltip text="This is an AI-generated point. For more info, consult a doctor." position="right">
                {pt.replace(/^\*+\s*/, '')}
              </Tooltip>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      <motion.div
        layoutId={`card-underline-${title}`}
        className="absolute left-6 bottom-2 h-1 w-10 rounded-full bg-cyan-400/40 opacity-0 group-hover:opacity-100 group-hover:w-96 transition-all duration:500"
      />
      <div className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-inset ring-cyan-400/10" />
    </motion.div>
  );
}

function GuidanceCards({ cards, theme }) {
  if (!cards.length) return null;
  return (
    <motion.div
      className={`grid md:grid-cols-2 gap-6 ${theme === 'dark' ? 'text-cyan-100' : 'text-sky-900'}`}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
    >
      {cards.map((card, idx) => (
        <GuidanceCard
          key={idx}
          title={card.title}
          points={card.points.map(p => cleanLine(p))}
          theme={theme}
        />
      ))}
    </motion.div>
  );
}

// --- Main ResultCard component ---

export default function ResultCard({ result: propResult }) {
  const { geminiResponse, lastResult } = useGlobal();
  const [text, setText] = useState(null);
  const [cards, setCards] = useState([]);
  const [file, setFile] = useState(null);
  const { theme } = useTheme();

  // Use lastResult if no propResult
  const result = propResult || lastResult;

  // Always use the uploaded file from lastResult (if available)
  useEffect(() => {
    if (result?.file instanceof File) {
      setFile(result.file);
    } else if (result?.meta?.previewUrl) {
      setFile(result.meta.previewUrl);
    } else {
      setFile(null);
    }
  }, [result]);

  useEffect(() => {
    let t = null;
    if (geminiResponse) t = geminiResponse;
    else if (result?.gemini?.candidates?.[0]?.content?.parts?.[0]?.text) t = result.gemini.candidates[0].content.parts[0].text;
    else if (result?.summary) t = result.summary;
    setText(t);
  }, [geminiResponse, result]);

  useEffect(() => {
    if (!text) {
      setCards([]);
      return;
    }
    const built = buildCardsFromGemini(text);
    setCards(built);
  }, [text]);

  if (!result) return null;

  const diagnosis = result.diagnosis || "Unknown";
  const confidence = result.confidence !== undefined ? `${result.confidence}%` : "N/A";

  return (
    <motion.div
      className="w-full flex flex-col gap-8"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } }
      }}
    >
      <motion.div
        className={`flex flex-col md:flex-row items-center md:items-start gap-8 w-full`}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", stiffness: 80, damping: 18 }}
      >
        <ScanImage file={file} />
        <div className="flex-1 flex flex-col gap-4">
          <DiagnosisInfo diagnosis={diagnosis} confidence={confidence} />
        </div>
      </motion.div>
      {/* Guidance cards, separated for each question */}
      <GuidanceCards cards={cards} theme={theme} />
      <div className="mt-6 flex justify-center">
        <Tooltip text="Results are for demonstration. For real medical advice, consult a professional.">
          <span className="text-xs text-cyan-400 underline cursor-pointer">What does this mean?</span>
        </Tooltip>
      </div>
    </motion.div>
  );
}
