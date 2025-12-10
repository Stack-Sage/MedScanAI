'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobal } from '../context/GlobalContext'
import axios from 'axios'
import Tooltip from './Tooltip'
import { extractGeminiText } from '../api/upload/gemini'
import Content from './content'

export default function UploadForm(props) {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { setLastResult, setGeminiResponse, setGeminiLoading } = useGlobal()
  const router = useRouter()
  const previewRef = useRef(null)
  const MAX_SIZE = 10 * 1024 * 1024
  const [visible, setVisible] = useState(false)
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.size > MAX_SIZE) {
        alert('File too large. Max 10MB.');
        return;
      }
      setFile(f);
    }
  }, [MAX_SIZE]);

  const onFile = useCallback((e) => {
    const f = e.target.files?.[0] || null;
    if (f && f.size > MAX_SIZE) {
      alert('File too large. Max 10MB.');
      e.currentTarget.value = '';
      return;
    }
    setFile(f);
  }, [MAX_SIZE]);

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
        'https://medscanbackend.onrender.com/predict',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      const predictData = predictRes.data
      const label = (predictData.label || "Unknown").trim()
      const noDisease = /^no[\s_]/i.test(label)
      const baseResult = {
        diagnosis: label,
        confidence: predictData.confidence || 0,
        meta: { filename: predictData.filename },
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
          // Handle Gemini API error response
          if (geminiRes?.error) {
            setGeminiResponse(geminiRes.error)
            setLastResult({ ...baseResult, gemini: { error: geminiRes.error } })
          } else {
            const geminiText = extractGeminiText(geminiRes) || 'No Gemini response'
            setGeminiResponse(geminiText)
            setLastResult({ ...baseResult, gemini: geminiRes })
          }
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
  }, [file, setLastResult, router, loading, setGeminiResponse, setGeminiLoading])

  // Remove theme for light/dark styling
  // const { theme } = require('../context/ThemeContext').useTheme();
  const theme = 'dark';

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className={`relative rounded-2xl shadow-md shadow-black/40 p-8 flex flex-col gap-6 border border-border-primary bg-secondary-dark text-primary transition-all duration-700 ease-out overflow-hidden
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}
        style={{
          boxShadow: '0 8px 32px 0 #0008, 0 1.5px 8px 0 #4fc3f733',
          background: '#1a1e2c',
          borderColor: '#2a2f3e',
          color: '#e0e6f2'
        }}
      >
        {/* Success animation */}
        {success && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 rounded-2xl">
            <div className="flex flex-col items-center">
              <svg width="64" height="64" fill="none" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="30" stroke="#38bdf8" strokeWidth="4" fill="#0ea5e9" />
                <path
                  d="M20 34l8 8 16-16"
                  stroke="#fff"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-2 text-lg font-bold text-blue-100">Uploaded!</div>
            </div>
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold mb-2 text-accent-blue">Upload your scan</h2>
          <p className="text-sm mb-4 text-primary/80">
            Supported: <span className="font-medium">PNG, JPG, DICOM</span> (converted). Max size 10MB.
          </p>
        </div>
        {/* Drag and drop area */}
        <div
          className={`relative mt-2 mb-4`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <Tooltip text="Upload a scan image (PNG, JPG, DICOM). Max 10MB. You can drag & drop here.">
            <label
              htmlFor="file-upload"
              className={`block w-full cursor-pointer rounded-lg border border-dashed border-accent-blue bg-secondary-dark p-0 transition duration-300 flex flex-col items-center justify-center min-h-[70px] relative`}
              style={{
                borderWidth: dragActive ? '2px' : '1px',
                background: dragActive ? '#164e63' : '#1a1e2c',
                boxShadow: dragActive ? '0 0 0 4px #60a5fa44' : undefined
              }}
            >
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={onFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                style={{ zIndex: 2 }}
              />
              {!file ? (
                <span className="flex flex-col items-center justify-center w-full h-full py-6 text-sm text-accent-blue font-semibold select-none pointer-events-none">
                  <svg width="32" height="32" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24" className="mb-2">
                    <path d="M12 16v-8m0 0l-4 4m4-4l4 4" />
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                  </svg>
                  Drag & drop or <span className="underline">choose file</span>
                  <span className="mt-1 text-xs text-primary/70">No file chosen</span>
                </span>
              ) : (
                <span className="flex flex-col items-center justify-center w-full h-full py-6 text-sm text-accent-blue font-semibold select-none pointer-events-none">
                  <svg width="32" height="32" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24" className="mb-2">
                    <path d="M12 16v-8m0 0l-4 4m4-4l4 4" />
                    <rect x="4" y="4" width="16" height="16" rx="4" />
                  </svg>
                  <span className="text-xs text-primary/80">File selected: {file.name}</span>
                </span>
              )}
            </label>
          </Tooltip>
        </div>
        {/* File preview */}
        {preview && (
          <div className="mt-4">
            <div className="text-sm text-primary/80 mb-2">Preview:</div>
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-[300px] rounded-lg border border-border-primary shadow-md"
                style={{ objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-4">
          <button
            onClick={submit}
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2
              ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-accent-blue hover:bg-accent-blue/90'}
            `}
          >
            {loading && (
              <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path d="M4 12h16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            )}
            {loading ? 'Uploading...' : 'Upload and Analyze'}
          </button>
        </div>
      </div>
    </div>
  )
}
