'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react'

export function QuestionImporter({ kind }: { kind: 'practice' | 'mock-test' | 'quiz' }) {
  const [file, setFile] = useState<File | null>(null)
  const [rows, setRows] = useState<any[]>([])
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function parseFile(selected: File) {
    setFile(selected)
    setStatus('')
    const buffer = await selected.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const parsed = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[]
    setRows(parsed)
    if (!parsed.length) setStatus('The spreadsheet does not contain any questions.')
  }

  async function importQuestions() {
    if (!rows.length) return
    setBusy(true)
    setStatus('')
    try {
      const response = await fetch('/api/questions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, questions: rows }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Import failed')
      setStatus(`${result.imported} questions imported successfully.`)
      setRows([])
      setFile(null)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Import failed')
    } finally { setBusy(false) }
  }

  return <div className="flex flex-col gap-6 rounded-2xl border border-[#b9d8d3] bg-white p-6 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="rounded-xl bg-[#e8f8f5] p-3 text-[#087f78]"><FileSpreadsheet /></div>
      <div><h2 className="font-bold text-[#153b46]">Import {kind.replace('-', ' ')} questions</h2><p className="mt-1 text-sm text-[#607477]">Upload an Excel or CSV file with columns: question, optionA, optionB, optionC, optionD, correctAnswer.</p></div>
    </div>
    <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#b9d8d3] bg-[#f7fcfb] p-8 text-center hover:bg-[#effaf7]">
      <Upload className="text-[#087f78]" /><span className="font-semibold text-[#153b46]">{file ? file.name : 'Choose Excel or CSV file'}</span><span className="text-xs text-[#607477]">.xlsx, .xls, .csv</span>
      <input className="sr-only" type="file" accept=".xlsx,.xls,.csv" onChange={event => { const selected = event.target.files?.[0]; if (selected) parseFile(selected) }} />
    </label>
    {rows.length > 0 && <div className="flex flex-col gap-3"><p className="text-sm font-semibold text-[#153b46]">Preview: {rows.length} rows detected</p><div className="max-h-48 overflow-auto rounded-lg border border-[#d7e6e3] text-sm"><table className="w-full"><tbody>{rows.slice(0, 4).map((row, index) => <tr className="border-b border-[#edf3f1]" key={index}><td className="p-3">{row.question || row.Question || 'Missing question'}</td><td className="p-3 text-[#607477]">{row.correctAnswer || row.correct_answer || ''}</td></tr>)}</tbody></table></div><button className="rounded-xl bg-[#087f78] px-5 py-3 font-bold text-white disabled:opacity-50" disabled={busy} onClick={importQuestions}>{busy ? 'Importing...' : 'Import questions'}</button></div>}
    {status && <p className="flex items-center gap-2 text-sm font-semibold text-[#087f78]"><CheckCircle2 className="size-4" />{status}</p>}
  </div>
}
