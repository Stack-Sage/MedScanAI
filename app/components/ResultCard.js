export default function ResultCard({ result }) {
  if (!result) return null
  return (
    <div className="card p-4 my-4 bg-white border border-blue-100 rounded-xl shadow hover:shadow-xl transition-all">
      <div className="font-bold text-blue-700 mb-2">Diagnosis: {result.diagnosis}</div>
      <div className="text-zinc-700 mb-1">Confidence: {result.confidence}%</div>
      <div className="text-zinc-700 mb-1">Summary: {result.summary}</div>
      {result.meta && (
        <pre className="bg-blue-50 rounded-lg p-2 text-xs text-zinc-600 overflow-x-auto mt-2">
          {JSON.stringify(result.meta, null, 2)}
        </pre>
      )}
    </div>
  )
}
