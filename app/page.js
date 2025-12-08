'use client'
import { useState, useEffect, useRef, useCallback } from "react"
import React from "react"
import Hero from "./components/home/Hero"
import Features from "./components/home/Features"
import Footer from "./components/home/Footer"
import UploadForm from "./components/UploadForm"
import ResultCard from "./components/results/ResultCard"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useRouter } from "next/navigation"
import axios from "axios";
import { extractGeminiText } from "./api/upload/gemini"

import { useGlobal} from "./context/GlobalContext"
import Content from "./components/content"
import Loader from "./components/ui/Loader"
import Card from "./components/ui/Card"
import { useTheme } from "./context/ThemeContext"

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
	const [loading,setLoading]=useState(false);
	const router = useRouter();
	const { geminiResponse, setGeminiResponse, setLastResult, setGeminiLoading } = useGlobal();
	const { getContent } = Content();
	const { theme } = useTheme();

	// Background canvas (Three.js) container
	const bgRef = useRef(null)

	// Mouse parallax for hero area
	const mx = useMotionValue(0)
	const my = useMotionValue(0)
	const rx = useSpring(useTransform(my, [0, 1], [8, -8]), { stiffness: 80, damping: 20 })
	const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 80, damping: 20 })
	const onMouseMove = (e) => {
		const { innerWidth, innerHeight } = window
		mx.set(e.clientX / innerWidth)
		my.set(e.clientY / innerHeight)
	}

	useEffect(() => {
		let cleanup = () => {}
		;(async () => {
			try {
				const THREE = await import('three')
				const w = window.innerWidth
				const h = window.innerHeight
				const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
				renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
				renderer.setSize(w, h)
				renderer.domElement.style.position = 'absolute'
				renderer.domElement.style.inset = '0'
				const scene = new THREE.Scene()
				const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
				camera.position.z = 6

				// starfield
				const count = 1200
				const positions = new Float32Array(count * 3)
				for (let i = 0; i < count * 3; i += 3) {
					positions[i] = (Math.random() - 0.5) * 40
					positions[i + 1] = (Math.random() - 0.5) * 40
					positions[i + 2] = (Math.random() - 0.5) * 40
				}
				const geo = new THREE.BufferGeometry()
				geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
				const mat = new THREE.PointsMaterial({ color: 0x3b82f6, size: 0.03, transparent: true, opacity: 0.6 })
				const points = new THREE.Points(geo, mat)
				scene.add(points)

				let rafId
				const animate = () => {
					rafId = requestAnimationFrame(animate)
					points.rotation.x += 0.0009
					points.rotation.y += 0.0012
					renderer.render(scene, camera)
				}

				if (bgRef.current) {
					bgRef.current.innerHTML = ''
					bgRef.current.appendChild(renderer.domElement)
				}
				animate()

				const onResize = () => {
					const nw = window.innerWidth, nh = window.innerHeight
					renderer.setSize(nw, nh)
					camera.aspect = nw / nh
					camera.updateProjectionMatrix()
				}
				window.addEventListener('resize', onResize)

				cleanup = () => {
					cancelAnimationFrame(rafId)
					window.removeEventListener('resize', onResize)
					bgRef.current && (bgRef.current.innerHTML = '')
					geo.dispose()
					mat.dispose()
					renderer.dispose()
				}
			} catch (e) {
				console.warn('Three.js not available, skipping background.', e)
			}
		})()
		return cleanup
	}, [])

	useEffect(() => {
		;(async () => {
			try {
				const { default: gsap } = await import('gsap');
				const targets = document.querySelectorAll('.reveal');
				if (targets.length) {
					gsap.from('.reveal', { y: 24, opacity: 0, stagger: 0.08, duration: 0.6, ease: 'power2.out' });
				}
			} catch {}
		})()
	}, [])

	async function handleTest() {
		console.log("Testing Gemini API...");
		setLoading(true)
		try {
			const response = await getContent();
		
			const data = response?.candidates?.[0]?.content?.parts?.[0]?.text
			if (!data) {
				console.error('No text in Gemini response', response)
				alert('No response from Gemini')
				return
			}

			setGeminiResponse(data)
			setLoading(false)
		
			router.push('/results')
		} catch (err) {
			console.error(err)
			alert('Gemini request failed')
		}
	 }

	// Add state for file, note, preview, etc. (move from UploadForm to here)
	const [file, setFile] = useState(null);
	const [note, setNote] = useState('');
	const [preview, setPreview] = useState(null);
	const [success, setSuccess] = useState(false);

	// Remove file/note/preview from UploadForm props if you pass them

	const submit = useCallback(async () => {
		if (!file || loading) return
		setLoading(true)
		try {
			setGeminiResponse(null)
			const fd = new FormData()
			fd.append('scan', file)
			fd.append('note', note || '')
			const res = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
			const diagnosis = (res.data?.diagnosis || 'Unknown').trim()
			const noDisease = /^no[\s_]/i.test(diagnosis)
			const baseResult = { ...res.data, noDisease, file, runId: Date.now() }

			if (noDisease) {
				setLastResult(baseResult)
				router.push('/results')
			} else {
				setGeminiLoading(true)
				try {
					const geminiRes = await getContent(baseResult)
						const geminiText = extractGeminiText(geminiRes) || 'No Gemini response'
						setGeminiResponse(geminiText)
						setLastResult({ ...baseResult, gemini: geminiRes })
				} catch {
					setGeminiResponse('Gemini request failed.')
					setLastResult({ ...baseResult, gemini: { error: 'Gemini request failed.' } })
				} finally {
					setGeminiLoading(false)
					router.push('/results')
				}
			}
		} catch (e) {
			console.error(e)
			alert('Upload failed')
		} finally {
			setLoading(false)
		}
	}, [file, note, loading, setGeminiResponse, setLastResult, router, getContent, setGeminiLoading])

	return (
		<div
			className={`min-h-screen flex flex-col relative font-sans ${
				theme === 'dark'
					? 'bg-primary-dark text-primary'
					: 'bg-gradient-to-br from-[#f1f5f9] via-[#e0e7ef] to-[#bae6fd] text-[#334155]'
			}`}
			style={
				theme === 'light'
					? {
						backgroundImage:
							'radial-gradient(800px 400px at 10% 0%, rgba(14,165,233,0.12), transparent 60%), radial-gradient(700px 360px at 90% 8%, rgba(34,211,238,0.10), transparent 60%), linear-gradient(120deg, #e0f2fe 0%, #f0f9ff 60%, #bae6fd 100%)',
						backgroundBlendMode: 'screen, screen, normal'
					}
					: {
						backgroundImage:
							'radial-gradient(1000px 480px at 10% 0%, rgba(34,211,238,0.08), transparent 60%), radial-gradient(900px 420px at 90% 6%, rgba(14,165,233,0.08), transparent 60%), linear-gradient(120deg, #0b0f1a 0%, #0f172a 60%, #0a1220 100%)',
						backgroundBlendMode: 'screen, screen, normal'
					}
			}
			onMouseMove={onMouseMove}
		>
			{/* animated background */}
			<div
				ref={bgRef}
				className={`pointer-events-none fixed inset-0 -z-10 transition-colors duration-500 ${
					theme === 'dark' ? 'bg-black' : 'bg-transparent'
				}`}
				style={{
					opacity: theme === 'light' ? 0.98 : 0.96,
					filter: 'blur(0.5px)'
				}}
			/>
			{/* vignette overlay */}
			<div
				className="pointer-events-none fixed inset-0 -z-10"
				style={{
					background:
						'radial-gradient(1200px 800px at 50% 10%, rgba(2,6,23,0.08), transparent 70%)'
				}}
			/>

			{loading && (
				<div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50">
					<Loader />
				</div>
			)}

			<main className="flex-1 w-full flex flex-col items-center justify-center px-6 py-12 mx-auto">
				<motion.div
					className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-12"
					initial="hidden"
					animate="visible"
					variants={{
						hidden: {},
						visible: { transition: { staggerChildren: 0.22 } }
					}}
				>
					{/* Left: MedScan AI info */}
					<motion.div
						className="flex-1 flex flex-col items-center lg:items-start justify-center transition-all duration-300"
						whileHover={{ y: -4, rotate: -1 }}
						whileTap={{ rotate: 0.5 }}
						initial={{ opacity: 0, x: -80, rotate: -5 }}
						animate={{ opacity: 1, x: 0, rotate: 0 }}
						transition={{ type: "spring", stiffness: 120, damping: 18 }}
					>
						<motion.h1
							className="reveal text-4xl md:text-5xl font-extrabold text-cyan-300 mb-4 tracking-tight drop-shadow text-center lg:text-left"
							initial={{ opacity: 0, y: -40, letterSpacing: "-0.1em" }}
							animate={{ opacity: 1, y: 0, letterSpacing: "0.05em" }}
							transition={{ delay: 0.1, duration: 0.8, type: "spring", bounce: 0.4 }}
						>
							{[..."MedScan AI"].map((char, i) => (
								<motion.span
									key={i}
									initial={{ opacity: 0, y: -20, rotate: -10 }}
									animate={{ opacity: 1, y: 0, rotate: 0 }}
									transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 200, damping: 12 }}
									className="inline-block"
									whileHover={{ color: "#67e8f9", rotate: 3 }}
								>
									{char === " " ? "\u00A0" : char}
								</motion.span>
							))}
						</motion.h1>
						<motion.p
							className="reveal max-w-2xl text-lg md:text-xl text-zinc-300 mb-4 text-center lg:text-left"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
							whileHover={{ color: "#a5f3fc", letterSpacing: "0.04em" }}
						>
							{[..."AI-powered scan analysis and instant health guidance."].map((char, i) => (
								<motion.span
									key={i}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.6 + i * 0.012, type: "spring", stiffness: 120, damping: 14 }}
									className="inline-block"
									whileHover={{ color: "#67e8f9" }}
								>
									{char === " " ? "\u00A0" : char}
								</motion.span>
							))}
						</motion.p>
						<motion.div
							className="reveal border rounded-xl shadow-2xl p-6 max-w-lg transition-all duration-300 hover:shadow-cyan-900/20 hover:border-cyan-400"
							initial={{ opacity: 0, y: 60, rotate: 2 }}
							animate={{ opacity: 1, y: 0, rotate: 0 }}
							transition={{ delay: 0.7, duration: 0.7, type: "spring" }}
							whileHover={{
								boxShadow: theme === 'dark'
									? "0 8px 32px 0 #22d3eecc"
									: "0 8px 32px 0 #bae6fdcc",
								borderColor: theme === 'dark'
									? "#22d3ee"
									: "#38bdf8",
								rotate: -1
							}}
						>
							<motion.h3
								className={`text-xl font-semibold mb-2 ${
									theme === 'dark' ? 'text-accent-blue drop-shadow-lg' : 'text-sky-700'
								}`}
								initial={{ opacity: 0, x: -30 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: 0.8, duration: 0.5 }}
								whileHover={{ color: theme === 'dark' ? "#67e8f9" : "#0ea5e9" }}
							>
								Why MedScan AI?
							</motion.h3>
							<motion.ul
								className="list-disc pl-6 space-y-1"
								initial="hidden"
								animate="visible"
								variants={{
									hidden: {},
									visible: { transition: { staggerChildren: 0.13 } }
								}}
							>
								{[
									"Instant, AI-powered scan analysis",
									"Personalized health guidance",
									"Data privacy and security by design",
									"Easy-to-use, accessible anywhere"
								].map((item, i) => (
									<motion.li
										key={i}
										initial={{ opacity: 0, x: -24 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.4, delay: 1 + i * 0.13 }}
										className={`transition-colors duration-300 ${
											theme === 'dark'
												? 'hover:text-accent-teal text-primary'
												: 'hover:text-sky-700 text-[#334155]'
										}`}
										whileHover={{
											color: theme === 'dark' ? "#67e8f9" : "#0ea5e9",
											x: 8
										}}
									>
										{item}
									</motion.li>
								))}
							</motion.ul>
							<motion.div
								className={`mt-4 text-sm ${
									theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'
								}`}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1.6, duration: 0.5 }}
								whileHover={{
									color: theme === 'dark' ? "#a5f3fc" : "#0ea5e9"
								}}
							>
								<b>Note:</b> This is a demo. No real medical advice is provided.
							</motion.div>
						</motion.div>
					</motion.div>
					{/* Right: Upload Form */}
					<motion.div
						className="flex-1 flex items-center justify-center w-full"
						whileHover={{ y: -2, boxShadow: "0 8px 32px 0 #22d3ee44", rotate: 1 }}
						whileTap={{ rotate: -1 }}
						initial={{ opacity: 0, x: 80, rotate: 5 }}
						animate={{ opacity: 1, x: 0, rotate: 0 }}
						transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.3 }}
					>
						<UploadForm
							file={file}
							setFile={setFile}
							note={note}
							setNote={setNote}
							preview={preview}
							setPreview={setPreview}
							success={success}
							setSuccess={setSuccess}
							loading={loading}
							setLoading={setLoading}
							submit={submit}
						/>
					</motion.div>
				</motion.div>
			</main>
		</div>
	)
}
