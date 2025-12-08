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
			style={{
				background: theme === 'dark'
					? 'linear-gradient(120deg, #0f111a 0%, #1a1e2c 100%)'
					: 'linear-gradient(120deg, #f1f5f9 0%, #e0e7ef 60%, #bae6fd 100%)'
			}}
			onMouseMove={onMouseMove}
		>
			{/* animated background */}
			<div
				ref={bgRef}
				className="pointer-events-none fixed inset-0 -z-10"
				style={{
					background: theme === 'dark'
						? 'linear-gradient(120deg, #0f111a 0%, #1a1e2c 100%)'
						: 'linear-gradient(120deg, #f1f5f9 0%, #e0e7ef 60%, #bae6fd 100%)'
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
						className={`flex-1 flex flex-col items-center lg:items-start justify-center transition-all duration-300 ${
							theme === 'dark'
								? 'bg-secondary-dark border border-border-primary rounded-2xl p-8 shadow-md shadow-black/40'
								: 'bg-white border border-[#bae6fd] rounded-2xl p-8 shadow-md shadow-[#bae6fd]/40'
						}`}
						initial={{ opacity: 0, x: -80 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ type: "spring", stiffness: 120, damping: 18 }}
					>
						<motion.h1
							className={`reveal text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow text-center lg:text-left ${
								theme === 'dark' ? 'text-accent-blue' : 'text-sky-700'
							}`}
							initial={{ opacity: 0, y: -40, scale: 0.9, letterSpacing: "-0.1em" }}
							animate={{ opacity: 1, y: 0, scale: 1, letterSpacing: "0.05em" }}
							transition={{ delay: 0.1, duration: 0.8, type: "spring", bounce: 0.4 }}
						>
							{[..."MedScan AI"].map((char, i) => (
								<motion.span
									key={i}
									initial={{ opacity: 0, y: -20, scale: 0.8, rotate: -10 }}
									animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
									transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 200, damping: 12 }}
									className="inline-block"
								>
									{char === " " ? "\u00A0" : char}
								</motion.span>
							))}
						</motion.h1>
						<motion.p
							className={`reveal max-w-2xl text-lg md:text-xl mb-4 text-center lg:text-left ${
								theme === 'dark' ? 'text-primary/90' : 'text-sky-900/90'
							}`}
							initial={{ opacity: 0, y: 30, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
						>
							{[..."AI-powered scan analysis and instant health guidance."].map((char, i) => (
								<motion.span
									key={i}
									initial={{ opacity: 0, y: 10, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									transition={{ delay: 0.6 + i * 0.012, type: "spring", stiffness: 120, damping: 14 }}
									className="inline-block"
								>
									{char === " " ? "\u00A0" : char}
								</motion.span>
							))}
						</motion.p>
						<motion.div
							className={`reveal border rounded-xl shadow-2xl p-6 max-w-lg transition-all duration-300 ${
								theme === 'dark'
									? 'bg-secondary-dark border-border-primary text-primary'
									: 'bg-white border-[#bae6fd] text-[#334155]'
							}`}
							initial={{ opacity: 0, y: 60, scale: 0.97 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							transition={{ delay: 0.7, duration: 0.7, type: "spring" }}
						>
							<motion.h3
								className={`text-xl font-semibold mb-2 ${
									theme === 'dark' ? 'text-accent-blue drop-shadow-lg' : 'text-sky-700'
								}`}
								initial={{ opacity: 0, x: -30, scale: 0.9 }}
								animate={{ opacity: 1, x: 0, scale: 1 }}
								transition={{ delay: 0.8, duration: 0.5 }}
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
										initial={{ opacity: 0, x: -24, scale: 0.9 }}
										animate={{ opacity: 1, x: 0, scale: 1 }}
										transition={{ duration: 0.4, delay: 1 + i * 0.13 }}
										className={`transition-colors duration-300 ${
											theme === 'dark'
												? 'hover:text-accent-teal text-primary'
												: 'hover:text-sky-700 text-[#334155]'
										}`}
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
							>
								<b>Note:</b> This is a demo. No real medical advice is provided.
							</motion.div>
						</motion.div>
					</motion.div>
					{/* Right: Upload Form */}
					<motion.div
						className={`flex-1 flex items-center justify-center w-full ${
							theme === 'dark'
								? 'bg-secondary-dark border border-border-primary shadow-md shadow-black/40 rounded-2xl p-8'
								: 'bg-white border border-[#bae6fd] shadow-md shadow-[#bae6fd]/40 rounded-2xl p-8'
						}`}
						initial={{ opacity: 0, x: 80 }}
						animate={{ opacity: 1, x: 0 }}
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
