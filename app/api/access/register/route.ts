import { NextResponse } from 'next/server'
import { normalizeEmail, isValidEmail, type LearnerPlan } from '@/lib/access-types'
import { registerLearnerDevice } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const data = (body ?? {}) as Record<string, unknown>
  const email = normalizeEmail(data.email)
  const name = String(data.name ?? '').trim().slice(0, 80) || 'Learner'
  const plan: LearnerPlan = data.plan === 'premium_1000' ? 'premium_1000' : 'free'
  const deviceId = String(data.deviceId ?? '').trim().slice(0, 100)
  const label = String(data.label ?? '').trim().slice(0, 80) || 'Unknown device'
  const userAgent = (request.headers.get('user-agent') ?? '').slice(0, 400)

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
  }
  if (!deviceId) {
    return NextResponse.json({ error: 'A device id is required.' }, { status: 400 })
  }

  try {
    const access = await registerLearnerDevice({ email, name, plan, deviceId, label, userAgent })
    return NextResponse.json({ access })
  } catch (error) {
    console.error('Could not register learner device:', error)
    return NextResponse.json({ error: 'Device tracking is unavailable right now.' }, { status: 503 })
  }
}
