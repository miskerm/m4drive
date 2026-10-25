import type { Metadata } from 'next'
import { InfoPage } from '@/components/pages/info-page'

export const metadata: Metadata = { title: 'Notifications | DrivoPrep' }

export default function NotificationsPage() {
  return <InfoPage page="notifications" />
}
