import type { Metadata } from 'next'
import { InfoPage } from '@/components/pages/info-page'

export const metadata: Metadata = { title: 'Account | DrivoPrep' }

export default function AccountPage() {
  return <InfoPage page="account" />
}
