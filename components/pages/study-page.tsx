'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, BookOpen, Download, FileText, Upload } from 'lucide-react'
import type { StudyModule } from '@/lib/types'

const notes = [
  { topic: 'Signs & Signals', content: 'Learn the meanings of South African road signs. Red signs are regulatory, yellow are warnings, and blue are informational.', image: '/study-road-scene.png' },
  { topic: 'Vehicle Controls', content: 'Master pedals, steering, mirrors, lights, and the safety controls you need before your first test.', image: '/study-road-scene.png' },
  { topic: 'Rules of the Road', content: 'Understand speed limits, right of way, lane discipline, intersections, and parking regulations.', image: '/study-road-scene.png' },
  { topic: 'Safe Driving', content: 'Build defensive driving habits that help you stay alert, calm, and safe on the road.', image: '/study-road-scene.png' },
]

function formatBytes(bytes: number) {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function StudyPage({ modules }: { modules: StudyModule[] }) {
  const [openModule, setOpenModule] = useState<string | null>(null)

  return (
    <main className="min-h-screen bg-white">
      <div className="border-b border-[#e3e8e6] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-7 py-4">
          <div>
            <h1 className="text-2xl font-extrabold">Study Materials</h1>
            <p className="mt-1 text-sm font-semibold text-[#607477]">Read uploaded guides and study the core learner topics.</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 rounded-lg border border-[#bfcecb] px-4 py-2.5 font-semibold text-[#087f78]">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-7 py-12">
        <section className="mb-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-[#142238]">Uploaded study modules</h2>
              <p className="mt-1 text-sm font-semibold text-[#607477]">Modules added by your instructor appear here.</p>
            </div>
            <Link href="/admin/modules" className="inline-flex items-center gap-2 rounded-lg bg-[#168f82] px-4 py-2.5 text-sm font-bold text-white">
              <Upload className="size-4" />
              Add module
            </Link>
          </div>

          {modules.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-[#c5d8d4] bg-[#f8fbfa] p-8 text-center">
              <FileText className="mx-auto size-10 text-[#8aa5a1]" />
              <p className="mt-3 text-base font-bold text-[#314957]">No uploaded modules yet</p>
              <p className="mt-1 text-sm text-[#607477]">Your instructor can add a PDF module from the admin dashboard.</p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => (
                <article key={module.id} className="flex flex-col overflow-hidden rounded-xl border border-[#d8e2e0] bg-white shadow-sm">
                  <div className="flex items-start gap-3 border-b border-[#edf0ef] bg-[#f8fbfa] p-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-[#e6f5f3] text-[#087f78]">
                      <BookOpen className="size-6" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-extrabold text-[#142238]">{module.title}</h3>
                      <p className="mt-1 truncate text-xs font-semibold text-[#718181]">{module.fileName}</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="flex-1 text-sm leading-6 text-[#3d5153]">{module.description}</p>
                    <p className="mt-4 text-xs font-semibold text-[#718181]">
                      {formatBytes(module.fileSize)}
                      {module.createdAt ? ` · Added ${formatDate(module.createdAt)}` : ''}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a href={`/api/modules/${module.id}`} target="_blank" rel="noreferrer" className="rounded-lg bg-[#168f82] px-4 py-2 text-sm font-bold text-white">
                        Open module
                      </a>
                      <a href={`/api/modules/${module.id}?download=1`} className="inline-flex items-center gap-2 rounded-lg border border-[#bfcecb] px-4 py-2 text-sm font-bold text-[#087f78]">
                        <Download className="size-4" />
                        Download
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-extrabold text-[#142238]">Core learner topics</h2>
          <p className="mt-1 text-sm font-semibold text-[#607477]">Start with these four study cards while you wait for new modules.</p>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            {notes.map((note) => (
              <article key={note.topic} className="overflow-hidden rounded-xl border border-[#d8e2e0] bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={note.image} alt={`${note.topic} study illustration`} className="h-36 w-full object-cover" />
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    <BookOpen className="size-6 text-[#168f82]" />
                    <h3 className="text-lg font-extrabold">{note.topic}</h3>
                  </div>
                  <p className="mt-4 leading-6 text-[#607477]">{note.content}</p>
                  <button onClick={() => setOpenModule(openModule === note.topic ? null : note.topic)} className="mt-6 rounded-lg border border-[#087f78] bg-white px-4 py-2 font-bold text-[#087f78]">
                    {openModule === note.topic ? 'Close module' : 'Open module notes'}
                  </button>
                  {openModule === note.topic && (
                    <div className="mt-4 rounded-lg bg-[#effafa] p-4 text-sm leading-6 text-[#38575a]">
                      <strong>Key lesson:</strong> Read the signs carefully, check mirrors before moving, and practise one safe decision at a time. This module is ready for learner review.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
