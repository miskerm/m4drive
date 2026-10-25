import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'

function sessionId(request: Request) {
  return request.headers.get('cookie')?.match(/(?:^|;\s*)drivo_session=([^;]+)/)?.[1]
}

async function requireAdmin(request: Request) {
  const id = sessionId(request)
  if (!id) return null
  const db = await ensureSchema()
  const result = await db.execute({ sql: `SELECT u.id,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>? AND u.email_verified=1`, args: [id, new Date().toISOString()] })
  return result.rows[0]?.role === 'admin' ? db : null
}

export async function GET(request: Request) {
  const db = await requireAdmin(request)
  if (!db) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  const result = await db.execute({ sql: `SELECT s.id,s.user_id,u.email,u.name,s.user_agent,s.ip_address,s.created_at,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.expires_at>? ORDER BY s.created_at DESC`, args: [new Date().toISOString()] })
  return NextResponse.json({ sessions: result.rows })
}

export async function DELETE(request: Request) {
  const db = await requireAdmin(request)
  if (!db) return NextResponse.json({ error: 'Admin access required.' }, { status: 403 })
  const { id } = await request.json()
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'Session id is required.' }, { status: 400 })
  await db.execute({ sql: 'DELETE FROM sessions WHERE id=?', args: [id] })
  return NextResponse.json({ ok: true })
}
