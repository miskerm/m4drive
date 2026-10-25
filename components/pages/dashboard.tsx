'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Bell,
  BookOpen,
  CircleHelp,
  ClipboardList,
  Flame,
  Pencil,
  ShieldAlert,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useAuth, useProgress } from '@/components/providers'
import { formatResultTime } from '@/lib/quiz-data'

export function Dashboard() {
  const router = useRouter()
  const { user, access, accessNotice } = useAuth()
  const { stats, unreadCount, markNotificationsRead } = useProgress()
  const progressCaption = stats.overallProgress === 0 ? 'Start practising to track progress' : stats.overallProgress === 100 ? 'All questions completed!' : stats.overallProgress >= 50 ? 'Good progress!' : 'Keep going!'
  const streakLabel = `${stats.streak} day${stats.streak === 1 ? '' : 's'}`

  const canAccess = (feature: string) => {
    if (feature === 'study' || feature === 'practice') return true
    return user?.plan.startsWith('premium')
  }

  return (
    <main className="min-h-screen bg-white text-[#142238]">
      <div className="border-b border-[#e3e8e6] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-end gap-5 px-7 py-4 text-sm font-bold text-[#1b5553]">
          <Link href="/" className="mr-auto flex items-center gap-2 rounded-lg border border-[#bfcecb] px-4 py-2 font-semibold text-[#087f78]">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
          <Link href="/quizzes" className="flex items-center gap-2">
            <Sparkles className="size-4" />
            Start Quick Quiz
          </Link>
          <Link href="/streak" className="flex items-center gap-2">
            <Flame className="size-4 text-[#ff7d55]" />
            {stats.streak} Day Streak
          </Link>
          <Link href="/faq" aria-label="Help" className="grid size-9 place-items-center rounded-lg border border-[#ced9d7]">
            <CircleHelp className="size-4" />
          </Link>
          <button onClick={() => { markNotificationsRead(); router.push('/notifications') }} aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'} className="relative grid size-9 place-items-center rounded-lg border border-[#ced9d7]">
            <Bell className="size-4" />
            {unreadCount > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#ef594f] px-1 text-[11px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          <Link href={user ? '/account' : '/login'} className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-[#0f928b] text-white">
              {(user?.name || 'Unknown')
                .split(' ')
                .filter(Boolean)
                .map((part) => part[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
            {user?.name || 'Unknown'}⌄
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] px-7 pb-12 pt-9">
        <h1 className="text-4xl font-extrabold tracking-tight">Welcome back, {user?.name || 'Unknown'}!</h1>
        <p className="mt-1 font-semibold text-[#607477]">Let&apos;s build your road confidence.</p>
        <p className="mt-4 max-w-2xl text-[#53686a]">Choose a learning path below. Study and Practice are ready to use now; premium mock tests unlock the full 64-question experience.</p>

        {accessNotice && (
          <div
            role="status"
            className={`mt-5 flex max-w-3xl items-start gap-3 rounded-xl border p-4 text-sm font-semibold ${
              access?.restricted
                ? 'border-[#f0c9c9] bg-[#fdf1f1] text-[#a33b3b]'
                : 'border-[#f2dfac] bg-[#fffaf0] text-[#8a6410]'
            }`}
          >
            <ShieldAlert className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-extrabold">{access?.restricted ? 'Premium access restricted' : 'Multiple devices detected'}</p>
              <p className="mt-1 leading-6">{accessNotice}</p>
              {access && (
                <p className="mt-1 text-xs font-bold opacity-80">
                  {access.deviceCount} device{access.deviceCount === 1 ? '' : 's'} tracked for {access.email}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            title="Study"
            text="Read clear notes on signs, rules, and vehicle controls."
            action="Start Studying"
            icon={BookOpen}
            tone="teal"
            href="/study"
          />
          <Feature
            title="Practice"
            text="Answer learner-style questions and check your understanding."
            action="Start Practicing"
            icon={Pencil}
            tone="blue"
            href="/practice"
          />
          <Feature
            title="Full Mock Test"
            text="Complete a full simulation with progress and results."
            action={access?.restricted ? 'Premium restricted' : canAccess('mock') ? 'Start Mock Test' : 'Unlock Premium'}
            icon={ClipboardList}
            tone="coral"
            href="/full-mock"
          />
          <Feature
            title="Quick Quiz"
            text="Try a short warm-up question to test your knowledge."
            action="Start Quick Quiz"
            icon={Sparkles}
            tone="gold"
            href="/quizzes"
          />
        </div>

        <section className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            ['Overall Progress', `${stats.overallProgress}%`, progressCaption],
            ['Topics Completed', `${stats.topicsCompleted} / ${stats.totalTopics}`, 'Topics'],
            ['Practice Questions', String(stats.questionsAnswered), 'Answered'],
            ['Average Score', stats.questionsAnswered ? `${stats.averageScore}%` : '–', 'Across all practice'],
            ['Current Streak', streakLabel, stats.streak ? 'Keep it going!' : 'Practise today to start'],
          ].map(([label, value, caption]) => (
            <div key={label} className="rounded-xl border border-[#dfe7e5] bg-white p-5 shadow-sm">
              <p className="text-sm font-bold text-[#53686a]">{label}</p>
              <p className="mt-5 text-2xl font-extrabold">{value}</p>
              <p className="mt-1 text-xs font-semibold text-[#718181]">{caption}</p>
            </div>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_1.1fr_1fr]">
          <div className="rounded-xl border border-[#dfe7e5] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Recent Results</h2>
              <Link href="/practice" className="font-bold text-[#087f78]">View all results</Link>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              {stats.results.length === 0 ? (
                <p className="text-sm font-semibold text-[#718181]">No results yet. Finish a practice module to see your score here.</p>
              ) : (
                stats.results.slice(0, 3).map((result) => (
                  <Link key={result.at} href="/practice" className="flex items-center justify-between border-b border-[#edf0ef] pb-3 text-left">
                    <span>
                      <span className="block font-bold">{result.label}</span>
                      <span className="text-xs text-[#718181]">{formatResultTime(result.at)}</span>
                    </span>
                    <span className="font-extrabold text-[#168f82]">{result.score}%</span>
                  </Link>
                ))
              )}
            </div>
          </div>
          <div className="rounded-xl border border-[#dfe7e5] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Focus Areas</h2>
              <Link href="/study" className="font-bold text-[#087f78]">View all topics</Link>
            </div>
            <div className="mt-5 flex flex-col gap-5">
              {stats.topicStats.map((topic) => (
                <Link key={topic.name} href="/practice" className="text-left">
                  <div className="flex justify-between text-sm font-bold"><span>{topic.name}</span><span>{topic.mastery}%</span></div>
                  <div className="mt-2 h-2 rounded-full bg-[#e6e9e8]">
                    <div className={`h-2 rounded-full ${topic.mastery >= 75 ? 'bg-[#23a36c]' : topic.mastery >= 50 ? 'bg-[#f4b928]' : 'bg-[#ef514c]'}`} style={{ width: `${topic.mastery}%` }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-[#dfe7e5] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-extrabold">Get Full Access</h2>
            <ul className="mt-5 flex flex-col gap-3 text-sm font-semibold text-[#53686a]">
              <li>✓ Unlimited practice questions</li>
              <li>✓ Full mock tests anytime</li>
              <li>✓ Track detailed progress</li>
              <li>✓ Access on all devices</li>
            </ul>
            <Link href="/pricing" className="mt-7 block w-full rounded-lg bg-[#0c978d] px-4 py-3 text-center font-bold text-white">Request Full Access</Link>
          </div>
        </section>
        <div className="mt-5 rounded-xl border border-[#dfe7e5] bg-white p-5 text-sm font-semibold text-[#53686a] shadow-sm">SA Learners is here to help you become a confident and responsible driver. Always remember: roads are shared. Drive safe, stay alert, stay alive.</div>
      </div>
    </main>
  )
}

function Feature({ title, text, action, icon: Icon, tone, href }: { title: string; text: string; action: string; icon: LucideIcon; tone: string; href: string }) {
  const tones: Record<string, string> = {
    teal: 'bg-[#f0fcf8] border-[#bfe5da] text-[#087f78]',
    blue: 'bg-[#f1f9ff] border-[#c5e0f0] text-[#1784c0]',
    coral: 'bg-[#fff6f3] border-[#f2d1c6] text-[#f26a57]',
    gold: 'bg-[#fffaf0] border-[#f2dfac] text-[#edaa16]',
  }
  return (
    <div className={`rounded-xl border p-5 ${tones[tone]}`}>
      <Icon className="size-10" />
      <h2 className="mt-4 text-lg font-extrabold">{title}</h2>
      <div className="mt-3 min-h-24 rounded-lg bg-white p-3 text-sm font-semibold leading-6 text-[#475e60]">{text}</div>
      <Link href={href} className="mt-5 block w-full rounded-lg bg-[#168f82] px-4 py-3 text-center font-bold text-white shadow-sm">
        {action}
      </Link>
    </div>
  )
}
