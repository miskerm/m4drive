import type { Metadata } from 'next'
import { PracticePage } from '@/components/pages/practice-page'

export const metadata: Metadata = {
  title: 'Practice Questions | DrivoPrep',
  description: 'Practise learner test questions with instant feedback.',
}

export default function PracticeRoute() {
  return <PracticePage />
}
