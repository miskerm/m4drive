'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Check } from 'lucide-react'
import { useProgress } from '@/components/providers'
import { practiceTopics } from '@/lib/quiz-data'

export function PracticePage() {
  const [current, setCurrent] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [activeModule, setActiveModule] = useState('Road Signs')
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionAnswered, setSessionAnswered] = useState(0)
  const { recordAnswer, recordResult, notify } = useProgress()
  const router = useRouter()

  const modules = practiceTopics
  const practiceQuestions = (modules.find((module) => module.name === activeModule) ?? modules[0]).questions
  const q = practiceQuestions[current - 1]

  const answerQuestion = (option: string) => {
    if (answered) return
    const isCorrect = option === q.correct
    setSelected(option)
    setAnswered(true)
    setSessionAnswered((count) => count + 1)
    if (isCorrect) setSessionCorrect((count) => count + 1)
    recordAnswer(activeModule, q.id, isCorrect)
  }

  const notifyIfLeftEarly = () => {
    if (sessionAnswered === 0 || sessionAnswered >= practiceQuestions.length) return
    notify('left', `You left the ${activeModule} topic`, `You answered ${sessionAnswered} of ${practiceQuestions.length} questions. Please come back and finish this topic.`)
  }

  const switchModule = (name: string) => {
    if (name === activeModule) return
    notifyIfLeftEarly()
    setActiveModule(name)
    setCurrent(1)
    setSelected(null)
    setAnswered(false)
    setSessionCorrect(0)
    setSessionAnswered(0)
  }

  const goBack = () => {
    notifyIfLeftEarly()
    router.push('/dashboard')
  }

  const finishSession = () => {
    const score = Math.round((sessionCorrect / practiceQuestions.length) * 100)
    recordResult(`Practice - ${activeModule}`, score)
    notify('completed', `You completed the ${activeModule} topic`, `Good job! You scored ${score}% (${sessionCorrect} of ${practiceQuestions.length} correct).`)
    router.push('/dashboard')
  }

  const isCorrectAnswer = selected === q.correct

  return (
    <main className="min-h-screen bg-[#f6faf9] text-[#142238]">
      <div className="border-b border-[#e3e8e6] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-7 py-4">
          <h1 className="text-2xl font-extrabold text-[#142238]">Practice Questions</h1>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg border border-[#bfcecb] px-4 py-2.5 font-semibold text-[#087f78]">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
      </div>
      <div className="mx-auto max-w-[1000px] px-7 py-12">
        <section className="mb-6 rounded-xl border border-[#d8e2e0] bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#142238]">Practice modules</h2>
              <p className="mt-1 text-base leading-relaxed text-[#3d5153]">Choose a topic, then answer questions in a clear order.</p>
            </div>
            <span className="rounded-full bg-[#e6f5f3] px-3 py-1 text-sm font-bold text-[#06625e]">Free practice</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {modules.map((module, index) => (
              <button key={module.name} onClick={() => switchModule(module.name)} aria-pressed={activeModule === module.name} className={`rounded-lg border-2 p-4 text-left transition hover:border-[#168f82] ${activeModule === module.name ? 'border-[#168f82] bg-[#e6f5f3]' : 'border-[#d8e2e0] bg-white'}`}>
                <span className="text-xs font-bold tracking-wide text-[#06625e]">MODULE {index + 1}</span>
                <strong className="mt-1 block text-lg text-[#142238]">{module.name}</strong>
                <span className="mt-1 block text-base leading-relaxed text-[#3d5153]">{module.detail}</span>
              </button>
            ))}
          </div>
        </section>
        <div className="rounded-xl border border-[#d8e2e0] bg-white p-6 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-[#06625e]">{activeModule} · Question {current} of {practiceQuestions.length}</p>
          <h2 className="mt-4 text-pretty text-2xl font-extrabold leading-snug text-[#142238] sm:text-3xl">{q.question}</h2>
          <div className="mt-8 flex flex-col gap-3">
            {q.options.map((option) => {
              const showCorrect = answered && option === q.correct
              const showWrong = answered && selected === option && option !== q.correct
              return (
                <button key={option} onClick={() => answerQuestion(option)} disabled={answered} className={`flex w-full items-center justify-between gap-4 rounded-lg border-2 p-4 text-left text-lg font-semibold leading-relaxed text-[#142238] transition ${showCorrect ? 'border-[#168f82] bg-[#e6f5f3]' : showWrong ? 'border-[#d94c4c] bg-[#fdeeee]' : 'border-[#c9d6d4] bg-white hover:border-[#168f82] hover:bg-[#f3fbf9]'} disabled:cursor-default`}>
                  <span>{option}</span>
                  {showCorrect && <Check className="size-6 shrink-0 text-[#087f78]" aria-label="Correct answer" />}
                </button>
              )
            })}
          </div>
          {answered && (
            <div role="status" className={`mt-8 rounded-lg border p-4 ${isCorrectAnswer ? 'border-[#bfe3dc] bg-[#e6f5f3]' : 'border-[#f2c4c4] bg-[#fdeeee]'}`}>
              <p className={`text-lg font-bold ${isCorrectAnswer ? 'text-[#06625e]' : 'text-[#b33636]'}`}>{isCorrectAnswer ? 'Good job! Correct answer.' : 'Not quite yet.'}</p>
              <p className="mt-2 text-base leading-relaxed text-[#142238]">The correct answer is: <strong>{q.correct}</strong></p>
            </div>
          )}
          {answered && current < practiceQuestions.length && <button onClick={() => { setCurrent(current + 1); setSelected(null); setAnswered(false) }} className="mt-6 w-full rounded-lg bg-[#087f78] px-4 py-3 text-lg font-bold text-white">Next Question</button>}
          {answered && current === practiceQuestions.length && <button onClick={finishSession} className="mt-6 w-full rounded-lg bg-[#087f78] px-4 py-3 text-lg font-bold text-white">Complete &amp; Go Back</button>}
        </div>
        {sessionAnswered > 0 && sessionAnswered < practiceQuestions.length && (
          <button onClick={goBack} className="mt-5 text-sm font-bold text-[#087f78] underline underline-offset-4">
            Leave this topic and go back to the dashboard
          </button>
        )}
      </div>
    </main>
  )
}
