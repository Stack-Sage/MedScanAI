'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobal } from '../context/GlobalContext'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Tooltip from './Tooltip'
import { extractGeminiText } from '../api/upload/gemini'
import Content from './content'

export default function UploadForm(props) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [success, setSuccess] = useState(false)
  const { setLastResult, setGeminiResponse, setGeminiLoading } = useGlobal()
  const router = useRouter()
  const previewRef = useRef(null)
  const MAX_SIZE = 10 * 1024 * 1024
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const onFile = useCallback((e) => {
    const f = e.target.files?.[0] || null
    if (f && f.size > MAX_SIZE) {
      alert('File too large. Max 10MB.')
      e.currentTarget.value = ''
      return
    }
    setFile(f)
  }, [])

  useEffect(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = null
    }
    if (file) {
      const url = URL.createObjectURL(file)
      previewRef.current = url
      setPreview(url)
    } else {
      setPreview(null)
    }
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = null
      }
    }
  }, [file])

  const submit = useCallback(async () => {
    if (!file || loading) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('scan', file)
      const predictRes = await axios.post(
        'https://medscanaibackend-production.up.railway.app/api/predict',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      const predictData = predictRes.data
      const label = (predictData.label || "Unknown").trim()
      const noDisease = /^no[\s_]/i.test(label)
      const baseResult = {
        diagnosis: label,
        confidence: predictData.confidence || 0,
        meta: { filename: predictData.filename, note: note || "" },
        summary: `AI detected: ${label} (confidence: ${predictData.confidence}%)`,
        noDisease,
        file,
        runId: Date.now()
      }

      setGeminiResponse(null)

      if (noDisease) {
        setLastResult(baseResult)
        router.push('/results')
      } else {
        setGeminiLoading(true)
        try {
          const { getContent } = Content()
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

      setSuccess(true)
      setTimeout(() => setSuccess(false), 1800)
    } catch (e) {
      console.error(e)
      alert('Upload failed')
    } finally {
      setLoading(false)
    }
  }, [file, note, setLastResult, router, loading, setGeminiResponse, setGeminiLoading])

  // Use theme for light/dark styling
  const { theme } = require('../context/ThemeContext').useTheme();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`relative rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border transition-all duration-700 ease-out overflow-hidden
          ${theme === 'dark'
            ? 'bg-gradient-to-br from-[#101624] via-[#18181b] to-[#0e172a] border-cyan-800 text-cyan-100 backdrop-blur-lg'
            : 'bg-gradient-to-br from-white via-sky-100 to-blue-100 border-sky-200 text-sky-900 backdrop-blur-[2px]'}
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
        style={
          theme === 'dark'
            ? {
                boxShadow: '0 8px 32px 0 #0ea5e9cc, 0 1.5px 8px 0 #22d3ee77',
                backgroundImage: 'linear-gradient(120deg, #101624 0%, #18181b 60%, #0e172a 100%)',
                backgroundBlendMode: 'screen',
                borderColor: '#0ea5e9',
                color: '#e0f2fe'
              }
            : {
                boxShadow: '0 8px 32px 0 #bae6fdcc, 0 1.5px 8px 0 #7dd3fcbb',
                backgroundImage: 'linear-gradient(120deg, #f0f9ff 0%, #bae6fd 100%)',
                backgroundBlendMode: 'normal'
              }
        }
        whileHover={{
          scale: 1.04,
          boxShadow: theme === 'dark'
            ? "0 12px 40px 0 #22d3eecc, 0 1.5px 8px 0 #0ea5e9cc"
            : "0 8px 32px 0 #22d3ee44"
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Animated border glow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
          className={`pointer-events-none absolute -inset-1 rounded-2xl z-0 ${
            theme === 'dark'
              ? ''
              : 'bg-gradient-to-br from-blue-100 via-sky-100 to-white'
          }`}
          style={{
            background: theme === 'dark'
              ? "radial-gradient(circle at 60% 40%, #0ea5e9 0%, #101624 80%, #09090b 100%)"
              : "radial-gradient(circle at 60% 40%, #bae6fd 0%, #f0f9ff 60%, transparent 100%)",
            filter: "blur(24px)",
            opacity: theme === 'light' ? 0.7 : 0.85
          }}
        />
        {/* Success animation */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl"
            >
              <motion.div
                initial={{ scale: 0.7 }}
                animate={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
                className="flex flex-col items-center"
              >
                <svg width="64" height="64" fill="none" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="30" stroke="#38bdf8" strokeWidth="4" fill="#0ea5e9" />
                  <motion.path
                    d="M20 34l8 8 16-16"
                    stroke="#fff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                  />
                </svg>
                <div className="mt-2 text-lg font-bold text-blue-100">Uploaded!</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
        >
          <h2 className="text-xl font-bold text-zinc-100 mb-1">Upload your scan</h2>
          <p className="text-sm text-zinc-400 mb-2">
            Supported: <span className="font-medium">PNG, JPG, DICOM</span> (converted). Max size 10MB.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            className={`border rounded-lg p-3 mb-2 text-sm ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-[#18181b]/80 to-[#0e172a]/80 border-cyan-800 text-cyan-100 shadow-cyan-900/30'
                : 'bg-white/80 border-sky-200 text-sky-900 shadow-blue-100/40'
            }`}
            style={theme === 'light' ? { backdropFilter: 'blur(2px)' } : { backdropFilter: 'blur(4px)' }}
          >
            <b>Demo:</b> You can upload any image file for a simulated AI analysis.<br />
            <span className="text-cyan-400">Your data is never stored permanently.</span>
          </motion.div>
        </motion.div>
        {/* Floating label input with tooltip */}
        <div className="relative mt-2">
          <Tooltip text="Upload a scan image (PNG, JPG, DICOM). Max 10MB.">
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className={`peer block w-full mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold transition-all duration-300 bg-transparent
                ${theme === 'dark'
                  ? 'text-cyan-100 file:bg-[#101624] file:text-cyan-100 hover:file:bg-cyan-900/60 focus:file:bg-cyan-800/60 border-cyan-800'
                  : 'text-sky-900 file:bg-blue-100 file:text-sky-900 hover:file:bg-sky-100 focus:file:bg-sky-50'}
              `}
              style={theme === 'dark'
                ? { boxShadow: '0 1px 8px 0 #0ea5e9cc', border: '1.5px solid #0891b2' }
                : { boxShadow: '0 1px 8px 0 #bae6fdcc' }
              }
            />
          </Tooltip>
          <label className={`absolute left-2 -top-4 text-xs transition-all peer-focus:-top-5 ${
            theme === 'dark' ? 'text-cyan-400 peer-focus:text-cyan-300' : 'text-sky-700 peer-focus:text-sky-900'
          }`}>
            Scan file
          </label>
        </div>
        {preview && (
          <motion.img
            src={preview}
            alt="preview"
            className={`rounded-lg border max-w-[180px] max-h-[180px] mx-auto my-2 shadow-lg object-contain ${
              theme === 'dark' ? 'border-cyan-800 bg-[#18181b]' : 'border-zinc-800'
            }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ opacity: visible ? 1 : 0 }}
          />
        )}
        {/* Floating label textarea with tooltip */}
        <div className="relative">
          <Tooltip text="Add any notes or symptoms for more accurate analysis.">
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder=" "
              className={`peer w-full mt-1 rounded-lg border p-2 placeholder-transparent resize-vertical min-h-[80px] focus:outline-none focus:ring-2 transition-all duration-300
                ${theme === 'dark'
                  ? 'border-cyan-800 bg-[#18181b]/60 text-cyan-100 focus:ring-cyan-400'
                  : 'border-sky-200 bg-white/80 text-sky-900 focus:ring-sky-300'}
              `}
              style={theme === 'dark'
                ? { boxShadow: '0 1px 8px 0 #0ea5e9cc', backdropFilter: 'blur(4px)' }
                : { boxShadow: '0 1px 8px 0 #bae6fdcc', backdropFilter: 'blur(2px)' }
              }
            />
          </Tooltip>
          <label className={`absolute left-2 top-2 text-xs pointer-events-none transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 peer-focus:text-xs ${
            theme === 'dark' ? 'text-cyan-400 peer-focus:text-cyan-300' : 'text-sky-700 peer-focus:text-sky-900'
          }`}>
            Additional info
          </label>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Tooltip text="Submit your scan for instant AI analysis.">
            <motion.button
              whileTap={{ scale: 0.95, backgroundColor: "#0e7490" }}
              whileHover={{
                scale: 1.09,
                backgroundColor: "#0891b2",
                boxShadow: theme === 'dark'
                  ? "0 0 0 6px #22d3ee55"
                  : "0 0 0 4px #22d3ee55"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`btn font-semibold py-2 rounded-lg transition-all duration-300 shadow-lg
                ${theme === 'dark'
                  ? 'bg-gradient-to-r from-cyan-700 via-cyan-800 to-cyan-900 hover:from-cyan-600 hover:to-cyan-800 text-white shadow-cyan-900/40 border border-cyan-400'
                  : 'bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-500 hover:from-sky-500 hover:to-blue-400 text-white shadow-blue-200/40 border border-sky-300'}
              `}
              style={theme === 'dark'
                ? { boxShadow: '0 2px 16px 0 #0ea5e9cc' }
                : { boxShadow: '0 2px 12px 0 #bae6fdcc' }
              }
              onClick={submit}
              disabled={loading || !file}
            >
              {loading ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block animate-spin mr-2"
                >⏳</motion.span>
              ) : 'Submit'}
            </motion.button>
          </Tooltip>
          <span className={`text-xs ${theme === 'dark' ? 'text-cyan-300' : 'text-sky-700'}`}>
            Your scan is processed securely and never shared.
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <Tooltip text="Need help? Click for upload tips.">
            <button
              className={`text-xs underline hover:text-cyan-400 transition-colors duration-200 ${theme === 'dark' ? 'text-cyan-300' : 'text-sky-700'}`}
              onClick={() => alert('Tips:\n- Upload clear scan images\n- Add notes for better results\n- Supported: PNG, JPG, DICOM\n- Max file size: 10MB')}
              type="button"
            >
              Need help with uploading?
            </button>
          </Tooltip>
        </div>
      </motion.div>
    </div>
  )
}
