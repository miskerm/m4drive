import type { Metadata } from 'next'
import { StudyPage } from '@/components/pages/study-page'
import { getStudyModules } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Study Materials | DrivoPrep',
  description: 'Read uploaded study modules and core learner topics.',
}

export default async function StudyRoute() {
  const modules = await getStudyModules()
  return <StudyPage modules={modules} />
}
