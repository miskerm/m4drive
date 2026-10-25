import type { Metadata } from 'next'
import { QuickQuizPage } from '@/components/pages/mock-test-page'

export const metadata: Metadata = {
  title: 'Quick Quiz | DrivoPrep',
  description: 'Try a short warm-up quiz to test your learner knowledge.',
}

export default function QuizzesRoute() {
  return <QuickQuizPage />
}
