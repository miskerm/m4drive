import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'

export async function GET() { const db = await ensureSchema(); const result = await db.execute('SELECT id,title,description,file_name,created_at FROM study_modules ORDER BY id DESC'); return NextResponse.json(result.rows) }
export async function POST(request: Request) {
  const form = await request.formData(); const title = String(form.get('title') ?? '').trim(); const description = String(form.get('description') ?? '').trim(); const file = form.get('file')
  if (!title || !description || !(file instanceof File)) return NextResponse.json({ error: 'Title, description, and an upload are required.' }, { status: 400 })
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'); const isExcel = /\.xlsx?$/.test(file.name.toLowerCase())
  if (!isPdf && !isExcel) return NextResponse.json({ error: 'Upload a PDF or Excel workbook.' }, { status: 400 })
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'Files must be smaller than 15 MB.' }, { status: 413 })
  const db = await ensureSchema(); const data = new Uint8Array(await file.arrayBuffer()); const createdAt = new Date().toISOString()
  const moduleResult = await db.execute({ sql: 'INSERT INTO study_modules (title,description,file_name,file_data,created_at) VALUES (?,?,?,?,?)', args: [title, description, file.name, data, createdAt] })
  if (isExcel) { const XLSX = await import('xlsx'); const workbook = XLSX.read(data, { type: 'array' }); const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[workbook.SheetNames[0]]); for (const row of rows) { const question = String(row.question ?? row.Question ?? '').trim(); const correct = String(row.correct_answer ?? row.answer ?? row.correct ?? '').trim(); const options = ['A','B','C','D'].map((key) => row[key] ?? row[`option_${key}`]).filter(Boolean).map(String); if (question && correct && options.length >= 2) await db.execute({ sql: 'INSERT INTO imported_questions (module_id,question,options_json,correct_answer,created_at) VALUES (?,?,?,?,?)', args: [Number(moduleResult.lastInsertRowid ?? 0), question, JSON.stringify(options), correct, createdAt] }) } }
  return NextResponse.json({ ok: true, importedQuestions: isExcel ? 'Rows with question, correct_answer, and A-D columns were imported.' : 0 })
}
