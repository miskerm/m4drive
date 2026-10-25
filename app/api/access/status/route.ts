import { NextResponse } from 'next/server'
import { normalizeEmail, isValidEmail } from '@/lib/access-types'
import { getLearnerAccess } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const email = normalizeEmail(new URL(request.url).searchParams.get('email'))

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const access = await getLearnerAccess(email)

  if (!access) {
    return NextResponse.json({ error: 'No tracked access for this email.' }, { status: 404 })
  }

  return NextResponse.json({ access })
}
