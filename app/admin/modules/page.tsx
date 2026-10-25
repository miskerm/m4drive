import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { ModuleManager } from '@/components/admin/module-manager'
import { getStudyModules } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminModulesPage() {
  const modules = await getStudyModules()

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8 lg:py-10">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#168f82]">Study content</p>
          <h1 className="mt-1 text-3xl font-extrabold">Add Module</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#607477]">Upload the title, description, and PDF for a study module. It is stored in Turso and appears on the learner Study page.</p>
        </div>
        <Link href="/study" className="inline-flex items-center gap-2 rounded-lg border border-[#bfcecb] bg-white px-4 py-2.5 text-sm font-bold text-[#087f78]">
          <ExternalLink className="size-4" />
          View Study page
        </Link>
      </header>

      <ModuleManager modules={modules} />
    </main>
  )
}
