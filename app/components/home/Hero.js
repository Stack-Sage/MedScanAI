import Link from "next/link"
import { motion } from "framer-motion"



export default function Hero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="w-full bg-gradient-to-br from-blue-50 via-cream-100 to-blue-100 py-16 px-4 flex flex-col items-center text-center"
    >
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-4xl md:text-5xl font-extrabold text-blue-800 mb-4 tracking-tight"
      >
        MedScan AI
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="max-w-2xl text-lg md:text-2xl text-blue-700 mb-8"
      >
        Upload your MRI or ultrasound scan and receive instant, AI-powered analysis, actionable guidance, and prevention tips.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex gap-4 justify-center"
      >
        <Link href="/about" className="rounded-full px-6 py-2 bg-white/90 text-blue-700 font-semibold shadow hover:bg-blue-100 transition-colors duration-200 border border-blue-200 nav-link">
          About
        </Link>
        <Link href="/results" className="rounded-full px-6 py-2 bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors duration-200 border border-blue-900 nav-link">
          View Results
        </Link>
      </motion.div>
    </motion.section>
  )
}
