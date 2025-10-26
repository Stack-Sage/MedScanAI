'use client'
import React from "react"
import ResultCard from "../components/results/ResultCard"

const dummyResults = [
  {
    diagnosis: "No abnormality detected",
    confidence: 98,
    summary: "Your scan appears normal. No signs of disease detected.",
    meta: { scanType: "MRI", date: "2024-06-01", patient: "John Doe", age: 34 }
  },
  {
    diagnosis: "Mild inflammation",
    confidence: 87,
    summary: "Some mild inflammation detected. Consult a specialist for further advice.",
    meta: { scanType: "Ultrasound", date: "2024-05-15", patient: "Jane Smith", age: 29 }
  }
]

export default function ResultsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream-100 via-blue-50 to-blue-100 font-sans">
      <main className="flex-1 flex flex-col items-center py-12 px-4 w-full">
        <h1 className="text-3xl font-bold text-blue-700 mb-8">Your Results</h1>
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {dummyResults.map((result, i) => (
            <ResultCard key={i} result={result} />
          ))}
        </div>
        <div className="mt-8 text-center text-zinc-600 text-sm">
          <b>Tip:</b> Click Upload your scan on the home page to add a new result.
        </div>
      </main>
    </div>
  )
}
