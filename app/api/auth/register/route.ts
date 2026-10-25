import { createHash, randomBytes, scryptSync } from 'node:crypto'
import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'

const hash = (password: string, salt = randomBytes(16).toString('hex')) => `${salt}:${scryptSync(password, salt, 64).toString('hex')}`

export async function POST(request: Request) {
  const { name, email, password } = await request.json()
  if (typeof name !== 'string' || name.trim().length < 2 || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8) return NextResponse.json({ error: 'Name, valid email, and an 8-character password are required.' }, { status: 400 })
  const db = await ensureSchema()
  const token = randomBytes(32).toString('hex')
  try {
    await db.execute({ sql: 'INSERT INTO users (name,email,password_hash,verification_token,verification_expires_at,created_at) VALUES (?,?,?,?,?,?)', args: [name.trim(), email.trim().toLowerCase(), hash(password), token, new Date(Date.now() + 86400000).toISOString(), new Date().toISOString()] })
  } catch { return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 }) }
  const response: Record<string, unknown> = { ok: true, message: 'Account created. Verify your email before signing in.' }
  if (process.env.NODE_ENV !== 'production') response.verificationUrl = `/api/auth/verify?token=${token}`
  return NextResponse.json(response, { status: 201 })
}
