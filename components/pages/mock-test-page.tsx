'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, CircleHelp, Clock3, ShieldAlert, ShieldCheck, Trophy } from 'lucide-react'
import { useAuth } from '@/components/providers'

const questions = Array.from({ length: 64 }, (_, index) => index + 1)
const options = ['Nr 9', 'Interior mirror', 'Nr 11']

function MockHeader({ title, current, onBack }: { title: string; current: number; onBack?: () => void }) {
  return (
    <div className="border-b border-[#dbe5e4] bg-white">
      <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-5 py-4">
        <div className="flex items-center gap-3 text-xl font-extrabold">
          <ShieldCheck className="size-9 text-[#0b7e7a]" />
          {title}
        </div>
        <div className="ml-auto flex items-center gap-3 font-bold">
          <Clock3 className="text-[#168e8a]" />
          52:45 <span>{current} / 64</span>
          <div className="hidden h-2 w-80 rounded-full bg-[#20a49d] sm:block" />
        </div>
        {onBack ? (
          <button onClick={onBack} className="hidden rounded-lg border border-[#8eb7b3] px-4 py-2.5 font-semibold text-[#176d6b] sm:block">
            <ArrowLeft className="mr-2 inline size-4" />
            Back
          </button>
        ) : (
          <Link href="/dashboard" className="hidden rounded-lg border border-[#8eb7b3] px-4 py-2.5 font-semibold text-[#176d6b] sm:block">
            <ArrowLeft className="mr-2 inline size-4" />
            Back
          </Link>
        )}
      </div>
    </div>
  )
}

