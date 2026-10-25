import Link from 'next/link'
import { ShieldAlert, ShieldCheck, Smartphone, Users } from 'lucide-react'
import { getTrackedLearners } from '@/lib/db'
import { DEVICE_FLAG_THRESHOLD, isFlagged, type LearnerDevice } from '@/lib/access-types'
import { computeStats, emptyProgress } from '@/lib/quiz-data'
import { PremiumAccessButton } from '@/components/admin/premium-access-button'

export const dynamic = 'force-dynamic'

type LearnerRow = {
  email: string
  name: string
  plan: string
  devices: LearnerDevice[]
  deviceCount: number
  restricted: boolean
  restrictedAt: string | null
  demo: boolean
}

const demoRows: LearnerRow[] = [
  {
    email: 'lerato@example.com',
    name: 'Lerato M.',
    plan: 'Premium 1000 ETB',
    devices: [{ deviceId: 'demo-1', label: 'Chrome · Linux', userAgent: '', firstSeen: '', lastSeen: '' }],
    deviceCount: 1,
    restricted: false,
    restrictedAt: null,
    demo: true,
  },
  {
    email: 'amanuel@example.com',
    name: 'Amanuel K.',
    plan: 'Premium 1000 ETB',
    devices: [{ deviceId: 'demo-2', label: 'Android', userAgent: '', firstSeen: '', lastSeen: '' }],
    deviceCount: 1,
    restricted: false,
    restrictedAt: null,
    demo: true,
  },
  {
    email: 'sara@example.com',
    name: 'Sara T.',
    plan: 'Premium 1000 ETB',
    devices: [
      { deviceId: 'demo-3a', label: 'iPhone', userAgent: '', firstSeen: '', lastSeen: '' },
      { deviceId: 'demo-3b', label: 'Chrome · Windows', userAgent: '', firstSeen: '', lastSeen: '' },
    ],
    deviceCount: 2,
    restricted: false,
    restrictedAt: null,
    demo: true,
  },
]

function shortDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

