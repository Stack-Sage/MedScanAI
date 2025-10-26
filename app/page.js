'use client'
import React from "react"
import Hero from "./components/home/Hero"
import Features from "./components/home/Features"
import Footer from "./components/home/Footer"
import UploadForm from "./components/UploadForm"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-cream-100 to-blue-100 font-sans">
      <Hero />
      <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 w-full">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 flex flex-col gap-8">
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="rounded-2xl bg-white shadow-xl border border-blue-100 p-8"
            >
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Upload Your Scan</h2>
              <UploadForm />
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 text-zinc-600 text-sm bg-blue-50 border border-blue-100 rounded-lg p-4"
              >
                <b>How it works:</b>
                <ol className="list-decimal pl-6 mt-2 space-y-1">
                  <li>Choose your MRI or ultrasound scan image.</li>
                  <li>Optionally add patient info or notes.</li>
                  <li>Submit to receive instant AI-powered analysis and guidance.</li>
                </ol>
                <div className="mt-3">
                  <span className="text-blue-700 font-medium">Note:</span> This is a demo. No real medical advice is provided.
                </div>
              </motion.div>
            </motion.div>
            <Features />
          </div>
          <aside className="flex flex-col gap-8">
            <motion.section
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="bg-white border border-blue-100 rounded-xl shadow p-6 text-center"
            >
              <h3 className="text-xl font-semibold text-blue-700 mb-2">Why Choose MedScan AI?</h3>
              <p className="text-zinc-700 mb-2">
                Fast, secure, and easy-to-use. Our AI helps you understand your scans and take the next step in your health journey.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">No account required</span>
                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">Private & Secure</span>
                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium border border-blue-200">Instant Results</span>
              </div>
            </motion.section>
            <motion.section
              initial={{ opacity: 0, y: 32, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="bg-white border border-blue-100 rounded-xl shadow p-6 text-center"
            >
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Need Help?</h3>
              <p className="text-zinc-700 mb-2">Contact our support team for assistance or feedback.</p>
              <a href="mailto:support@medscan.ai" className="text-blue-600 underline">support@medscan.ai</a>
            </motion.section>
          </aside>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