function QuestionGrid({ current, onSelect }: { current: number; onSelect: (value: number) => void }) {
  return (
    <aside className="rounded-xl border border-[#dfe7e6] bg-white p-3">
      <h2 className="font-extrabold">Questions (64)</h2>
      <div className="mt-4 grid grid-cols-8 gap-2">
        {questions.map((question) => (
          <button key={question} onClick={() => onSelect(question)} className={`rounded-md border px-1 py-1 text-xs font-bold ${question === current ? 'border-[#e5bc45] bg-[#fff8da]' : question < current ? 'border-[#bce3df] bg-[#e6f5f3] text-[#106c69]' : 'border-[#dbe8e6] bg-white text-[#116c69]'}`}>
            Q{question}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-lg bg-[#f3faf9] p-3 text-xs leading-5">
        <CircleHelp className="mr-2 inline size-5 text-[#1fa39d]" />
        <b>Tip:</b> You can jump between questions anytime.
      </div>
    </aside>
  )
}

function QuestionPanel({ current, selected, onSelect }: { current: number; selected: string; onSelect: (option: string) => void }) {
  return (
    <section className="rounded-xl border border-[#dfe7e6] bg-white p-7">
      <div className="flex items-center gap-3">
        <span className="rounded-md bg-[#e6f5f3] px-3 py-1 text-xs font-bold uppercase text-[#168f82]">Question {current}</span>
        <span className="text-xs font-bold uppercase text-[#168f82]">Vehicle Controls</span>
      </div>
      <h2 className="mt-4 text-2xl font-extrabold">Which numbered foot control slows or stops the vehicle?</h2>
      <div className="mt-8 space-y-3">
        {options.map((option) => (
          <label key={option} className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 ${selected === option ? 'border-[#168f82] bg-[#e6f5f3]' : 'border-[#d8e2e0] bg-white'}`}>
            <input type="radio" checked={selected === option} onChange={() => onSelect(option)} className="size-5 accent-[#168f82]" />
            <span className="font-semibold">{option}</span>
          </label>
        ))}
      </div>
    </section>
  )
}

export function QuickQuizPage() {
  const [current, setCurrent] = useState(1)
  const [selected, setSelected] = useState('Interior mirror')
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="min-h-screen bg-[#f6faf9] text-[#142238]">
      <MockHeader title="Quick Quiz" current={current} />
      <div className="mx-auto grid max-w-[1440px] gap-5 p-5 lg:grid-cols-[280px_1fr]">
        <QuestionGrid current={current} onSelect={setCurrent} />
        <div>
          <div className="mb-4 flex justify-end gap-3">
            <button onClick={() => setSubmitted(true)} className="rounded-lg bg-[#cf2638] px-4 py-2.5 font-semibold text-white">Submit quiz</button>
            <Link href="/dashboard" className="rounded-lg border border-[#8eb7b3] px-4 py-2.5 font-semibold text-[#176d6b]">Back</Link>
          </div>
          <QuestionPanel current={current} selected={selected} onSelect={setSelected} />
          {submitted && <div className="mt-5 rounded-lg bg-[#e4f5e9] p-4 text-center font-bold text-[#21855b]">✓ Quick quiz submitted! Your score: 52/64</div>}
        </div>
      </div>
    </main>
  )
}

export function FullMockTestPage() {
  const { user, access, refreshAccess } = useAuth()
  const [current, setCurrent] = useState(64)
  const [selected, setSelected] = useState('Interior mirror')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (user?.email) void refreshAccess()
  }, [user?.email, refreshAccess])

  if (!user || !user.plan.startsWith('premium')) {
    const restricted = Boolean(access?.restricted)
    return (
      <main className="min-h-screen bg-[#f6faf9] text-[#142238]">
        <div className="border-b border-[#dbe5e4] bg-white">
          <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-5 py-4">
            <div className="flex items-center gap-3 text-xl font-extrabold">
              <ShieldCheck className="size-9 text-[#0b7e7a]" />
              Code 2 Full Mock Test
            </div>
            <Link href="/dashboard" className="ml-auto rounded-lg border border-[#8eb7b3] px-4 py-2.5 font-semibold text-[#176d6b]">
              <ArrowLeft className="mr-2 inline size-4" />
              Back
            </Link>
          </div>
        </div>
        <div className="mx-auto max-w-[720px] px-5 py-16">
          <section className="rounded-2xl border border-[#f2d1c6] bg-white p-8 text-center shadow-sm">
            <span className={`mx-auto grid size-16 place-items-center rounded-2xl ${restricted ? 'bg-[#fdf1f1] text-[#c04a4a]' : 'bg-[#fff6f3] text-[#ef6a57]'}`}>
              {restricted ? <ShieldAlert className="size-8" /> : <Trophy className="size-8" />}
            </span>
            <h1 className="mt-5 text-3xl font-extrabold">{restricted ? 'Premium access restricted' : 'Unlock the full mock test'}</h1>
            <p className="mt-3 text-base leading-7 text-[#607477]">
              {restricted && access
                ? `The admin restricted premium access for ${access.email} because this account is active on ${access.deviceCount} device${access.deviceCount === 1 ? '' : 's'}. Premium is limited to one device — ask the admin to restore access.`
                : 'Full mock tests are part of Premium. Upgrade to take the complete 64-question Code 2 simulation and see your results.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {!restricted && (
                <Link href="/pricing" className="rounded-lg bg-[#ff9318] px-5 py-3 font-bold text-white">View Premium plan</Link>
              )}
              <Link href="/dashboard" className="rounded-lg border border-[#bfcecb] bg-white px-5 py-3 font-bold text-[#087f78]">Back to dashboard</Link>
            </div>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f6faf9] text-[#142238]">
      <MockHeader title="Code 2 Full Mock Test" current={current} />
      <div className="mx-auto grid max-w-[1440px] gap-5 p-5 lg:grid-cols-[280px_1fr]">
        <QuestionGrid current={current} onSelect={setCurrent} />
        <div>
          <div className="mb-4 flex justify-end gap-3">
            <button onClick={() => setSubmitted(true)} className="rounded-lg bg-[#cf2638] px-4 py-2.5 font-semibold text-white">Submit</button>
            <Link href="/dashboard" className="rounded-lg border border-[#8eb7b3] px-4 py-2.5 font-semibold text-[#176d6b]">Back</Link>
          </div>
          <QuestionPanel current={current} selected={selected} onSelect={setSelected} />
          {submitted && <div className="mt-5 rounded-lg bg-[#fff3cd] p-4 text-center font-bold text-[#856404]">Mock test submitted! Score: 52/64</div>}
        </div>
      </div>
    </main>
  )
}
