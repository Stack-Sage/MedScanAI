'use client'
import React from "react"
import Hero from "./components/home/Hero"
import Features from "./components/home/Features"
import Footer from "./components/home/Footer"
import UploadForm from "./components/UploadForm"
import ResultCard from "./components/results/ResultCard"
import { motion } from "framer-motion"

const recent = [
	{
		diagnosis: "No abnormality detected",
		confidence: 98,
		summary: "Normal scan",
		meta: { date: "2024-06-01", patient: "John D." },
	},
	{
		diagnosis: "Mild inflammation",
		confidence: 87,
		summary: "Mild inflammation",
		meta: { date: "2024-05-15", patient: "Jane S." },
	},
]

export default function Home() {
	return (
		<div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-cream-100 to-blue-100 font-sans">
			<Hero />

			<main className="flex-1 w-full px-6 py-12">
				<motion.div
					initial={{ opacity: 0, y: 28 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="mx-auto w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-3 gap-8"
				>
			
					<div className="lg:col-span-2 flex flex-col gap-8">
						<motion.section
							initial={{ opacity: 0, scale: 0.99 }}
							whileInView={{ opacity: 1, scale: 1 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.6 }}
							className="rounded-2xl bg-white shadow-xl border border-blue-100 p-8"
						>
							<h2 className="text-2xl font-semibold text-blue-700 mb-4">
								Upload Your Scan
							</h2>
							<UploadForm />
						</motion.section>

						<motion.section
							initial={{ opacity: 0, y: 18 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							className="rounded-xl bg-white border border-blue-100 p-6 shadow"
						>
							<h3 className="text-lg font-semibold text-blue-700 mb-3">
								Quick Overview
							</h3>
							<div className="grid sm:grid-cols-2 gap-4 text-zinc-700">
								<div>
									<strong className="block text-blue-700">Turnaround</strong>
									<p className="text-sm">
										Results in seconds for most scan types (demo).
									</p>
								</div>
								<div>
									<strong className="block text-blue-700">Privacy</strong>
									<p className="text-sm">
										Encrypted upload and temporary processing only.
									</p>
								</div>
								<div>
									<strong className="block text-blue-700">Guidance</strong>
									<p className="text-sm">
										Clear next steps and recommended specialists.
									</p>
								</div>
								<div>
									<strong className="block text-blue-700">Support</strong>
									<p className="text-sm">
										Contact support@medscan.ai for help.
									</p>
								</div>
							</div>
						</motion.section>

						<Features />
					</div>

					{/* Sidebar: recent results, stats, CTA */}
					<aside className="flex flex-col gap-6">
						<motion.div
							initial={{ opacity: 0, y: 18 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.6, delay: 0.15 }}
							className="rounded-xl bg-white border border-blue-100 p-6 shadow"
						>
							<h4 className="text-lg font-semibold text-blue-700 mb-3">
								Recent results
							</h4>
							<div className="flex flex-col gap-3">
								{recent.map((r, i) => (
									<motion.div
										key={i}
										initial={{ opacity: 0, x: 16 }}
										whileInView={{ opacity: 1, x: 0 }}
										viewport={{ once: true }}
										transition={{
											duration: 0.45,
											delay: i * 0.08,
										}}
									>
										<ResultCard result={r} />
									</motion.div>
								))}
							</div>
							<div className="mt-4 text-xs text-zinc-600">
								<span className="font-medium">Demo data</span> — upload a scan to
								generate a new result.
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 18 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.6, delay: 0.25 }}
							className="rounded-xl bg-white border border-blue-100 p-6 shadow text-center"
						>
							<h4 className="text-lg font-semibold text-blue-700 mb-2">
								Get Started
							</h4>
							<p className="text-sm text-zinc-700 mb-4">
								No account required for demo uploads.
							</p>
							<a
								href="#upload"
								className="inline-block btn bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg text-white"
							>
								Upload now
							</a>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 18 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, amount: 0.3 }}
							transition={{ duration: 0.6, delay: 0.35 }}
							className="rounded-xl bg-white border border-blue-100 p-6 shadow text-center"
						>
							<h5 className="text-sm font-semibold text-zinc-700 mb-2">
								Stats (demo)
							</h5>
							<div className="flex justify-between gap-4">
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-700">98%</div>
									<div className="text-xs text-zinc-600">
										Avg. accuracy
									</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-blue-700">1.2s</div>
									<div className="text-xs text-zinc-600">
										Avg. response
									</div>
								</div>
							</div>
						</motion.div>
					</aside>
				</motion.div>
			</main>

			<Footer />
		</div>
	)
}
