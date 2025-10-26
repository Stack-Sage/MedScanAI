'use client'
import React from "react"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 bg-gradient-to-br from-cream-100 via-blue-50 to-blue-100">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">About MedScan AI</h1>
      <p className="max-w-xl text-lg text-zinc-700 mb-4">
        MedScan AI is an advanced platform for analyzing MRI and ultrasound scans using state-of-the-art AI models.
      </p>
      <div className="bg-white border border-blue-100 rounded-xl shadow p-6 max-w-lg text-zinc-700">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Why MedScan AI?</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Instant, AI-powered scan analysis</li>
          <li>Personalized health guidance</li>
          <li>Data privacy and security by design</li>
          <li>Easy-to-use, accessible anywhere</li>
        </ul>
        <div className="mt-4 text-sm text-zinc-500">
          <b>Note:</b> This is a demo. No real medical advice is provided.
        </div>
      </div>
    </div>
  )
}
