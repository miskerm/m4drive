'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/providers'
import { isValidEmail, normalizeEmail } from '@/lib/access-types'

function displayName(email: string) {
  const local = email.split('@')[0] ?? ''
  const words = local.replace(/[._-]+/g, ' ').trim()
  if (!words) return 'Learner'
  return words
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .slice(0, 60)
}

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [formError, setFormError] = useState('')
  const [pending, setPending] = useState<'free' | 'premium' | 'admin' | null>(null)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (plan: 'free' | 'premium_1000') => {
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      setFormError('Enter a valid email address so this account can be tracked across devices.')
      return
    }

    setFormError('')
    setAdminError('')
    setPending(plan === 'premium_1000' ? 'premium' : 'free')

    try {
      await login({ name: displayName(normalizedEmail), email: normalizedEmail, plan })
      router.push('/dashboard')
    } finally {
      setPending(null)
    }
  }

  const handleAdminLogin = async () => {
    if (email.trim().toLowerCase() === 'lol@gmail.com' && password === '12345678') {
      setAdminError('')
      setFormError('')
      setPending('admin')
      try {
        await login({ name: 'Admin', email: 'lol@gmail.com', plan: 'premium_1000' }, { trackDevice: false })
        router.push('/admin/users')
      } finally {
        setPending(null)
      }
    } else {
      setAdminError('Use the admin email and password provided.')
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-[1280px] px-5 py-16">
      <Link href="/" className="mb-10 inline-block rounded-lg border border-[#bfcecb] bg-white px-4 py-2.5 font-semibold text-[#087f78]">
        Back to home
      </Link>
      <section className="max-w-2xl rounded-2xl border border-[#d8e2e0] bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-[#168f82]">DrivoPrep</p>
        <h1 className="mt-3 text-4xl font-extrabold">Welcome back</h1>
        <p className="mt-4 text-lg leading-8 text-[#607477]">Login to your account or create a new one to start learning.</p>
        <div className="mt-7 space-y-3">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setAdminError('')
              setFormError('')
            }}
            className="w-full rounded-lg border border-[#cbd9d7] px-4 py-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setAdminError('')
            }}
            className="w-full rounded-lg border border-[#cbd9d7] px-4 py-3"
          />
          {formError && <p role="alert" className="text-sm font-semibold text-[#d94c4c]">{formError}</p>}
          {adminError && <p role="alert" className="text-sm font-semibold text-[#d94c4c]">{adminError}</p>}
          <button
            onClick={() => handleLogin('free')}
            disabled={pending !== null}
            className="w-full rounded-lg bg-[#087f78] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === 'free' ? 'Signing in…' : 'Login (Free Access)'}
          </button>
          <button
            onClick={() => handleLogin('premium_1000')}
            disabled={pending !== null}
            className="w-full rounded-lg bg-[#ff9318] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending === 'premium' ? 'Checking devices…' : 'Login (Premium 1000 ETB)'}
          </button>
          <div className="mt-5 border-t border-[#edf0ef] pt-5">
            <p className="text-sm font-extrabold text-[#314957]">Admin access</p>
            <p className="mt-1 text-xs text-[#718181]">Use the admin credentials to open the control dashboard.</p>
            <button
              onClick={handleAdminLogin}
              disabled={pending !== null}
              className="mt-3 w-full rounded-lg border-2 border-[#087f78] bg-white px-5 py-3 font-bold text-[#087f78] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending === 'admin' ? 'Opening admin…' : 'Login to Admin Dashboard'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
