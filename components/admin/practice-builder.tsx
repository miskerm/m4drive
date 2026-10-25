'use client'

import { useState } from 'react'
import { CheckCircle2, Pencil, Plus, Trash2 } from 'lucide-react'
import { practiceTopics } from '@/lib/quiz-data'

type DraftQuestion = {
  id: number
  module: string
  question: string
  options: string[]
  correct: string
  explanation: string
  difficulty: string
}

const emptyForm = { module: practiceTopics[0].name, question: '', optionA: '', optionB: '', optionC: '', optionD: '', correct: '', explanation: '', difficulty: 'Easy' }

export function PracticeBuilder() {
  const [form, setForm] = useState(emptyForm)
  const [drafts, setDrafts] = useState<DraftQuestion[]>([])
  const [notice, setNotice] = useState('')

  const setField = (field: keyof typeof emptyForm, value: string) => setForm((current) => ({ ...current, [field]: value }))

  const addQuestion = () => {
    const options = [form.optionA, form.optionB, form.optionC, form.optionD].map((option) => option.trim()).filter(Boolean)
    if (!form.question.trim() || options.length < 2) {
      setNotice('Add a question and at least two answer options.')
      return
    }
    const correct = form.correct.trim() && options.includes(form.correct.trim()) ? form.correct.trim() : options[0]
    setDrafts((items) => [
      { id: Date.now(), module: form.module, question: form.question.trim(), options, correct, explanation: form.explanation.trim(), difficulty: form.difficulty },
      ...items,
    ])
    setForm({ ...emptyForm, module: form.module })
    setNotice('Question added to this draft practice set.')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
      <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-[#e6f5f3] text-[#087f78]"><Pencil className="size-5" /></span>
          <div>
            <h2 className="text-lg font-extrabold text-[#142238]">Add a practice question</h2>
            <p className="mt-1 text-sm text-[#607477]">Draft learner-style questions for a practice topic. Persistence will be connected after the Study module.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-[#314957]" htmlFor="practice-module">Practice topic</label>
            <select id="practice-module" value={form.module} onChange={(event) => setField('module', event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#087f78]">
              {practiceTopics.map((topic) => <option key={topic.name} value={topic.name}>{topic.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-[#314957]" htmlFor="practice-difficulty">Difficulty</label>
            <select id="practice-difficulty" value={form.difficulty} onChange={(event) => setField('difficulty', event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#087f78]">
              {['Easy', 'Medium', 'Hard'].map((level) => <option key={level}>{level}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-bold text-[#314957]" htmlFor="practice-question">Question</label>
          <textarea id="practice-question" rows={3} value={form.question} onChange={(event) => setField('question', event.target.value)} placeholder="Type the question exactly as learners should see it" className="mt-1.5 w-full resize-y rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([
            ['optionA', 'Option A'],
            ['optionB', 'Option B'],
            ['optionC', 'Option C'],
            ['optionD', 'Option D'],
          ] as const).map(([field, label]) => (
            <div key={field}>
              <label className="text-sm font-bold text-[#314957]" htmlFor={`practice-${field}`}>{label}</label>
              <input id={`practice-${field}`} value={form[field]} onChange={(event) => setField(field, event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]" />
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-bold text-[#314957]" htmlFor="practice-correct">Correct answer</label>
            <input id="practice-correct" value={form.correct} onChange={(event) => setField('correct', event.target.value)} placeholder="Must match one option" className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]" />
          </div>
          <div>
            <label className="text-sm font-bold text-[#314957]" htmlFor="practice-explanation">Explanation (optional)</label>
            <input id="practice-explanation" value={form.explanation} onChange={(event) => setField('explanation', event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]" />
          </div>
        </div>

        {notice && <p className="mt-4 rounded-lg bg-[#effafa] p-3 text-sm font-semibold text-[#06625e]">{notice}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={addQuestion} className="inline-flex items-center gap-2 rounded-lg bg-[#087f78] px-4 py-2.5 font-bold text-white"><Plus className="size-4" />Add to draft</button>
          <button type="button" disabled title="Coming soon" className="rounded-lg border border-[#bfcecb] px-4 py-2.5 font-bold text-[#607477] opacity-70">Save practice set (coming soon)</button>
        </div>
      </section>

      <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#142238]">Draft practice questions</h2>
            <p className="mt-1 text-sm text-[#607477]">Local preview only — nothing is saved yet.</p>
          </div>
          <span className="rounded-full bg-[#e6f5f3] px-3 py-1 text-sm font-bold text-[#06625e]">{drafts.length}</span>
        </div>
        {drafts.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-[#c5d8d4] bg-[#f8fbfa] p-8 text-center text-sm font-semibold text-[#718181]">No draft questions yet.</div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {drafts.map((draft) => (
              <li key={draft.id} className="rounded-lg border border-[#e3e8e6] bg-[#f8fbfa] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#168f82]">{draft.module} · {draft.difficulty}</p>
                    <p className="mt-1 text-sm font-extrabold text-[#142238]">{draft.question}</p>
                  </div>
                  <button onClick={() => setDrafts((items) => items.filter((item) => item.id !== draft.id))} aria-label="Remove draft question" className="rounded-lg border border-[#e7c9c9] p-1.5 text-[#b33636]"><Trash2 className="size-4" /></button>
                </div>
                <ul className="mt-2 space-y-1 text-xs text-[#3d5153]">
                  {draft.options.map((option) => <li key={option} className={option === draft.correct ? 'font-bold text-[#06625e]' : ''}>{option === draft.correct ? '✓ ' : '· '}{option}</li>)}
                </ul>
              </li>
            ))}
          </ul>
        )}
        {drafts.length > 0 && <p className="mt-4 flex items-start gap-2 rounded-lg bg-[#effafa] p-3 text-xs font-semibold text-[#06625e]"><CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />Draft ready. Database saving will be added with the practice module.</p>}
      </section>
    </div>
  )
}
