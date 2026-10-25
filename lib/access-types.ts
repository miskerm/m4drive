export type LearnerPlan = 'free' | 'premium_1000'

export type LearnerDevice = {
  deviceId: string
  label: string
  userAgent: string
  firstSeen: string
  lastSeen: string
}

export type LearnerAccess = {
  email: string
  name: string
  plan: LearnerPlan
  restricted: boolean
  restrictedAt: string | null
  deviceCount: number
  devices: LearnerDevice[]
  createdAt: string
  updatedAt: string
}

/** Accounts with this many devices (or more) are flagged for the admin to review. */
export const DEVICE_FLAG_THRESHOLD = 2

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: unknown) {
  return String(value ?? '').trim().toLowerCase()
}

export function isValidEmail(value: string) {
  return value.length <= 190 && EMAIL_PATTERN.test(value)
}

export function isFlagged(access: Pick<LearnerAccess, 'deviceCount'>) {
  return access.deviceCount >= DEVICE_FLAG_THRESHOLD
}
