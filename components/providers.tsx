'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import {
  computeStats,
  dayKey,
  emptyProgress,
  type NotificationEntry,
  type ProgressState,
  type User,
} from '@/lib/quiz-data'
import { getDeviceIdentity } from '@/lib/device-client'
import { DEVICE_FLAG_THRESHOLD, type LearnerAccess } from '@/lib/access-types'

type LoginOptions = { trackDevice?: boolean }

type AuthContextValue = {
  user: User
  access: LearnerAccess | null
  accessNotice: string
  login: (draft: NonNullable<User>, options?: LoginOptions) => Promise<LearnerAccess | null>
  logout: () => void
  refreshAccess: () => Promise<void>
}

function noticeFor(access: LearnerAccess) {
  if (access.restricted) {
    return `Premium access is restricted for ${access.email} because it is active on ${access.deviceCount} device${access.deviceCount === 1 ? '' : 's'}. Ask the admin to restore it.`
  }
  if (access.deviceCount >= DEVICE_FLAG_THRESHOLD) {
    return `This email is active on ${access.deviceCount} devices, so the admin has flagged it for review. Premium accounts are meant for one device.`
  }
  return ''
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [access, setAccess] = useState<LearnerAccess | null>(null)
  const [accessNotice, setAccessNotice] = useState('')
  const emailRef = useRef('')

  const login = useCallback(async (draft: NonNullable<User>, options?: LoginOptions) => {
    emailRef.current = draft.email

    if (options?.trackDevice === false) {
      setUser(draft)
      setAccess(null)
      setAccessNotice('')
      return null
    }

    setAccessNotice('')

    try {
      const device = getDeviceIdentity()
      const response = await fetch('/api/access/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: draft.email,
          name: draft.name,
          plan: draft.plan,
          deviceId: device.deviceId,
          label: device.label,
        }),
      })

      if (!response.ok) throw new Error(`Device registration failed with status ${response.status}.`)

      const payload = (await response.json()) as { access?: LearnerAccess }
      if (!payload.access) throw new Error('Device registration returned no access record.')

      setAccess(payload.access)
      setUser({
        ...draft,
        name: payload.access.name || draft.name,
        plan: payload.access.restricted ? 'free' : payload.access.plan,
      })
      setAccessNotice(noticeFor(payload.access))
      return payload.access
    } catch (error) {
      console.error('Could not verify this device:', error)
      setAccess(null)
      setUser(draft)
      setAccessNotice('We could not verify this device, so premium access could not be checked. Sign in again to retry.')
      return null
    }
  }, [])

  const refreshAccess = useCallback(async () => {
    const email = emailRef.current
    if (!email) return

    try {
      const response = await fetch(`/api/access/status?email=${encodeURIComponent(email)}`, { cache: 'no-store' })
      if (!response.ok) return

      const payload = (await response.json()) as { access?: LearnerAccess }
      const next = payload.access
      if (!next) return

      setAccess(next)
      setUser((current) =>
        current && current.email === next.email
          ? { ...current, name: next.name || current.name, plan: next.restricted ? 'free' : next.plan }
          : current,
      )
      setAccessNotice(noticeFor(next))
    } catch (error) {
      console.error('Could not refresh premium access:', error)
    }
  }, [])

  const logout = useCallback(() => {
    emailRef.current = ''
    setUser(null)
    setAccess(null)
    setAccessNotice('')
  }, [])

  return (
    <AuthContext.Provider value={{ user, access, accessNotice, login, logout, refreshAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

type ProgressContextValue = {
  stats: ReturnType<typeof computeStats>
  notifications: NotificationEntry[]
  unreadCount: number
  recordAnswer: (topic: string, questionId: number, correct: boolean) => void
  recordResult: (label: string, score: number) => void
  notify: (kind: NotificationEntry['kind'], title: string, message: string) => void
  markNotificationsRead: () => void
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined)

function ProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [progressByUser, setProgressByUser] = useState<Record<string, ProgressState>>({})
  const userKey = user?.email ?? 'guest'
  const progress = progressByUser[userKey] ?? emptyProgress

  const update = (change: (state: ProgressState) => ProgressState) => {
    setProgressByUser((all) => ({ ...all, [userKey]: change(all[userKey] ?? emptyProgress) }))
  }

  const recordAnswer = (topic: string, questionId: number, correct: boolean) => {
    const today = dayKey(new Date())
    update((state) => ({
      ...state,
      answers: { ...state.answers, [`${topic}:${questionId}`]: correct },
      attempts: state.attempts + 1,
      correctAttempts: state.correctAttempts + (correct ? 1 : 0),
      activeDays: state.activeDays.includes(today) ? state.activeDays : [...state.activeDays, today],
    }))
  }

  const recordResult = (label: string, score: number) => {
    update((state) => ({ ...state, results: [{ label, score, at: Date.now() }, ...state.results] }))
  }

  const notify = (kind: NotificationEntry['kind'], title: string, message: string) => {
    update((state) => ({ ...state, notifications: [{ kind, title, message, at: Date.now(), read: false }, ...state.notifications] }))
  }

  const markNotificationsRead = () => {
    update((state) => (state.notifications.some((item) => !item.read) ? { ...state, notifications: state.notifications.map((item) => ({ ...item, read: true })) } : state))
  }

  return (
    <ProgressContext.Provider
      value={{
        stats: computeStats(progress),
        notifications: progress.notifications,
        unreadCount: progress.notifications.filter((item) => !item.read).length,
        recordAnswer,
        recordResult,
        notify,
        markNotificationsRead,
      }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (!context) throw new Error('useProgress must be used within ProgressProvider')
  return context
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProgressProvider>{children}</ProgressProvider>
    </AuthProvider>
  )
}
