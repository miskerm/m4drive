import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'

export async function GET() {
  const db = await ensureSchema()
  const result = await db.execute('SELECT id,module_id,question,options_json,correct_answer FROM imported_questions ORDER BY id ASC')
  return NextResponse.json(result.rows.map((row: any) => ({ ...row, options: JSON.parse(String(row.options_json)) })))
}

export async function POST(request: Request) {
  const body = await request.json()
  const kind = body.kind === 'mock-test' || body.kind === 'quiz' ? body.kind : 'practice'
  const questions = Array.isArray(body.questions) ? body.questions : []
  if (!questions.length || questions.length > 500) return NextResponse.json({ error: 'Upload between 1 and 500 questions.' }, { status: 400 })
  const db = await ensureSchema()
  let imported = 0
  for (const item of questions) {
    const question = String(item.question ?? item.Question ?? '').trim()
    const options = ['optionA', 'optionB', 'optionC', 'optionD'].map(key => String(item[key] ?? item[key.replace('option', 'Option')] ?? '').trim()).filter(Boolean)
    const correctAnswer = String(item.correctAnswer ?? item.correct_answer ?? '').trim()
    if (!question || options.length < 2 || !correctAnswer) continue
    await db.execute({ sql: 'INSERT INTO imported_questions (module_id, question, options_json, correct_answer) VALUES (NULL, ?, ?, ?)', args: [question, JSON.stringify({ kind, options }), correctAnswer] })
    imported++
  }
  if (!imported) return NextResponse.json({ error: 'No valid rows found. Check the required column names.' }, { status: 400 })
  return NextResponse.json({ imported })
}
