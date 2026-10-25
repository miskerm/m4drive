import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

export function PricingPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[1280px] px-5 py-16">
      <Link href="/dashboard" className="mb-10 inline-flex items-center gap-2 rounded-lg border border-[#bfcecb] bg-white px-4 py-2.5 font-semibold text-[#087f78]">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to dashboard
      </Link>
      <section className="rounded-2xl border border-[#d8e2e0] bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-extrabold">Premium access</h1>
        <p className="mt-4 text-lg leading-8 text-[#607477]">One plan that unlocks every feature.</p>

        <div className="mt-12 max-w-md">
          <div className="rounded-xl border-2 border-[#ff9318] bg-[#fffaf0] p-6">
            <h2 className="text-2xl font-extrabold">Premium</h2>
            <p className="mt-2 text-4xl font-bold text-[#ff9318]">1000 ETB</p>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-3"><Check className="size-5 text-[#ff9318]" /><span>All practice questions</span></li>
              <li className="flex items-center gap-3"><Check className="size-5 text-[#ff9318]" /><span>Full mock tests</span></li>
              <li className="flex items-center gap-3"><Check className="size-5 text-[#ff9318]" /><span>Progress tracking</span></li>
              <li className="flex items-center gap-3"><Check className="size-5 text-[#ff9318]" /><span>Study materials</span></li>
              <li className="flex items-center gap-3"><Check className="size-5 text-[#ff9318]" /><span>Priority support</span></li>
              <li className="flex items-center gap-3"><Check className="size-5 text-[#ff9318]" /><span>Certificate of completion</span></li>
            </ul>
            <Link href="/login" className="mt-8 block w-full rounded-lg bg-[#ff9318] px-5 py-3 text-center font-bold text-white">Get Started</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
