'use client'

import { useState } from 'react'

export function ModuleForm() {
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus('')
    const response = await fetch('/api/modules', { method: 'POST', body: new FormData(event.currentTarget) })
    setStatus(response.ok ? 'Module saved. It will appear in Study for learners.' : (await response.json()).error ?? 'Unable to save module.')
    if (response.ok) event.currentTarget.reset()
    setBusy(false)
  }
  return <form onSubmit={submit} className="max-w-2xl rounded-2xl border border-[#d8e2e0] bg-white p-6 shadow-sm"><div className="flex flex-col gap-5"><label className="flex flex-col gap-2 text-sm font-bold">Module title<input name="title" required className="rounded-xl border border-[#cbd9d7] px-4 py-3 font-normal outline-none focus:border-[#168f82]" placeholder="e.g. Road signs and signals" /></label><label className="flex flex-col gap-2 text-sm font-bold">Description<textarea name="description" required rows={5} className="rounded-xl border border-[#cbd9d7] px-4 py-3 font-normal outline-none focus:border-[#168f82]" placeholder="Describe what learners will study in this module." /></label><label className="flex flex-col gap-2 text-sm font-bold">Module PDF<input name="file" type="file" accept="application/pdf,.pdf" required className="rounded-xl border border-dashed border-[#b9d8d3] bg-[#effaf7] p-4 text-sm font-normal" /><span className="font-normal text-xs text-[#607477]">PDF files are stored in Turso with the module details.</span></label><button disabled={busy} className="rounded-xl bg-[#087f78] px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Saving…' : 'Save module'}</button>{status && <p role="status" className="rounded-xl bg-[#effaf7] p-4 text-sm font-semibold text-[#087f78]">{status}</p>}</div></form>
}
