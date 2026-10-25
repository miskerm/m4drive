import type { ReactNode } from 'react'
import { SiteHeader } from '@/components/site-header'

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6faf9] text-[#111b2d]">
      <SiteHeader />
      {children}
    </div>
  )
}
