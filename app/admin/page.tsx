'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [question, setQuestion] = useState('')
  const [questions, setQuestions] = useState<string[]>([])
  const [pdf, setPdf] = useState('')

  return (
    <main className="min-h-screen bg-[#f6faf9] px-5 py-8 text-[#142238]">
      <div className="mx-auto max-w-[1280px]">
        <header className="mb-8 flex items-center justify-between rounded-xl border border-[#d8e2e0] bg-white px-6 py-4 shadow-sm">
          <div><p className="text-xs font-bold uppercase tracking-widest text-[#168f82]">DrivoPrep</p><h1 className="text-2xl font-extrabold">Admin Dashboard</h1></div>
          <a href="/#home" className="rounded-lg border border-[#bfcecb] px-4 py-2 font-semibold text-[#087f78]">Client site</a>
        </header>
        <section className="grid gap-4 md:grid-cols-4">
          {[['Paid learners', '128'], ['Revenue', '64,000 ETB'], ['Active devices', '96'], ['Mock questions', String(questions.length + 64)]].map(([label, value]) => <div key={label} className="rounded-xl border border-[#d8e2e0] bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-[#607477]">{label}</p><p className="mt-3 text-2xl font-extrabold">{value}</p></div>)}
        </section>
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Paid learners and devices</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-[#607477]"><th className="p-3">Learner</th><th className="p-3">Plan</th><th className="p-3">Device</th><th className="p-3">Status</th></tr></thead><tbody>{[['Lerato M.', 'Premium 500 ETB', 'Chrome / Linux', 'Paid'], ['Amanuel K.', 'Premium 1000 ETB', 'Android', 'Paid'], ['Sara T.', 'Premium 500 ETB', 'iPhone', 'Paid']].map((row) => <tr key={row[0]} className="border-b border-[#edf0ef]"><td className="p-3 font-bold">{row[0]}</td><td className="p-3">{row[1]}</td><td className="p-3">{row[2]}</td><td className="p-3 font-bold text-[#168f82]">{row[3]}</td></tr>)}</tbody></table></div></div>
          <div className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Upload study PDF</h2><p className="mt-2 text-sm text-[#607477]">Choose a PDF for the Study module. This frontend preview does not persist files.</p><label className="mt-5 inline-flex cursor-pointer rounded-lg bg-[#087f78] px-4 py-3 font-bold text-white">Choose PDF<input type="file" accept=".pdf" className="sr-only" onChange={(event) => setPdf(event.target.files?.[0]?.name ?? '')} /></label>{pdf && <p className="mt-3 text-sm font-bold text-[#168f82]">Ready: {pdf}</p>}</div>
        </section>
        <section className="mt-6 rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Learning module controls</h2><p className="mt-2 text-sm text-[#607477]">Open the learner modules to review content and manage the frontend experience.</p><div className="mt-4 flex flex-wrap gap-3"><a href="/?module=study" className="rounded-lg bg-[#168f82] px-4 py-3 font-bold text-white">Open Study Modules</a><a href="/?module=practice" className="rounded-lg bg-[#1784c0] px-4 py-3 font-bold text-white">Open Practice</a><a href="/?module=full-mock" className="rounded-lg bg-[#ef6a57] px-4 py-3 font-bold text-white">Open Mock Test</a></div></section>
        <section className="mt-6 rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Add mock-test question</h2><div className="mt-4 flex flex-col gap-3 md:flex-row"><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Type a new question" className="flex-1 rounded-lg border border-[#cbd9d7] p-3" /><button onClick={() => { if (question.trim()) { setQuestions((items) => [...items, question.trim()]); setQuestion('') } }} className="rounded-lg bg-[#168f82] px-5 py-3 font-bold text-white">Add question</button></div>{questions.length > 0 && <ul className="mt-5 flex flex-col gap-2">{questions.map((item, index) => <li key={`${item}-${index}`} className="rounded-lg bg-[#effafa] p-3 text-sm font-semibold">Q{index + 65}. {item}</li>)}</ul>}</section>
      </div>
    </main>
  )
}
