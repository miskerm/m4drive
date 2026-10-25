import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'
export async function GET() { const db = await ensureSchema(); const result = await db.execute('SELECT id,module_id,question,options_json,correct_answer FROM imported_questions ORDER BY id ASC'); return NextResponse.json(result.rows.map((row: any) => ({ ...row, options: JSON.parse(String(row.options_json)) }))) }
