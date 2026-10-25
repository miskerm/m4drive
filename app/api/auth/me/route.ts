import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'
export async function GET(request: Request) { const id = request.headers.get('cookie')?.match(/drivo_session=([^;]+)/)?.[1]; if (!id) return NextResponse.json({ user: null }); const db = await ensureSchema(); const result = await db.execute({ sql: 'SELECT u.id,u.name,u.email,u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>? AND u.email_verified=1', args: [id, new Date().toISOString()] }); return NextResponse.json({ user: result.rows[0] ?? null }) }