export default async function AdminUsersPage() {
  const learners = await getTrackedLearners()
  const tracked = learners.length > 0
  const rows: LearnerRow[] = tracked
    ? learners.map((learner) => ({
        email: learner.email,
        name: learner.name,
        plan: learner.plan === 'premium_1000' ? 'Premium 1000 ETB' : 'Free',
        devices: learner.devices,
        deviceCount: learner.deviceCount,
        restricted: learner.restricted,
        restrictedAt: learner.restrictedAt,
        demo: false,
      }))
    : demoRows

  const deviceTotal = learners.reduce((total, learner) => total + learner.deviceCount, 0)
  const flaggedCount = learners.filter((learner) => isFlagged(learner)).length
  const restrictedCount = learners.filter((learner) => learner.restricted).length
  const stats = computeStats(emptyProgress)

  const cards: Array<[string, string, string]> = [
    ['Tracked learners', String(learners.length), tracked ? 'Emails seen at sign-in' : 'No sign-ins tracked yet'],
    ['Active devices', String(deviceTotal), `Distinct browsers and phones`],
    ['Multi-device accounts', String(flaggedCount), `${DEVICE_FLAG_THRESHOLD}+ devices flagged`],
    ['Premium restricted', String(restrictedCount), 'Blocked by the admin'],
  ]

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8 lg:py-10">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#168f82]">Management</p>
          <h1 className="mt-1 text-3xl font-extrabold">Users</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#607477]">
            Learner accounts, the devices they sign in from, and premium access. Every email is tracked across devices.
          </p>
        </div>
        <Link href="/dashboard" className="rounded-lg border border-[#bfcecb] bg-white px-4 py-2.5 text-sm font-bold text-[#087f78]">
          View learner dashboard
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, caption]) => (
          <div key={label} className="rounded-xl border border-[#d8e2e0] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#607477]">{label}</p>
            <p className="mt-3 text-2xl font-extrabold">{value}</p>
            <p className="mt-1 text-xs font-semibold text-[#8aa5a1]">{caption}</p>
          </div>
        ))}
      </section>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#d5e7e3] bg-[#effafa] p-4 text-xs leading-5 text-[#3d5153]">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#087f78]" />
        <p>
          Devices are identified with a per-browser id stored on the learner&apos;s device when they sign in. When the same email signs in
          from a <strong>second device or more</strong>, the account is flagged here. Use <strong>Restrict premium</strong> to remove premium
          access — the learner loses full mock tests on their next visit or sign-in. You can restore it at any time.
        </p>
      </div>

      <section className="mt-6 rounded-xl border border-[#d8e2e0] bg-white p-5 shadow-sm lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-lg bg-[#e6f5f3] text-[#087f78]">
              <Users className="size-4" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold">Tracked learners and devices</h2>
              <p className="text-xs font-semibold text-[#718181]">
                {tracked
                  ? `${learners.length} account${learners.length === 1 ? '' : 's'} · ${deviceTotal} device${deviceTotal === 1 ? '' : 's'} · ${flaggedCount} flagged`
                  : 'Example rows shown until a learner signs in'}
              </p>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${tracked ? 'bg-[#e6f5f3] text-[#06625e]' : 'bg-[#fff8e6] text-[#a97608]'}`}>
            {rows.length} shown
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e3e8e6] text-[#607477]">
                <th className="p-3">Learner</th>
                <th className="p-3">Email</th>
                <th className="p-3">Plan</th>
                <th className="p-3">Devices</th>
                <th className="p-3">Status</th>
                <th className="p-3">Premium access</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const flagged = row.deviceCount >= DEVICE_FLAG_THRESHOLD
                return (
                  <tr
                    key={row.email}
                    className={`border-b border-[#edf0ef] align-top last:border-0 ${
                      row.restricted ? 'bg-[#fff8f8]' : flagged ? 'bg-[#fffbf2]' : ''
                    }`}
                  >
                    <td className="p-3">
                      <p className="font-bold text-[#142238]">{row.name}</p>
                      {row.demo && <span className="mt-0.5 block text-[11px] font-bold uppercase tracking-wide text-[#b08a2a]">Example</span>}
                    </td>
                    <td className="p-3 text-[#607477]">{row.email}</td>
                    <td className="p-3 font-semibold text-[#314957]">{row.plan}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                            flagged ? 'bg-[#fff3d6] text-[#9a6a05]' : 'bg-[#e6f5f3] text-[#06625e]'
                          }`}
                        >
                          <Smartphone className="size-3" />
                          {row.deviceCount} device{row.deviceCount === 1 ? '' : 's'}
                        </span>
                        {row.devices.slice(0, 2).map((device) => (
                          <span
                            key={device.deviceId}
                            title={device.userAgent || undefined}
                            className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-[#3d5153] ring-1 ring-[#e3e8e6]"
                          >
                            {device.label}
                            {device.lastSeen ? ` · ${shortDate(device.lastSeen)}` : ''}
                          </span>
                        ))}
                        {row.deviceCount > 2 && (
                          <span className="text-[11px] font-bold text-[#718181]">+{row.deviceCount - 2} more</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-start gap-1">
                        {row.restricted && (
                          <span className="rounded-full bg-[#fdeeee] px-2.5 py-1 text-[11px] font-bold text-[#b33636]">
                            Premium restricted
                          </span>
                        )}
                        {flagged && (
                          <span className="rounded-full bg-[#fff3d6] px-2.5 py-1 text-[11px] font-bold text-[#9a6a05]">
                            {DEVICE_FLAG_THRESHOLD}+ devices
                          </span>
                        )}
                        {!row.restricted && !flagged && (
                          <span className="rounded-full bg-[#e6f5f3] px-2.5 py-1 text-[11px] font-bold text-[#087f78]">Active</span>
                        )}
                        {row.restricted && row.restrictedAt && (
                          <span className="text-[11px] font-semibold text-[#8aa5a1]">Since {shortDate(row.restrictedAt)}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {row.demo ? (
                        <span className="text-xs font-semibold text-[#8aa5a1]">Sign in to track</span>
                      ) : (
                        <PremiumAccessButton
                          email={row.email}
                          name={row.name}
                          restricted={row.restricted}
                          flagged={flagged}
                        />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {tracked && restrictedCount > 0 && (
          <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#b33636]">
            <ShieldCheck className="size-4" />
            {restrictedCount} account{restrictedCount === 1 ? '' : 's'} currently blocked from premium access.
          </p>
        )}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">Learning progress snapshot</h2>
          <p className="mt-1 text-sm text-[#607477]">Aggregate practice readiness for the current content library.</p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-[#f8fbfa] p-4"><dt className="text-xs font-bold text-[#718181]">Practice questions</dt><dd className="mt-1 text-2xl font-extrabold">{stats.questionsAnswered}</dd></div>
            <div className="rounded-lg bg-[#f8fbfa] p-4"><dt className="text-xs font-bold text-[#718181]">Active topics</dt><dd className="mt-1 text-2xl font-extrabold">{stats.totalTopics}</dd></div>
          </dl>
        </div>
        <div className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold">Quick links</h2>
          <p className="mt-1 text-sm text-[#607477]">Jump into the content tools from the side panel.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/admin/modules" className="rounded-lg bg-[#168f82] px-4 py-2.5 text-sm font-bold text-white">Add Study Module</Link>
            <Link href="/admin/practice" className="rounded-lg bg-[#1784c0] px-4 py-2.5 text-sm font-bold text-white">Add Practice</Link>
            <Link href="/admin/mock-tests" className="rounded-lg bg-[#ef6a57] px-4 py-2.5 text-sm font-bold text-white">Add Mock Test</Link>
            <Link href="/admin/quizzes" className="rounded-lg bg-[#d79a0b] px-4 py-2.5 text-sm font-bold text-white">Add Quiz</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
