import { NextResponse } from 'next/server'
import { getDb } from '@/lib/server-db'
export async function POST(request: Request) { const id = request.headers.get('cookie')?.match(/drivo_session=([^;]+)/)?.[1]; if (id) await getDb().execute({ sql: 'DELETE FROM sessions WHERE id = ?', args: [id] }); const response = NextResponse.json({ ok: true }); response.cookies.delete('drivo_session'); return response }
