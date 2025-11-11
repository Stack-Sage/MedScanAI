'use client'
import { motion } from "framer-motion";

export default function ResultCard({ result }) {
  if (!result) return null;

  const cards = [
    {
      label: "Diagnosis",
      value: result.diagnosis,
      icon: (
        <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 20l9-5-9-5-9 5 9 5z" /><path d="M12 12V4" /><path d="M12 12l9-5-9-5-9 5 9 5z" />
        </svg>
      ),
      color: "from-zinc-900 to-black"
    },
    {
      label: "Confidence",
      value: result.confidence + "%",
      icon: (
        <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
        </svg>
      ),
      color: "from-zinc-900 to-black"
    },
    {
      label: "Summary",
      value: result.summary,
      icon: (
        <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
      color: "from-zinc-900 to-black"
    },
    {
      label: "Scan Info",
      value: (
        <div>
          <div className="text-sm text-zinc-300">
            <b>Type:</b> {result.meta?.scanType || "N/A"}
          </div>
          <div className="text-sm text-zinc-300">
            <b>Date:</b> {result.meta?.date || "N/A"}
          </div>
          {result.meta?.patient && (
            <div className="text-sm text-zinc-300">
              <b>Patient:</b> {result.meta.patient}
            </div>
          )}
          {result.meta?.age && (
            <div className="text-sm text-zinc-300">
              <b>Age:</b> {result.meta.age}
            </div>
          )}
        </div>
      ),
      icon: (
        <svg className="w-7 h-7 text-cyan-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
        </svg>
      ),
      color: "from-zinc-900 to-black"
    },
    {
      label: "Meta",
      value: (
        <pre className="bg-zinc-900 rounded-lg p-2 text-xs text-zinc-400 overflow-x-auto mt-2">
          {JSON.stringify(result.meta, null, 2)}
        </pre>
      ),
      icon: (
        <svg className="w-7 h-7 text-zinc-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 2v4" /><path d="M16 2v4" /><path d="M4 10h16" />
        </svg>
      ),
      color: "from-zinc-900 to-black"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9, type: "spring", stiffness: 60, damping: 18 }}
          className={`relative group bg-gradient-to-br ${card.color} card p-6 rounded-2xl shadow-xl border border-zinc-800 flex flex-col gap-2 cursor-pointer overflow-hidden transition-all duration-300`}
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center rounded-full bg-zinc-900 shadow w-10 h-10 border border-zinc-800 group-hover:scale-110 transition-transform duration-300">
              {card.icon}
            </span>
            <span className="text-lg font-bold text-cyan-300">{card.label}</span>
          </div>
          <div className="pl-1">{card.value}</div>
          <motion.div
            layoutId={`card-underline-${idx}`}
            className="absolute left-6 bottom-4 h-1 w-10 rounded-full bg-cyan-400/40 opacity-0 group-hover:opacity-100 group-hover:w-20 transition-all duration-500"
          />
        </motion.div>
      ))}
    </div>
  );
}
