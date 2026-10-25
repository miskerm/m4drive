import type { Metadata } from 'next'
import { LoginPage } from '@/components/pages/login-page'

export const metadata: Metadata = {
  title: 'Login | DrivoPrep',
  description: 'Login to your DrivoPrep learner account.',
}

export default function LoginRoute() {
  return <LoginPage />
}
