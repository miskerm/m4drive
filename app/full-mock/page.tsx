import type { Metadata } from 'next'
import { FullMockTestPage } from '@/components/pages/mock-test-page'

export const metadata: Metadata = {
  title: 'Full Mock Test | DrivoPrep',
  description: 'Complete a full 64-question Code 2 mock test.',
}

export default function FullMockRoute() {
  return <FullMockTestPage />
}
