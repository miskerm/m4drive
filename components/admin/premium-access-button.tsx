'use client'

import { useFormStatus } from 'react-dom'
import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react'
import { setPremiumRestrictionAction } from '@/app/admin/users/actions'

function SubmitButton({ restricted, flagged }: { restricted: boolean; flagged: boolean }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
        restricted
          ? 'border-[#bfe5da] bg-[#e6f5f3] text-[#06625e] hover:bg-[#d9f0ed]'
          : flagged
            ? 'border-[#c24834] bg-[#c24834] text-white hover:bg-[#a93a28]'
            : 'border-[#e7c9c9] bg-white text-[#b33636] hover:bg-[#fdeeee]'
      }`}
    >
      {pending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : restricted ? (
        <ShieldCheck className="size-3.5" />
      ) : (
        <ShieldOff className="size-3.5" />
      )}
      {pending ? 'Updating…' : restricted ? 'Restore premium' : 'Restrict premium'}
    </button>
  )
}

export function PremiumAccessButton({
  email,
  name,
  restricted,
  flagged,
}: {
  email: string
  name: string
  restricted: boolean
  flagged: boolean
}) {
  return (
    <form
      action={setPremiumRestrictionAction}
      onSubmit={(event) => {
        if (restricted) return
        const label = name && name !== 'Learner' ? name : email
        if (!window.confirm(`Restrict premium access for ${label}?\n\nThey will lose full mock tests and premium content at their next sign-in.`)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="restricted" value={restricted ? 'false' : 'true'} />
      <SubmitButton restricted={restricted} flagged={flagged} />
    </form>
  )
}
