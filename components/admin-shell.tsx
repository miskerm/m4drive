'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, ClipboardCheck, FileQuestion, LayoutDashboard, Menu, PanelLeftClose, ShieldCheck, Users, X } from 'lucide-react'

const items = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/add-module', label: 'Add module', icon: BookOpen },
  { href: '/admin/add-practice', label: 'Add practice', icon: ClipboardCheck },
  { href: '/admin/add-mock-test', label: 'Add mock test', icon: FileQuestion },
  { href: '/admin/add-quizzes', label: 'Add quizzes', icon: ClipboardCheck },
]

export function AdminShell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-[#f6faf9] text-[#142238]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#d8e2e0] bg-white p-5 shadow-xl transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}><span className="grid size-10 place-items-center rounded-xl bg-[#e1f2ef] text-[#087f78]"><ShieldCheck className="size-6" /></span><span><strong className="block text-lg">DrivoPrep</strong><span className="text-xs font-bold uppercase tracking-widest text-[#168f82]">Admin portal</span></span></Link>
          <button className="rounded-lg p-2 text-[#607477] lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button>
        </div>
        <nav className="mt-10 flex flex-col gap-2" aria-label="Admin navigation">{items.map(({ href, label, icon: Icon }) => { const active = href === '/admin' ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${active ? 'bg-[#087f78] text-white shadow-sm' : 'text-[#53686a] hover:bg-[#effaf7] hover:text-[#087f78]'}`}><Icon className="size-5" />{label}</Link> })}</nav>
        <div className="mt-auto rounded-2xl bg-[#effaf7] p-4 text-sm"><p className="font-extrabold text-[#087f78]">Content workspace</p><p className="mt-2 leading-6 text-[#607477]">Manage what learners see across Study, Practice, Mock Test, and Quizzes.</p></div>
      </aside>
      {open && <button className="fixed inset-0 z-30 bg-[#142238]/30 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
      <div className="lg:pl-72"><header className="sticky top-0 z-20 border-b border-[#d8e2e0] bg-white/95 px-5 py-4 backdrop-blur lg:px-10"><button className="mr-3 rounded-lg border border-[#bfcecb] p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button><Link href="/" className="text-sm font-bold text-[#087f78]">← Client site</Link></header><main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-12"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#168f82]">Admin workspace</p><h1 className="mt-2 text-3xl font-extrabold tracking-tight lg:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-[#607477]">{description}</p></div>{children}</main></div>
    </div>
  )
}
