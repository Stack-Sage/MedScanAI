import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="w-full py-6 text-center text-sm text-zinc-500 bg-gradient-to-r from-cream-50 via-blue-50 to-blue-100 border-t border-blue-100"
    >
      &copy; {new Date().getFullYear()} MedScan AI &mdash; Empowering your health journey.
    </motion.footer>
  )
}
