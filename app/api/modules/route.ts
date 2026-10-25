import { createClient } from '@libsql/client'
import { NextResponse } from 'next/server'

function getDb() {
  const url = process.env.TURSO_DATABASE_URL
  if (!url) throw new Error('TURSO_DATABASE_URL is not configured')
  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
}

async function ensureTable() {
  const db = getDb()
  await db.execute(`CREATE TABLE IF NOT EXISTS study_modules (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, file_name TEXT NOT NULL, file_data BLOB NOT NULL, created_at TEXT NOT NULL)`)
}

export async function GET() {
  await ensureTable()
  const result = await db.execute('SELECT id, title, description, file_name, created_at FROM study_modules ORDER BY id DESC')
  return NextResponse.json(result.rows)
}

export async function POST(request: Request) {
  const form = await request.formData()
  const title = String(form.get('title') ?? '').trim()
  const description = String(form.get('description') ?? '').trim()
  const file = form.get('file')
  if (!title || !description || !(file instanceof File) || file.type !== 'application/pdf') return NextResponse.json({ error: 'Title, description, and a PDF are required.' }, { status: 400 })
  const data = new Uint8Array(await file.arrayBuffer())
  await ensureTable()
  const db = getDb()
  await db.execute({ sql: 'INSERT INTO study_modules (title, description, file_name, file_data, created_at) VALUES (?, ?, ?, ?, ?)', args: [title, description, file.name, data, new Date().toISOString()] })
  return NextResponse.json({ ok: true })
}
