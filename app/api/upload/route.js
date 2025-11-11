import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(req) {
  try {
    const form = await req.formData()
    const scan = form.get('scan')
    const note = form.get('note')?.toString() || ''
    if (!scan || !scan.arrayBuffer) return NextResponse.json({ error: 'no file' }, { status: 400 })

    const buffer = Buffer.from(await scan.arrayBuffer())

    const FormData = (await import('form-data')).default
    const formToPy = new FormData()
    formToPy.append('scan', buffer, { filename: scan.name || 'upload.bin' })
    formToPy.append('note', note)

    const pythonApi = process.env.PYTHON_API || 'http://localhost:8000/analyze'
    const pyResp = await axios.post(pythonApi, formToPy, { headers: formToPy.getHeaders(), timeout: 120000 })
    const analysis = pyResp.data || {}

    const summaryApi = process.env.SUMMARY_API || 'http://localhost:9000/summary'
    let summary = ''
    try {
      const s = await axios.post(summaryApi, { diagnosis: analysis.diagnosis, meta: analysis.meta }, { timeout: 30000 })
      summary = s.data.summary || ''
    } catch (e) {
      summary = 'Summary service unavailable'
    }

    const { MongoClient } = await import('mongodb')
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
    const client = new MongoClient(uri)
    await client.connect()
    const db = client.db(process.env.MONGODB_DB || 'medscan')
    const doc = { uploadedAt: new Date().toISOString(), note, analysis, summary }
    await db.collection('scans').insertOne(doc)
    await client.close()

    return NextResponse.json(
      { diagnosis: analysis.diagnosis, confidence: analysis.confidence, meta: analysis.meta, summary, uploadedAt: doc.uploadedAt },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
