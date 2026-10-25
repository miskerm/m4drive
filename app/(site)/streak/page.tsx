import type { Metadata } from 'next'
import { InfoPage } from '@/components/pages/info-page'

export const metadata: Metadata = { title: 'Streak | DrivoPrep' }

export default function StreakPage() {
  return <InfoPage page="streak" />
}
