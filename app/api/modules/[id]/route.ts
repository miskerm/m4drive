import { NextResponse } from 'next/server'
import { ensureSchema } from '@/lib/server-db'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const moduleId = Number(id)
  if (!Number.isInteger(moduleId) || moduleId < 1) return NextResponse.json({ error: 'Invalid module id.' }, { status: 400 })

  const db = await ensureSchema()
  const result = await db.execute({ sql: 'SELECT file_name,file_data FROM study_modules WHERE id = ?', args: [moduleId] })
  const row = result.rows[0] as { file_name?: string; file_data?: Uint8Array | ArrayBuffer | string } | undefined
  if (!row?.file_data) return NextResponse.json({ error: 'Module file not found.' }, { status: 404 })

  const bytes = row.file_data instanceof Uint8Array
    ? row.file_data
    : row.file_data instanceof ArrayBuffer
      ? new Uint8Array(row.file_data)
      : Uint8Array.from(Buffer.from(row.file_data, 'base64'))
  const extension = String(row.file_name ?? '').toLowerCase()
  const contentType = extension.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  return new NextResponse(bytes as BodyInit, {
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(bytes.byteLength),
      'Content-Disposition': `attachment; filename="${String(row.file_name ?? 'module-file').replace(/["\r\n]/g, '')}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
