'use client'

import { useActionState, useEffect, useRef } from 'react'
import { BookOpen, CheckCircle2, FileText, Trash2, Upload } from 'lucide-react'
import { createModuleAction, deleteModuleAction } from '@/app/admin/modules/actions'
import type { ModuleFormState, StudyModule } from '@/lib/types'

const initialState: ModuleFormState = { status: 'idle', message: '' }

function formatBytes(bytes: number) {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function ModuleManager({ modules }: { modules: StudyModule[] }) {
  const [state, formAction, pending] = useActionState(createModuleAction, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset()
  }, [state])

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-lg bg-[#e6f5f3] text-[#087f78]">
            <Upload className="size-5" />
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-[#142238]">Upload a study module</h2>
            <p className="mt-1 text-sm text-[#607477]">Title, description, and a PDF. Saved to Turso and published to the Study page.</p>
          </div>
        </div>

        <form ref={formRef} action={formAction} className="mt-6 space-y-4">
          <div>
            <label htmlFor="module-title" className="text-sm font-bold text-[#314957]">Module title</label>
            <input id="module-title" name="title" type="text" required placeholder="e.g. Road signs and signals" className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78] focus:ring-2 focus:ring-[#087f78]/20" />
          </div>
          <div>
            <label htmlFor="module-description" className="text-sm font-bold text-[#314957]">Description</label>
            <textarea id="module-description" name="description" required rows={4} placeholder="What will learners cover in this module?" className="mt-1.5 w-full resize-y rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78] focus:ring-2 focus:ring-[#087f78]/20" />
          </div>
          <div>
            <label htmlFor="module-file" className="text-sm font-bold text-[#314957]">Module upload (PDF)</label>
            <input id="module-file" name="moduleFile" type="file" accept="application/pdf,.pdf" required className="mt-1.5 block w-full cursor-pointer rounded-lg border border-[#cbd9d7] bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#e6f5f3] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-[#087f78]" />
            <p className="mt-1.5 text-xs text-[#718181]">PDF only, up to 20 MB. The file is stored in the database.</p>
          </div>

          {state.status !== 'idle' && (
            <p role="status" className={`flex items-start gap-2 rounded-lg p-3 text-sm font-semibold ${state.status === 'success' ? 'bg-[#e6f5f3] text-[#06625e]' : 'bg-[#fdeeee] text-[#b33636]'}`}>
              {state.status === 'success' && <CheckCircle2 className="mt-0.5 size-4 shrink-0" />}
              {state.message}
            </p>
          )}

          <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#087f78] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
            <Upload className="size-4" />
            {pending ? 'Uploading…' : 'Add module'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#142238]">Published modules</h2>
            <p className="mt-1 text-sm text-[#607477]">These modules are visible on the learner Study page.</p>
          </div>
          <span className="rounded-full bg-[#e6f5f3] px-3 py-1 text-sm font-bold text-[#06625e]">{modules.length}</span>
        </div>

        {modules.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-[#c5d8d4] bg-[#f8fbfa] p-8 text-center">
            <FileText className="mx-auto size-9 text-[#8aa5a1]" />
            <p className="mt-3 text-sm font-bold text-[#314957]">No modules uploaded yet</p>
            <p className="mt-1 text-xs text-[#718181]">Use the form to publish the first study module.</p>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {modules.map((module) => (
              <li key={module.id} className="rounded-lg border border-[#e3e8e6] bg-[#f8fbfa] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-[#087f78] shadow-sm">
                    <BookOpen className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#142238]">{module.title}</p>
                        <p className="mt-0.5 truncate text-xs text-[#607477]">{module.fileName}</p>
                      </div>
                      <form
                        action={deleteModuleAction}
                        onSubmit={(event) => {
                          if (!window.confirm(`Delete “${module.title}”? This cannot be undone.`)) event.preventDefault()
                        }}
                      >
                        <input type="hidden" name="id" value={module.id} />
                        <button type="submit" className="inline-flex items-center gap-1.5 rounded-lg border border-[#e7c9c9] px-2.5 py-1.5 text-xs font-bold text-[#b33636] hover:bg-[#fdeeee]">
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </form>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#3d5153]">{module.description}</p>
                    <p className="mt-2 text-xs font-semibold text-[#718181]">{formatBytes(module.fileSize)} · {formatDate(module.createdAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`/api/modules/${module.id}`} target="_blank" rel="noreferrer" className="rounded-lg bg-[#087f78] px-3 py-1.5 text-xs font-bold text-white">Preview</a>
                      <a href={`/study`} className="rounded-lg border border-[#bfcecb] px-3 py-1.5 text-xs font-bold text-[#087f78]">View in Study</a>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
