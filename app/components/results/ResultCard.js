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
    .replace(/^[\s>*•\-–—]+/, '')           // leading symbols
    .replace(/^\d+\.\s*/, '')               // leading numbering
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function parseByHeadings(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const headingMap = {
    symptoms: ['common symptoms', 'symptoms'],
    causes: ['primary causes', 'causes'],
    diagnosis: ['diagnosis', 'diagnosed', 'how is this disease typically diagnosed'],
    treatment: ['treatment options', 'treatment']
  };
  const canonicalOrder = ['symptoms', 'causes', 'diagnosis', 'treatment'];
  let current = null;
  const buckets = { symptoms: [], causes: [], diagnosis: [], treatment: [] };

  const isHeading = (line) => {
    const base = line.toLowerCase().replace(/[:\-]+$/, '');
    return Object.entries(headingMap).find(([key, variants]) =>
      variants.some(v => base.startsWith(v))
    );
  };

  for (let line of lines) {
    const headingMatch = isHeading(line);
    if (headingMatch) {
      current = headingMatch[0];
      continue;
    }
    if (current) {
      // Stop if line looks like next heading
      const nextHeading = isHeading(line);
      if (nextHeading) {
        current = nextHeading[0];
        continue;
      }
      if (line.length) buckets[current].push(cleanLine(line));
    }
  }

  // Fallback: if sections empty but content exists, try bullet grouping
  const allNonEmpty = lines.filter(l => l && !isHeading(l)).map(cleanLine);
  if (canonicalOrder.every(k => buckets[k].length === 0) && allNonEmpty.length) {
    const quarter = Math.ceil(allNonEmpty.length / 4);
    buckets.symptoms = allNonEmpty.slice(0, quarter);
    buckets.causes = allNonEmpty.slice(quarter, quarter * 2);
    buckets.diagnosis = allNonEmpty.slice(quarter * 2, quarter * 3);
    buckets.treatment = allNonEmpty.slice(quarter * 3);
  }

  return canonicalOrder.map((key, i) => ({
    title: ['Symptoms', 'Causes', 'Diagnosis', 'Treatment'][i],
    points: buckets[key].length ? buckets[key].slice(0, 12) : ['No data']
  }));
}

function buildCardsFromGemini(raw) {
  if (!raw) return [];
  const text = raw.replace(/\r/g, '').trim();

  // First attempt: numbered sections pattern (existing logic)
  const numberedRegex = /(?:\d+\.\s*)([^\n:]+):?([\s\S]*?)(?=(?:\d+\.\s*[^\n:]+:?|$))/g;
  const found = [];
  let m;
  while ((m = numberedRegex.exec(text)) !== null) {
    const titleRaw = cleanLine(m[1]);
    const body = m[2]
      .split('\n')
      .map(cleanLine)
      .filter(Boolean);
    found.push({ title: titleRaw, points: body });
  }

  // Map numbered detection to canonical if possible
  const keyMap = {
    symptoms: ['symptoms'],
    causes: ['causes'],
    diagnosis: ['diagnosis'],
    treatment: ['treatment']
  };
  const canonical = { symptoms: [], causes: [], diagnosis: [], treatment: [] };
  found.forEach(sec => {
    const low = sec.title.toLowerCase();
    const matchKey = Object.entries(keyMap).find(([k, arr]) =>
      arr.some(v => low.includes(v))
    );
    if (matchKey) {
      canonical[matchKey[0]] = canonical[matchKey[0]].concat(sec.points);
    }
  });

  const numberedResult = ['symptoms','causes','diagnosis','treatment'].map((k,i)=>({
    title: ['Symptoms','Causes','Diagnosis','Treatment'][i],
    points: canonical[k].length ? canonical[k].slice(0,12) : []
  }));

  const haveData = numberedResult.some(c => c.points.length);

  // If numbered parse failed, fall back to heading-based parse
  if (!haveData) {
    return parseByHeadings(text);
  }

  // Fill empties with fallback heading parse if some missing
  const fallbackParsed = parseByHeadings(text);
  return numberedResult.map((c, idx) => {
    if (!c.points.length) return fallbackParsed[idx];
    return c;
  }).map(c => ({
    ...c,
    points: c.points.map(p => cleanLine(p)).filter(Boolean).length ? c.points : ['No data']
  }));
}

// GuidanceCard unchanged except we ensure cleanLine applied before display
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
        transition: { duration: 0.14, ease: [0.4,0,0.2,1] }
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
    >
      <div className="flex items-center gap-3 mb-2 z-10 relative">
        <span className="text-lg font-bold">{title}</span>
        <Tooltip text={`AI guidance: ${title}`} position="right">
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
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <AnimatePresence>
          {points.map((pt,i)=>(
            <motion.li
              key={i}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Tooltip text="AI-generated. Not medical advice." position="right">
                {cleanLine(pt)}
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
        <GuidanceCard key={idx} title={card.title} points={card.points} theme={theme} />
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
    if (!text) { setCards([]); return; }
    setCards(buildCardsFromGemini(text));
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
