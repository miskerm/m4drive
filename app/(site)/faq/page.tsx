import type { Metadata } from 'next'
import { InfoPage } from '@/components/pages/info-page'

export const metadata: Metadata = { title: 'FAQ | DrivoPrep' }

export default function FaqPage() {
  return <InfoPage page="faq" />
}
