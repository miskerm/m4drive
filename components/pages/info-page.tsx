'use client'

import Link from 'next/link'
import { ArrowLeft, Flame, Trophy } from 'lucide-react'
import { useAuth, useProgress } from '@/components/providers'
import { formatResultTime } from '@/lib/quiz-data'

export type InfoPageKey = 'faq' | 'feedback' | 'streak' | 'notifications' | 'account'

export function InfoPage({ page }: { page: InfoPageKey }) {
  const { user } = useAuth()
  const { stats, notifications } = useProgress()
  const streak = stats.streak
  const contentByPage: Record<InfoPageKey, string[]> = {
    faq: ['Frequently asked questions', 'Find answers about studying, practice sessions, and mock test results.'],
    feedback: ['Share your feedback', 'Tell us what helped you prepare and what we can improve.'],
    streak: ['Your learning streak', streak ? `You have practised for ${streak} day${streak === 1 ? '' : 's'} in a row. Keep going to build confident learner habits.` : 'Answer a practice question today to start your streak.'],
    notifications: ['Notifications', notifications.length ? 'Here is what you did in your practice sessions.' : 'No notifications yet. Finish or leave a practice topic and it will show up here.'],
    account: [`${user?.name || 'Unknown'} account`, 'Your learner profile is active. Your progress, streak, and premium access are ready from this frontend dashboard.'],
  }
  const content = contentByPage[page]

  return (
    <main className="mx-auto min-h-screen max-w-[1280px] px-5 py-16">
      <Link href="/dashboard" className="mb-10 inline-flex items-center gap-2 rounded-lg border border-[#bfcecb] bg-white px-4 py-2.5 font-semibold text-[#087f78]">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to dashboard
      </Link>
      <section className="max-w-2xl rounded-2xl border border-[#d8e2e0] bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-widest text-[#168f82]">DrivoPrep</p>
        <h1 className="mt-3 text-4xl font-extrabold">{content[0]}</h1>
        <p className="mt-4 text-lg leading-8 text-[#607477]">{content[1]}</p>
        {page === 'streak' && (
          <div className="mt-8">
            <div className="flex items-end justify-between">
              <span className="text-sm font-bold text-[#607477]">Day {Math.min(streak, 50)} of 50</span>
              <Flame className="size-10 text-[#ff7d55]" />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10">
              {Array.from({ length: 50 }, (_, index) => (
                <div key={index} className={`grid aspect-square place-items-center rounded-lg text-xs font-bold ${index < streak ? 'bg-[#ff7d55] text-white' : 'border border-[#d8e2e0] bg-[#f8fbfa] text-[#78908d]'}`}>{index + 1}</div>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-[#087f78]">Keep practising daily to light up all 50 days.</p>
          </div>
        )}
        {page === 'notifications' && notifications.length > 0 && (
          <ul className="mt-8 flex flex-col gap-3">
            {notifications.map((item) => (
              <li key={item.at} className={`flex gap-4 rounded-xl border p-4 ${item.kind === 'completed' ? 'border-[#bfe3dc] bg-[#effaf7]' : 'border-[#f5d9a8] bg-[#fff8eb]'}`}>
                <span className={`grid size-10 shrink-0 place-items-center rounded-full ${item.kind === 'completed' ? 'bg-[#087f78] text-white' : 'bg-[#f0a33a] text-white'}`}>
                  {item.kind === 'completed' ? <Trophy className="size-5" aria-hidden="true" /> : <ArrowLeft className="size-5" aria-hidden="true" />}
                </span>
                <div className="min-w-0">
                  <p className="text-base font-extrabold text-[#142238]">{item.title}</p>
                  <p className="mt-1 leading-6 text-[#3d5153]">{item.message}</p>
                  <p className="mt-2 text-xs font-semibold text-[#5f7375]">{formatResultTime(item.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
        {page === 'feedback' ? <textarea aria-label="Message" placeholder="Write your message..." className="mt-7 min-h-32 w-full rounded-lg border border-[#cbd9d7] p-3" /> : null}
      </section>
    </main>
  )
}
