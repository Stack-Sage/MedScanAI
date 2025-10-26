'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobal } from '../context/GlobalContext'
import axios from 'axios'
import { motion } from 'framer-motion'

export default function UploadForm() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const { setLastResult } = useGlobal()
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
      fd.append('scan', file)
      fd.append('note', note)
      const res = await axios.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setLastResult(res.data)
      router.push('/results')
    } catch (e) {
      console.error(e)
      alert('Upload failed')
    } finally {
      setLoading(false)
    }
  }, [file, note, setLastResult, router, loading])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className={`bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 border border-zinc-100 transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <motion.div
        initial={{ opacity: 0, x: -32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: 'easeOut' }}
      >
        <h2 className="text-xl font-bold text-blue-700 mb-1">Upload your scan</h2>
        <p className="text-sm text-zinc-600 mb-2">
          Supported: <span className="font-medium">PNG, JPG, DICOM</span> (converted). Max size 10MB.
        </p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.7 }}
          transition={{ duration: 0.6, delay: 0.25, ease: 'easeOut' }}
          className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-2 text-blue-700 text-sm"
        >
          <b>Demo:</b> You can upload any image file for a simulated AI analysis.<br />
          <span className="text-blue-500">Your data is never stored permanently.</span>
        </motion.div>
      </motion.div>
      <label className="block">
        <span className="text-zinc-700 text-sm font-medium">Scan file</span>
        <input
          type="file"
          accept="image/*"
          onChange={onFile}
          className="block w-full mt-1 text-sm text-zinc-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </label>
      {preview && (
        <motion.img
          src={preview}
          alt="preview"
          className="rounded-lg border border-zinc-200 max-w-xs mx-auto my-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ opacity: visible ? 1 : 0 }}
        />
      )}
      <label className="block">
        <span className="text-zinc-700 text-sm font-medium">Additional info</span>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add context (age, symptoms, relevant history)..."
          className="w-full mt-1 rounded-lg border border-zinc-200 bg-zinc-50 p-2 text-zinc-900 resize-vertical min-h-[80px]"
        />
      </label>
      <div className="flex flex-col gap-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="btn bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
          onClick={submit}
          disabled={loading || !file}
        >
          {loading ? 'Analyzing...' : 'Submit'}
        </motion.button>
        <span className="text-xs text-zinc-400">
          Your scan is processed securely and never shared.
        </span>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className="mt-4 text-xs text-zinc-500 border-t pt-3"
      >
        <b>Need help?</b> Email <a href="mailto:support@medscan.ai" className="text-blue-600 underline">support@medscan.ai</a>
        <br />
        <span className="italic">Try uploading a sample scan to see how MedScan AI works!</span>
      </motion.div>
    </motion.div>
  )
}
