import { getStudyModuleFile } from '@/lib/db'

export const dynamic = 'force-dynamic'

const mimeTypes: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain; charset=utf-8',
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const moduleId = Number(id)

  if (!Number.isFinite(moduleId) || moduleId <= 0) {
    return new Response('Invalid module id', { status: 400 })
  }

  const studyModule = await getStudyModuleFile(moduleId)
  if (!studyModule || studyModule.data.byteLength === 0) {
    return new Response('Module file not found', { status: 404 })
  }

  const extension = studyModule.fileName.split('.').pop()?.toLowerCase() ?? ''
  const contentType = mimeTypes[extension] ?? 'application/octet-stream'
  const url = new URL(request.url)
  const shouldDownload = url.searchParams.get('download') === '1'
  const safeName = studyModule.fileName.replace(/["\r\n]/g, '_')

  return new Response(studyModule.data, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(studyModule.data.byteLength),
      'Content-Disposition': `${shouldDownload ? 'attachment' : 'inline'}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  })
}
