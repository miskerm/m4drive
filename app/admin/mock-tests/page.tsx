import { MockTestBuilder } from '@/components/admin/mock-test-builder'
import { getMockTests } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminMockTestsPage() {
  const savedTests = await getMockTests()

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8 lg:py-10">
      <header className="mb-7">
        <p className="text-xs font-bold uppercase tracking-widest text-[#168f82]">Mock exams</p>
        <h1 className="mt-1 text-3xl font-extrabold">Add Mock Test</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#607477]">
          Upload your Excel workbook. Questions are read in order and fill the mock test automatically, then are saved
          to the database.
        </p>
      </header>
      <MockTestBuilder savedTests={savedTests} />
    </main>
  )
}
