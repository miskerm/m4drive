import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'

function validPassword(password: string, stored: string) { const [salt, expected] = stored.split(':'); const actual = scryptSync(password, salt, 64); return timingSafeEqual(actual, Buffer.from(expected, 'hex')) }
export async function POST(request: Request) {
  const { email, password } = await request.json(); const db = await ensureSchema()
  const result = await db.execute({ sql: 'SELECT id,name,email,password_hash,role,email_verified FROM users WHERE email = ?', args: [String(email).trim().toLowerCase()] }); const user = result.rows[0] as any
  if (!user || !validPassword(String(password), user.password_hash)) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
  if (!user.email_verified) return NextResponse.json({ error: 'Verify your email before signing in.' }, { status: 403 })
  const sessionId = randomBytes(32).toString('hex'); await db.execute({ sql: 'INSERT INTO sessions (id,user_id,user_agent,ip_address,created_at,expires_at) VALUES (?,?,?,?,?,?)', args: [sessionId, user.id, request.headers.get('user-agent'), request.headers.get('x-forwarded-for'), new Date().toISOString(), new Date(Date.now() + 2592000000).toISOString()] })
  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } }); response.cookies.set('drivo_session', sessionId, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 2592000 }); return response
}
