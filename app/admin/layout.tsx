import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const metadata: Metadata = {
  title: 'Admin | DrivoPrep',
  description: 'Manage study modules, practice questions, mock tests, and quizzes.',
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f6faf9] text-[#142238] lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
