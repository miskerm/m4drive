import { PracticeBuilder } from '@/components/admin/practice-builder'

export default function AdminPracticePage() {
  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8 lg:py-10">
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-widest text-[#168f82]">Practice content</p>
        <h1 className="mt-1 text-3xl font-extrabold">Add Practice</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#607477]">Build practice questions for learner topics. This is a UI preview — saving will be connected after the Study module is finished.</p>
      </header>
      <PracticeBuilder />
    </main>
  )
}
