import type { Metadata } from 'next'
import { Dashboard } from '@/components/pages/dashboard'

export const metadata: Metadata = {
  title: 'Dashboard | DrivoPrep',
  description: 'Track your learner progress, streaks, and practice results.',
}

export default function DashboardPage() {
  return <Dashboard />
}
