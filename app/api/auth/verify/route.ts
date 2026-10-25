import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 })
  const db = await ensureSchema()
  const result = await db.execute({ sql: 'UPDATE users SET email_verified = 1, verification_token = NULL, verification_expires_at = NULL WHERE verification_token = ? AND verification_expires_at > ?', args: [token, new Date().toISOString()] })
  if (!result.rowsAffected) return NextResponse.json({ error: 'This verification link is invalid or expired.' }, { status: 400 })
  return NextResponse.json({ ok: true, message: 'Email verified. You can now sign in.' })
}
