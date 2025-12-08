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
        'https://ibmprojectbackend-production.up.railway.app/api/predict',
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
        // remove scale from entry
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className={`relative rounded-2xl shadow-md p-6 flex flex-col gap-4 border transition-all duration-700 ease-out overflow-hidden
          ${theme === 'dark'
            ? 'bg-[#18181b] border-[#164e63] text-[#e0e7ef]'
            : 'bg-white border-[#bae6fd] text-[#334155]'
          }
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
        style={{
          boxShadow: theme === 'dark' ? '0 8px 32px 0 #0008, 0 1.5px 8px 0 #4fc3f733' : '0 8px 32px 0 #bae6fd44',
          background: undefined,
          borderColor: undefined,
          color: undefined
        }}
      >
        {/* Success animation */}
        <AnimatePresence>
          {success && (
            <motion.div
              // remove scale from success overlay
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl"
            >
              <motion.div
                // remove scale from inner success icon container
                initial={{}}
                animate={{}}
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
          <h2 className={`text-xl font-bold mb-1 ${
            theme === 'dark' ? 'text-cyan-300' : 'text-sky-700'
          }`}>Upload your scan</h2>
          <p className={`text-sm mb-2 ${
            theme === 'dark' ? 'text-[#e0e7ef]' : 'text-sky-900/80'
          }`}>
            Supported: <span className="font-medium">PNG, JPG, DICOM</span> (converted). Max size 10MB.
          </p>
          <motion.div
            // remove scale from whileInView
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
            className={`border rounded-lg p-3 mb-2 text-sm shadow ${
              theme === 'dark'
                ? 'bg-[#18181b] border-[#164e63] text-[#e0e7ef] shadow-black/20'
                : 'bg-white border-[#bae6fd] text-[#334155] shadow-[#bae6fd]/20'
            }`}
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <b>Demo:</b> You can upload any image file for a simulated AI analysis.<br />
            <span className={theme === 'dark' ? 'text-cyan-300' : 'text-sky-700'}>Your data is never stored permanently.</span>
          </motion.div>
        </motion.div>
        {/* Floating label input with tooltip */}
        <div className="relative mt-2">
          <Tooltip text="Upload a scan image (PNG, JPG, DICOM). Max 10MB.">
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className={`peer block w-full mt-1 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 transition duration-300 ${
                theme === 'dark'
                  ? 'bg-[#18181b] border-[#164e63] text-[#e0e7ef] focus:ring-cyan-300 focus:border-cyan-300'
                  : 'bg-white border-[#bae6fd] text-[#334155] focus:ring-[#60a5fa] focus:border-[#60a5fa]'
              }`}
            />
          </Tooltip>
          <label className={`absolute left-2 -top-4 text-xs transition-all peer-focus:-top-5 ${
            theme === 'dark' ? 'text-cyan-300 peer-focus:text-cyan-400' : 'text-[#164e63] peer-focus:text-[#60a5fa]'
          }`}>
            Scan file
          </label>
        </div>
        {preview && (
          <motion.img
            src={preview}
            alt="preview"
            className={`rounded-lg border max-w-[180px] max-h-[180px] mx-auto my-2 shadow-lg object-contain ${
              theme === 'dark' ? 'border-[#164e63] bg-[#18181b]' : 'border-[#bae6fd] bg-white'
            }`}
            // remove scale from image entry
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
              className={`peer w-full mt-1 rounded-lg border p-3 focus:outline-none focus:ring-2 transition duration-300 min-h-[80px] ${
                theme === 'dark'
                  ? 'border-[#164e63] bg-[#18181b] text-[#e0e7ef] focus:ring-cyan-300 focus:border-cyan-300'
                  : 'border-[#bae6fd] bg-white text-[#334155] focus:ring-[#60a5fa] focus:border-[#60a5fa]'
              }`}
              style={{ boxShadow: '0 1px 8px 0 #0008', backdropFilter: 'blur(4px)' }}
            />
          </Tooltip>
          <label className={`absolute left-2 top-2 text-xs pointer-events-none transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-xs peer-focus:-top-4 ${
            theme === 'dark' ? 'text-cyan-300 peer-focus:text-cyan-400' : 'text-[#164e63] peer-focus:text-[#60a5fa]'
          }`}>
            Additional info
          </label>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <Tooltip text="Submit your scan for instant AI analysis.">
            <motion.button
              whileTap={{ scale: 0.95, backgroundColor: theme === 'dark' ? "#00bfa5" : "#60a5fa" }}
              whileHover={{
                scale: 1.05,
                backgroundColor: theme === 'dark' ? "#4fc3f7" : "#bae6fd",
                boxShadow: theme === 'dark'
                  ? "0 0 0 6px #4fc3f755"
                  : "0 0 0 4px #bae6fd55"
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out shadow-md ${
                theme === 'dark'
                  ? 'bg-cyan-300 text-[#18181b] hover:bg-cyan-400 shadow-cyan-300/30'
                  : 'bg-[#bae6fd] text-[#334155] hover:bg-[#60a5fa] shadow-[#bae6fd]/30'
              }`}
              style={{ boxShadow: theme === 'dark' ? '0 2px 16px 0 #4fc3f733' : '0 2px 12px 0 #bae6fd44' }}
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
          <span className={`text-xs ${theme === 'dark' ? 'text-[#e0e7ef]' : 'text-sky-700/80'}`}>
            Your scan is processed securely and never shared.
          </span>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <Tooltip text="Need help? Click for upload tips.">
            <button
              className={`text-xs underline transition-colors duration-200 ${
                theme === 'dark' ? 'text-cyan-300 hover:text-cyan-400' : 'text-[#164e63] hover:text-[#60a5fa]'
              }`}
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
