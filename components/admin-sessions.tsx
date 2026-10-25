'use client'

import { useEffect, useState } from 'react'

interface Session { id: string; email: string; name: string; user_agent?: string; ip_address?: string; created_at: string }

export function AdminSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [error, setError] = useState('')
  const load = async () => {
    const response = await fetch('/api/admin/sessions')
    const data = await response.json()
    if (!response.ok) { setError(data.error || 'Unable to load sessions.'); return }
    setSessions(data.sessions)
  }
  useEffect(() => { void load() }, [])
  const reject = async (id: string) => {
    const response = await fetch('/api/admin/sessions', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!response.ok) { setError('Unable to reject this device session.'); return }
    setSessions((current) => current.filter((session) => session.id !== id))
  }
  return <section className="mt-6 rounded-2xl border border-[#d8e2e0] bg-white p-6 shadow-sm"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-extrabold">Active device sessions</h2><p className="mt-1 text-sm text-[#607477]">Reject a device to let the learner sign in somewhere else.</p></div><button onClick={() => void load()} className="rounded-lg border border-[#bfcecb] px-3 py-2 text-sm font-bold text-[#087f78]">Refresh</button></div>{error && <p role="alert" className="mt-4 text-sm font-semibold text-red-600">{error}</p>}<div className="mt-5 flex flex-col gap-3">{sessions.length === 0 ? <p className="rounded-xl bg-[#f6faf9] p-4 text-sm text-[#607477]">No active sessions found.</p> : sessions.map((session) => <div key={session.id} className="flex flex-col gap-4 rounded-xl border border-[#e6eeec] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="font-bold text-[#142238]">{session.name} · {session.email}</p><p className="mt-1 truncate text-xs text-[#607477]">{session.user_agent || 'Unknown device'} · {session.ip_address || 'Unknown IP'}</p></div><button onClick={() => void reject(session.id)} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50">Reject device</button></div>)}</div></section>
}
