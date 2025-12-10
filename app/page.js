'use client'
import { useState, useEffect, useRef, useCallback } from "react"
import React from "react"
import Hero from "./components/home/Hero"
import Features from "./components/home/Features"
import Footer from "./components/home/Footer"
import UploadForm from "./components/UploadForm"
import ResultCard from "./components/results/ResultCard"
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
					points.rotation.x += 0.0012 // slightly faster
					points.rotation.y += 0.0017
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
					gsap.from('.reveal', { y: 16, opacity: 0, stagger: 0.04, duration: 0.35, ease: 'power2.out' });
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
			className="min-h-screen flex flex-col relative font-sans bg-[#10151c] text-[#e0e7ef]"
			style={{
				background: `
					radial-gradient(ellipse 120% 80% at 50% 10%, #1e293b 0%, #0f172a 70%, #10151c 100%),
					linear-gradient(120deg, #0f111a 0%, #1a1e2c 100%)
				`,
				overflow: 'hidden'
			}}
		>
			{/* animated background */}
			<div
				ref={bgRef}
				className="pointer-events-none fixed inset-0 -z-10"
				style={{
					background: `
						radial-gradient(ellipse 80% 60% at 60% 0%, #38bdf8cc 0%, #0f172a00 70%),
						radial-gradient(ellipse 60% 40% at 20% 100%, #0ea5e9bb 0%, #0f172a00 70%),
						linear-gradient(120deg, #0f111a 0%, #1a1e2c 100%)
					`
				}}
			/>
			{/* glossy overlay */}
			<div className="fixed inset-0 pointer-events-none z-0" style={{
				background: "linear-gradient(120deg, #bae6fd22 0%, #0ea5e922 100%)",
				backdropFilter: "blur(8px)",
				WebkitBackdropFilter: "blur(8px)",
				mixBlendMode: "screen",
				opacity: 0.35
			}} />

			{loading && (
				<div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50">
					<Loader />
				</div>
			)}

			<main className="flex-1 w-full flex flex-col items-center justify-center px-6 py-12 mx-auto">
				<div className="w-full max-w-5xl flex flex-col lg:flex-row items-center justify-center gap-12">
					{/* Left: MedScan AI info */}
					<div
						className="flex-1 flex flex-col items-center lg:items-start justify-center transition-all duration-200 bg-gradient-to-br from-[#23272f]/90 via-[#164e63]/80 to-[#0ea5e9]/60 border border-[#164e63] rounded-2xl p-8 shadow-2xl shadow-[#38bdf855] backdrop-blur-xl"
						style={{
							boxShadow: "0 8px 32px 0 #38bdf855, 0 1.5px 8px 0 #0ea5e944",
							border: "1.5px solid #164e63",
							background: "linear-gradient(135deg, #23272f 60%, #164e63 100%)",
							backdropFilter: "blur(12px)",
							WebkitBackdropFilter: "blur(12px)"
						}}
					>
						<h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight drop-shadow text-center lg:text-left text-[#60a5fa] bg-gradient-to-r from-[#60a5fa] via-[#bae6fd] to-[#0ea5e9] bg-clip-text text-transparent">
							MedScan AI
						</h1>
						<p
							className="max-w-2xl text-lg md:text-xl mb-4 text-center lg:text-left text-[#e0e7ef] drop-shadow"
							style={{
								textShadow: "0 2px 12px #0ea5e988"
							}}
						>
							AI-powered scan analysis and instant health guidance.
						</p>
						<div
							className="border rounded-xl shadow-2xl p-6 max-w-lg bg-gradient-to-br from-[#23272f]/90 via-[#164e63]/80 to-[#0ea5e9]/60 border-[#164e63] text-[#e0e7ef] backdrop-blur-lg"
							style={{
								boxShadow: "0 8px 32px 0 #38bdf855, 0 1.5px 8px 0 #0ea5e944",
								background: "linear-gradient(135deg, #23272f 60%, #164e63 100%)",
								backdropFilter: "blur(8px)",
								WebkitBackdropFilter: "blur(8px)"
							}}
						>
							<h3 className="text-xl font-semibold mb-2 text-[#60a5fa] drop-shadow-lg">
								Why MedScan AI?
							</h3>
							<ul className="list-disc pl-6 space-y-1">
								<li className="transition-colors duration-200 hover:text-[#bae6fd] text-[#e0e7ef]" style={{ textShadow: "0 1px 8px #0ea5e988" }}>
									Instant, AI-powered scan analysis
								</li>
								<li className="transition-colors duration-200 hover:text-[#bae6fd] text-[#e0e7ef]" style={{ textShadow: "0 1px 8px #0ea5e988" }}>
									Personalized health guidance
								</li>
								<li className="transition-colors duration-200 hover:text-[#bae6fd] text-[#e0e7ef]" style={{ textShadow: "0 1px 8px #0ea5e988" }}>
									Data privacy and security by design
								</li>
								<li className="transition-colors duration-200 hover:text-[#bae6fd] text-[#e0e7ef]" style={{ textShadow: "0 1px 8px #0ea5e988" }}>
									Easy-to-use, accessible anywhere
								</li>
							</ul>
							<div className="mt-4 text-sm text-[#60a5fa]">
								<b>Note:</b> This is a demo. No real medical advice is provided.
							</div>
						</div>
					</div>
					{/* Right: Upload Form */}
					<div
						className="flex-1 flex items-center justify-center w-full bg-gradient-to-br from-[#23272f]/90 via-[#164e63]/80 to-[#0ea5e9]/60 border border-[#164e63] shadow-2xl shadow-[#38bdf855] rounded-2xl p-8 backdrop-blur-xl"
						style={{
							boxShadow: "0 8px 32px 0 #38bdf855, 0 1.5px 8px 0 #0ea5e944",
							border: "1.5px solid #164e63",
							background: "linear-gradient(135deg, #23272f 60%, #164e63 100%)",
							backdropFilter: "blur(12px)",
							WebkitBackdropFilter: "blur(12px)"
						}}
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
					</div>
				</div>
			</main>
		</div>
	)
}
