import { motion } from "framer-motion"

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
  return (
    <section className="w-full py-12 px-4 bg-gradient-to-br from-cream-50 via-blue-50 to-blue-100">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="rounded-xl bg-white shadow-lg p-6 border border-blue-100 hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            <h3 className="text-lg font-bold text-blue-700 mb-2">{f.title}</h3>
            <p className="text-zinc-700">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
