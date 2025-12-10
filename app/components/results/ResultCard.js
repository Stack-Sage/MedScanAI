'use client'
import { useEffect, useState } from "react";
// Remove theme import
// import { useTheme } from "../../context/ThemeContext";
import Tooltip from "../Tooltip"
import Loader from "../../components/ui/Loader"
import { useGlobal } from "../../context/GlobalContext"

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
    <div
      className="flex-shrink-0 flex items-center justify-center w-full md:w-[260px] h-[220px] bg-zinc-900/40 rounded-2xl border border-cyan-900 shadow-lg overflow-hidden"
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Scan"
          className="object-contain w-full h-full rounded-2xl"
        />
      ) : (
        <span className="text-cyan-300 text-lg">No image available</span>
      )}
    </div>
  );
}

function DiagnosisInfo({ diagnosis, confidence }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4">
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
    </div>
  );
}

function cleanLine(l) {
  if (typeof l !== 'string') return '';
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
  const text = typeof raw === 'string' ? raw.replace(/\r/g, '').trim() : '';

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

function buildFallbackGuidance(result) {
  const dx = result?.diagnosis || 'Unknown';
  return [
    { title: 'Symptoms', points: [`Common symptoms related to ${dx} may vary.`, 'Monitor any changes.', 'Track duration & severity.', 'Seek evaluation if symptoms escalate.'] },
    { title: 'Causes', points: ['Multiple factors may contribute.', 'Genetic & environmental influences.', 'Lifestyle can modulate risk.', 'Further clinical assessment needed.'] },
    { title: 'Diagnosis', points: ['Imaging + clinical history.', 'Additional lab tests may help.', 'Follow-up imaging if unclear.', 'Professional consultation advised.'] },
    { title: 'Treatment', points: ['Depends on severity & type.', 'Supportive care may be sufficient.', 'Specialist referral if persistent.', 'General info; not medical advice.'] },
  ];
}

// GuidanceCard: always use dark mode styles
function GuidanceCard({ title, points }) {
  return (
    <div
      className="result-card-item relative group rounded-2xl shadow-xl border flex flex-col gap-2 cursor-pointer overflow-hidden transition-all duration-150 p-4 bg-gradient-to-br from-[#23272f]/90 to-[#164e63]/90 border-[#164e63] text-[#e0e7ef] backdrop-blur-md"
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
      <ul className="pl-5 list-disc space-y-1 text-zinc-100/90 z-10 relative">
        {points.map((pt,i)=>(
          <li key={i}>
            <Tooltip text="AI-generated. Not medical advice." position="right">
              {cleanLine(pt)}
            </Tooltip>
          </li>
        ))}
      </ul>
      <div
        className="absolute left-6 bottom-2 h-1 w-10 rounded-full bg-cyan-400/40 opacity-0 group-hover:opacity-100 group-hover:w-96 transition-all duration:500"
      />
      <div className="pointer-events-none absolute -inset-px rounded-2xl ring-1 ring-inset ring-cyan-400/10" />
    </div>
  );
}

function GuidanceCards({ cards }) {
  if (!cards.length) return null;
  return (
    <div className="grid md:grid-cols-2 gap-6 text-[#e0e7ef]">
      {cards.map((card, idx) => (
        <GuidanceCard key={idx} title={card.title} points={card.points} />
      ))}
    </div>
  );
}

// --- Main ResultCard component ---

export default function ResultCard({ result: propResult }) {
  const { geminiResponse, lastResult } = useGlobal();
  const [text, setText] = useState(null);
  const [cards, setCards] = useState([]);
  const [file, setFile] = useState(null);
  // Remove theme usage
  // const { theme } = useTheme();

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

  // Prefer the Gemini text tied to this result; fall back to global and summary
  useEffect(() => {
    if (result?.noDisease) { setText(null); setCards([]); return; }
    let t = null;
    const parts = result?.gemini?.candidates?.[0]?.content?.parts;
    if (Array.isArray(parts) && parts[0]?.text) t = parts[0].text;
    else if (geminiResponse) t = geminiResponse;
    else if (result?.summary) t = result.summary;
    setText(t);
  }, [result, geminiResponse]);

  useEffect(() => {
    if (!text) { setCards([]); return; }
    setCards(buildCardsFromGemini(text));
  }, [text]);

  useEffect(() => {
    if (!result) { setCards([]); return; }
    if (result.noDisease) { setCards([]); return; }
    if (result?.gemini?.error) {
      setCards([{ title: 'Gemini Error', points: [result.gemini.error] }]);
      return;
    }
    if (geminiResponse && /^Gemini request failed/i.test(geminiResponse)) {
      setCards([{ title: 'Gemini Error', points: [geminiResponse] }]);
      return;
    }
    if (!text || text === 'No Gemini response' || (result?.gemini?.error)) {
      setCards(buildFallbackGuidance(result));
      return;
    }
    const parsed = buildCardsFromGemini(text);
    setCards(parsed && parsed.length ? parsed : buildFallbackGuidance(result));
  }, [text, result, geminiResponse]);

  if (!result) return null;
  const diagnosis = result.diagnosis || "Unknown";
  const confidence = result.confidence !== undefined ? `${result.confidence}%` : "N/A";
  const isNoDisease = !!result.noDisease;

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
        <ScanImage file={file} />
        <div className="flex-1 flex flex-col gap-4">
          <DiagnosisInfo diagnosis={diagnosis} confidence={confidence} />
          {isNoDisease && (
            <div className="rounded-xl p-6 border text-center text-lg font-semibold bg-gradient-to-br from-[#23272f] to-[#164e63] border-[#164e63] text-[#e0e7ef]">
              🎉 Great news! You don't have the detected disease.
            </div>
          )}
        </div>
      </div>
      {/* Guidance cards, separated for each question */}
      {!isNoDisease && <GuidanceCards cards={cards} />}
      <div className="mt-6 flex justify-center">
        <Tooltip text="Results are for demonstration. For real medical advice, consult a professional.">
          <span className="text-xs text-cyan-400 underline cursor-pointer">What does this mean?</span>
        </Tooltip>
      </div>
    </div>
  );
}
