import { QuizBuilder } from '@/components/admin/quiz-builder'

export default function AdminQuizzesPage() {
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8 lg:py-10">
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-widest text-[#168f82]">Quick practice</p>
        <h1 className="mt-1 text-3xl font-extrabold">Add Quizzes</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#607477]">Create short warm-up quizzes for the learner dashboard. This is a UI preview — saving will be connected later.</p>
      </header>
      <QuizBuilder />
    </main>
  )
}
