'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BookOpen, CircleHelp, Pencil, ShieldCheck, Trophy } from 'lucide-react'

const dashboardImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/photo_2026-10-16_21-35-23-B3Fy090WLgQF1rIrdkIYWaoi8lMye7.jpg'

export function Landing() {
  const router = useRouter()

  return (
    <>
      <section id="home" className="mx-auto grid max-w-[1280px] items-center gap-12 px-5 pb-14 pt-16 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:pb-20 lg:pt-20">
        <div>
          <h1 className="max-w-[520px] text-6xl font-extrabold leading-[.98] tracking-[-.045em] sm:text-7xl">
            Get ready<br />for your<br />learner&apos;s<br />test
          </h1>
          <p className="mt-6 max-w-[500px] text-lg leading-8 text-[#203c58]">
            A mobile-first study app with practice-style questions, clear explanations, and a full mock test simulation.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-lg bg-[#ff9318] px-4 py-3 font-semibold text-white">
              Open Dashboard
            </Link>
            <Link href="/quizzes" className="rounded-lg border border-[#007b78] bg-white px-4 py-3 font-semibold text-[#007b78]">
              Start Quick Quiz
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-[#314957]">
            <span>♧ Practice on your schedule</span>
            <span>◉ Learner-safe practice content</span>
            <span>♧ Full Access upgrade</span>
          </div>
        </div>
        <Link href="/dashboard" className="rounded-xl border border-[#d5e0de] bg-white p-2 text-left shadow-[0_24px_60px_rgba(20,55,60,.08)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dashboardImage} alt="DrivoPrep learner dashboard preview; tap to open dashboard" className="w-full rounded-lg" />
        </Link>
      </section>
      <section className="mx-auto grid max-w-[1280px] grid-cols-2 border-y border-[#d3e1df] bg-[#effafa] text-center md:grid-cols-5">
        <div className="border-r border-[#d3e1df] px-4 py-9">
          <CircleHelp className="mx-auto text-[#168f82]" />
          <h3 className="mt-4 font-extrabold">Practice-style questions</h3>
          <p className="mt-3 text-[#5d7171]">Built around the learner test structure.</p>
        </div>
        <div className="border-r border-[#d3e1df] px-4 py-9">
          <BookOpen className="mx-auto text-[#168f82]" />
          <h3 className="mt-4 font-extrabold">Study signs, rules &amp; controls</h3>
          <p className="mt-3 text-[#5d7171]">Clear study cards for all topics that matter.</p>
        </div>
        <div className="border-r border-[#d3e1df] px-4 py-9 md:border-r-0">
          <CircleHelp className="mx-auto text-[#168f82]" />
          <h3 className="mt-4 font-extrabold">Clear explanations</h3>
          <p className="mt-3 text-[#5d7171]">Simple feedback after each practice answer.</p>
        </div>
        <div className="border-r border-[#d3e1df] px-4 py-9 md:border-r">
          <Trophy className="mx-auto text-[#168f82]" />
          <h3 className="mt-4 font-extrabold">Full mock test</h3>
          <p className="mt-3 text-[#5d7171]">Practise section results before test day.</p>
        </div>
        <div className="px-4 py-9">
          <ShieldCheck className="mx-auto text-[#168f82]" />
          <h3 className="mt-4 font-extrabold">Free starter access</h3>
          <p className="mt-3 text-[#5d7171]">Start with a focused free set of questions.</p>
        </div>
      </section>
      <section className="mx-auto max-w-[1280px] px-5 py-16 text-center">
        <h2 className="text-2xl font-extrabold">How it works</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {[
            { title: 'Study', text: 'Review signs, rules, and controls through clear study cards.', icon: BookOpen, href: '/study' },
            { title: 'Practice', text: 'Answer practice-style questions and get instant feedback.', icon: Pencil, href: '/practice' },
            { title: 'Mock Test', text: 'Take a full practice simulation and see section results.', icon: Trophy, href: '/full-mock' },
          ].map(({ title, text, icon: Icon, href }) => (
            <Link key={title} href={href} className="rounded-xl p-5 text-center transition hover:bg-[#effafa]">
              <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#e5f4f0] text-[#087f78]">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-4 font-extrabold">{title}</h3>
              <p className="mt-3 text-[#5d7171]">{text}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto mb-12 grid max-w-[1280px] gap-6 rounded-xl border border-[#c8dfdc] bg-[#effafa] p-8 lg:grid-cols-[1fr_1.4fr] lg:items-center">
        <div>
          <h2 className="text-2xl font-extrabold">Your progress, all in one place</h2>
          <p className="mt-3 text-[#53686a]">Track section readiness, review results, and focus on what matters next.</p>
          <ul className="mt-4 flex flex-col gap-2 text-sm font-semibold text-[#53686a]">
            <li>✓ Section readiness overview</li>
            <li>✓ Quick access to Study, Practice, and Mock Test</li>
            <li>✓ Results and weak areas at a glance</li>
          </ul>
          <Link href="/dashboard" className="mt-6 inline-block rounded-lg border border-[#087f78] bg-white px-4 py-3 font-bold text-[#087f78]">View dashboard</Link>
        </div>
        <div className="grid gap-3 rounded-xl border border-[#d8e2e0] bg-white p-5 sm:grid-cols-3">
          <div className="grid place-items-center rounded-lg bg-[#f8fbfa] p-5 text-center">
            <strong className="text-4xl text-[#087f78]">76%</strong>
            <span className="mt-2 text-xs font-bold text-[#718181]">Mock result</span>
          </div>
          <div className="flex flex-col gap-3 p-2 text-sm">
            <span>Road Signs <b className="float-right">80%</b></span>
            <div className="h-2 rounded-full bg-[#e4e9e8]"><div className="h-2 w-4/5 rounded-full bg-[#1a9d92]" /></div>
            <span>Rules of the Road <b className="float-right">70%</b></span>
            <div className="h-2 rounded-full bg-[#e4e9e8]"><div className="h-2 w-[70%] rounded-full bg-[#1a9d92]" /></div>
          </div>
          <div className="flex flex-col gap-3 p-2">
            <Link href="/practice" className="rounded-lg border border-[#d2dfdc] p-3 text-left font-bold">Review wrong answers</Link>
            <Link href="/practice" className="rounded-lg border border-[#d2dfdc] p-3 text-left font-bold">Practise Vehicle Controls</Link>
            <button onClick={() => router.push('/full-mock')} className="rounded-lg border border-[#d2dfdc] p-3 text-left font-bold">Retake mock test</button>
          </div>
        </div>
      </section>
    </>
  )
}
