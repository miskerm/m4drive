import { AdminShell } from '@/components/admin-shell'
import { ModuleForm } from '@/components/module-form'
import { QuestionImporter } from '@/components/question-importer'

const copy: Record<string, { title: string; description: string; note: string }> = {
  users: { title: 'Users', description: 'Review learner accounts and access at a glance.', note: 'User management controls will be added in the next pass.' },
  'add-practice': { title: 'Add practice', description: 'Create practice questions for the learner dashboard.', note: 'The practice authoring interface is ready for functionality to be connected.' },
  'add-mock-test': { title: 'Add mock test', description: 'Organize full-length test content for premium learners.', note: 'Mock test authoring controls will be added after the Study flow is complete.' },
  'add-quizzes': { title: 'Add quizzes', description: 'Create short, focused knowledge checks.', note: 'Quiz authoring controls will be added after the Study flow is complete.' },
}

export default async function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params
  if (section === 'add-module') return <AdminShell title="Add study module" description="Publish a clear study resource that learners can open from the Study dashboard."><ModuleForm /></AdminShell>
  const page = copy[section] ?? copy.users
  if (section === 'add-practice' || section === 'add-mock-test' || section === 'add-quizzes') {
    const kind = section === 'add-practice' ? 'practice' : section === 'add-mock-test' ? 'mock-test' : 'quiz'
    return <AdminShell title={page.title} description={page.description}><QuestionImporter kind={kind} /></AdminShell>
  }
  return <AdminShell title={page.title} description={page.description}><div className="rounded-2xl border border-dashed border-[#b9d8d3] bg-white p-10 text-center shadow-sm"><div className="mx-auto max-w-lg"><p className="text-lg font-extrabold">Workspace ready</p><p className="mt-3 leading-7 text-[#607477]">{page.note}</p><div className="mt-6 rounded-xl bg-[#effaf7] p-4 text-sm font-semibold text-[#087f78]">This page is intentionally separated so its content and actions can grow independently.</div></div></div></AdminShell>
}
