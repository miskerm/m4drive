import type { Metadata } from 'next'
import { InfoPage } from '@/components/pages/info-page'

export const metadata: Metadata = { title: 'Feedback | DrivoPrep' }

export default function FeedbackPage() {
  return <InfoPage page="feedback" />
}
