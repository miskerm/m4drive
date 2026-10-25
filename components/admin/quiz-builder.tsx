'use client'

import { useState } from 'react'
import { Plus, Sparkles, Trash2 } from 'lucide-react'
import { practiceTopics } from '@/lib/quiz-data'

type DraftQuiz = {
  id: number
  title: string
  module: string
  questionCount: string
  seconds: string
  mode: string
}

const emptyForm = { title: '', module: practiceTopics[0].name, questionCount: '10', seconds: '30', mode: 'Multiple choice' }

export function QuizBuilder() {
  const [form, setForm] = useState(emptyForm)
  const [drafts, setDrafts] = useState<DraftQuiz[]>([])
  const [notice, setNotice] = useState('')

  const setField = (field: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const addQuiz = () => {
    if (!form.title.trim()) {
      setNotice('Add a title for the quiz.')
      return
    }
    setDrafts((items) => [{ id: Date.now(), ...form, title: form.title.trim() }, ...items])
    setForm(emptyForm)
    setNotice('Quiz added to the draft list.')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-[#fff8e6] text-[#d79a0b]"><Sparkles className="size-5" /></span>
          <div>
            <h2 className="text-lg font-extrabold text-[#142238]">Add a quiz</h2>
            <p className="mt-1 text-sm text-[#607477]">Create short warm-up quizzes for the learner dashboard. Saving will be connected later.</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="quiz-title" className="text-sm font-bold text-[#314957]">Quiz title</label>
            <input id="quiz-title" value={form.title} onChange={(event) => setField('title', event.target.value)} placeholder="e.g. Road signs warm-up" className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quiz-module" className="text-sm font-bold text-[#314957]">Topic</label>
              <select id="quiz-module" value={form.module} onChange={(event) => setField('module', event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#087f78]">
                {practiceTopics.map((topic) => <option key={topic.name} value={topic.name}>{topic.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="quiz-mode" className="text-sm font-bold text-[#314957]">Format</label>
              <select id="quiz-mode" value={form.mode} onChange={(event) => setField('mode', event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#087f78]">
                {['Multiple choice', 'True or false', 'Mixed'].map((mode) => <option key={mode}>{mode}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="quiz-count" className="text-sm font-bold text-[#314957]">Questions</label>
              <input id="quiz-count" type="number" min={1} max={50} value={form.questionCount} onChange={(event) => setField('questionCount', event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]" />
            </div>
            <div>
              <label htmlFor="quiz-seconds" className="text-sm font-bold text-[#314957]">Seconds per question</label>
              <input id="quiz-seconds" type="number" min={5} max={300} value={form.seconds} onChange={(event) => setField('seconds', event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]" />
            </div>
          </div>
        </div>

        {notice && <p className="mt-4 rounded-lg bg-[#effafa] p-3 text-sm font-semibold text-[#06625e]">{notice}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={addQuiz} className="inline-flex items-center gap-2 rounded-lg bg-[#d79a0b] px-4 py-2.5 font-bold text-white"><Plus className="size-4" />Add quiz</button>
          <button type="button" disabled title="Coming soon" className="rounded-lg border border-[#bfcecb] px-4 py-2.5 font-bold text-[#607477] opacity-70">Save quiz (coming soon)</button>
        </div>
      </section>

      <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#142238]">Draft quizzes</h2>
            <p className="mt-1 text-sm text-[#607477]">Local preview only — nothing is saved yet.</p>
          </div>
          <span className="rounded-full bg-[#fff8e6] px-3 py-1 text-sm font-bold text-[#a97608]">{drafts.length}</span>
        </div>
        {drafts.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-[#c5d8d4] bg-[#f8fbfa] p-8 text-center text-sm font-semibold text-[#718181]">No draft quizzes yet.</div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {drafts.map((draft) => (
              <li key={draft.id} className="rounded-lg border border-[#e3e8e6] bg-[#f8fbfa] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-[#142238]">{draft.title}</p>
                    <p className="mt-1 text-xs font-semibold text-[#607477]">{draft.module} · {draft.mode}</p>
                  </div>
                  <button onClick={() => setDrafts((items) => items.filter((item) => item.id !== draft.id))} aria-label="Remove draft quiz" className="rounded-lg border border-[#e7c9c9] p-1.5 text-[#b33636]"><Trash2 className="size-4" /></button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#06625e]">
                  <span className="rounded-full bg-[#e6f5f3] px-2.5 py-1">{draft.questionCount} questions</span>
                  <span className="rounded-full bg-[#e6f5f3] px-2.5 py-1">{draft.seconds}s each</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
