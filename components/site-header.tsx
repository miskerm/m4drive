'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { BarChart3, House, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/components/providers'

export function SiteHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const isHome = pathname === '/'
  const isDashboard = pathname.startsWith('/dashboard')

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className={`sticky top-0 z-20 border-b backdrop-blur ${isDashboard ? 'border-[#b9d8d3] bg-[#e7f6f2]/95' : 'border-[#dce6e4] bg-[#f8faf8]/95'}`}>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-left">
          <div className="grid size-10 place-items-center rounded-full bg-[#e1f2ef] text-[#066f70]">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="text-[16px] font-extrabold">DrivoPrep</div>
            <div className="text-xs text-[#677775]">Get ready for your learners licence</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/" className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${isHome ? 'bg-[#007b78] text-white shadow-sm' : 'border border-[#bfcecb] bg-white text-[#314957]'}`}>
            <House className="size-4" />
            DrivoPrep Learners
          </Link>
          <Link href="/dashboard" className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold ${isDashboard ? 'bg-[#007b78] text-white shadow-sm' : 'border border-[#bfcecb] bg-white text-[#314957]'}`}>
            <BarChart3 className="size-4" />
            Dashboard
          </Link>
          <Link href="/pricing" className="rounded-lg border border-[#bfcecb] bg-white px-4 py-2.5 text-sm">
            Pricing
          </Link>
          {user ? (
            <>
              {user.plan.startsWith('premium') && (
                <Link href="/admin/users" className="rounded-lg border border-[#bfcecb] bg-white px-4 py-2.5 text-sm font-bold">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-[#bfcecb] bg-white px-4 py-2.5 text-sm text-red-600">
                <LogOut className="size-4" />
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-lg border border-[#007b78] bg-white px-4 py-2.5 text-sm font-bold text-[#007b78]">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
