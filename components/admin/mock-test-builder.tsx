'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Download,
  FileText,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  deleteMockTestAction,
  importMockExcelAction,
  saveMockTestAction,
} from '@/app/admin/mock-tests/actions'
import type {
  MockImportState,
  MockSaveState,
  ParsedMockQuestion,
  SavedMockTest,
} from '@/lib/mock-types'

const initialImport: MockImportState = {
  status: 'idle',
  message: '',
  questions: [],
  warnings: [],
  suggestedTitle: '',
  fileName: '',
}

const initialSave: MockSaveState = { status: 'idle', message: '' }

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MockTestBuilder({ savedTests }: { savedTests: SavedMockTest[] }) {
  const router = useRouter()
  const [importState, importAction, importing] = useActionState(importMockExcelAction, initialImport)
  const [saveState, saveAction, saving] = useActionState(saveMockTestAction, initialSave)
  const [questions, setQuestions] = useState<ParsedMockQuestion[]>([])
  const [fileName, setFileName] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [timeLimit, setTimeLimit] = useState('60')
  const [passMark, setPassMark] = useState('75')
  const [notice, setNotice] = useState('')
  const importFormRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (importState.status !== 'success') return
    setQuestions(importState.questions)
    setFileName(importState.fileName)
    setNotice('')
    if (importState.suggestedTitle) {
      setTitle((current) => (current.trim() ? current : importState.suggestedTitle))
    }
  }, [importState])

  useEffect(() => {
    if (saveState.status !== 'success') return
    setNotice(saveState.message)
    setQuestions([])
    setFileName('')
    setDescription('')
    importFormRef.current?.reset()
    router.refresh()
  }, [saveState, router])

  const questionCount = questions.length
  const saveMessage = notice || (saveState.status === 'error' ? saveState.message : '')

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-[#fff1ed] text-[#ef6a57]">
                <ClipboardList className="size-5" />
              </span>
              <div>
                <h2 className="text-lg font-extrabold text-[#142238]">Import a mock test from Excel</h2>
                <p className="mt-1 max-w-xl text-sm text-[#607477]">
                  Upload your workbook and the questions are read in sheet order, row by row. Review them, then save.
                </p>
              </div>
            </div>
            <a
              href="/api/admin/mock-template"
              className="inline-flex items-center gap-2 rounded-lg border border-[#bfcecb] bg-white px-3 py-2 text-xs font-bold text-[#087f78]"
            >
              <Download className="size-4" />
              Download template
            </a>
          </div>

          <div className="mt-5 rounded-lg border border-[#dbe8e6] bg-[#f8fbfa] p-4 text-xs leading-5 text-[#3d5153]">
            <p className="font-bold text-[#142238]">Expected layout</p>
            <p className="mt-1">
              <code className="rounded bg-white px-1 py-0.5">Question</code>{' '}
              <code className="rounded bg-white px-1 py-0.5">Option A</code>{' '}
              <code className="rounded bg-white px-1 py-0.5">Option B</code>{' '}
              <code className="rounded bg-white px-1 py-0.5">Option C</code>{' '}
              <code className="rounded bg-white px-1 py-0.5">Option D</code>{' '}
              <code className="rounded bg-white px-1 py-0.5">Correct Answer</code>{' '}
              <code className="rounded bg-white px-1 py-0.5">Explanation</code>{' '}
              <code className="rounded bg-white px-1 py-0.5">Module</code>{' '}
              <code className="rounded bg-white px-1 py-0.5">Difficulty</code>
            </p>
            <p className="mt-1.5">
              The correct answer can be a letter (A-D), a number (1-4), or the exact option text. Headers are optional
              when the columns follow this order. .xlsx, .xls, and .csv are accepted.
            </p>
          </div>

          <form ref={importFormRef} action={importAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              name="mockExcel"
              type="file"
              accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              required
              className="block w-full flex-1 cursor-pointer rounded-lg border border-[#cbd9d7] bg-white px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#fff1ed] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-[#c24834]"
            />
            <button
              type="submit"
              disabled={importing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#ef6a57] px-4 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="size-4" />
              {importing ? 'Reading…' : 'Read Excel'}
            </button>
          </form>

          {importState.status !== 'idle' && (
            <div
              className={`mt-4 rounded-lg p-3 text-sm font-semibold ${
                importState.status === 'success' ? 'bg-[#e6f5f3] text-[#06625e]' : 'bg-[#fdeeee] text-[#b33636]'
              }`}
            >
              <p className="flex items-start gap-2">
                {importState.status === 'success' ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                )}
                {importState.message}
              </p>
            </div>
          )}

          {importState.warnings.length > 0 && (
            <div className="mt-3 rounded-lg border border-[#f2dfac] bg-[#fffaf0] p-3 text-xs leading-5 text-[#8a6410]">
              <p className="flex items-center gap-2 font-bold">
                <AlertTriangle className="size-4" />
                Import notes
              </p>
              <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
                {importState.warnings.map((warning, index) => (
                  <li key={`${warning}-${index}`}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {questionCount > 0 && (
          <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-lg bg-[#e6f5f3] text-[#087f78]">
                  <FileText className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-[#142238]">Questions read in order</h2>
                  <p className="mt-1 text-xs font-semibold text-[#607477]">
                    {fileName || 'Imported workbook'} · {questionCount} question{questionCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[#e6f5f3] px-3 py-1 text-sm font-bold text-[#06625e]">
                1 → {questionCount}
              </span>
            </div>

            <ol className="mt-5 max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {questions.map((question) => (
                <li key={question.position} className="rounded-lg border border-[#e3e8e6] bg-[#f8fbfa] p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#087f78] text-xs font-bold text-white">
                      {question.position}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold leading-6 text-[#142238]">{question.question}</p>
                      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {question.options.map((option, index) => {
                          const isCorrect = option === question.correct
                          return (
                            <li
                              key={`${question.position}-${option}`}
                              className={`flex items-start gap-2 rounded-md px-2 py-1 text-xs leading-5 ${
                                isCorrect ? 'bg-[#e6f5f3] font-bold text-[#06625e]' : 'text-[#3d5153]'
                              }`}
                            >
                              <span className="font-bold">{String.fromCharCode(65 + index)}.</span>
                              <span>{option}</span>
                              {isCorrect && <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />}
                            </li>
                          )
                        })}
                      </ul>
                      {question.explanation && (
                        <p className="mt-2 text-xs leading-5 text-[#607477]">Explanation: {question.explanation}</p>
                      )}
                      {(question.module || question.difficulty) && (
                        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-bold text-[#06625e]">
                          {question.module && (
                            <span className="rounded-full bg-white px-2 py-0.5 shadow-sm">{question.module}</span>
                          )}
                          {question.difficulty && (
                            <span className="rounded-full bg-white px-2 py-0.5 shadow-sm">{question.difficulty}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-[#142238]">Mock test details</h2>
          <p className="mt-1 text-sm text-[#607477]">
            These details are saved with the imported questions. Questions keep their Excel order.
          </p>

          <form action={saveAction} className="mt-5 space-y-4">
            <input type="hidden" name="questions" value={JSON.stringify(questions)} />
            <input type="hidden" name="fileName" value={fileName} />

            <div>
              <label htmlFor="mock-title" className="text-sm font-bold text-[#314957]">
                Mock test title
              </label>
              <input
                id="mock-title"
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Code 2 Full Mock Test"
                className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]"
              />
            </div>

            <div>
              <label htmlFor="mock-description" className="text-sm font-bold text-[#314957]">
                Description (optional)
              </label>
              <textarea
                id="mock-description"
                name="description"
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What does this mock test cover?"
                className="mt-1.5 w-full resize-y rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="mock-count" className="text-sm font-bold text-[#314957]">
                  Questions
                </label>
                <input
                  id="mock-count"
                  readOnly
                  value={questionCount}
                  className="mt-1.5 w-full rounded-lg border border-[#dbe8e6] bg-[#f8fbfa] px-3 py-2.5 text-sm font-bold text-[#06625e]"
                />
              </div>
              <div>
                <label htmlFor="mock-time" className="text-sm font-bold text-[#314957]">
                  Minutes
                </label>
                <input
                  id="mock-time"
                  name="timeLimit"
                  type="number"
                  min={1}
                  max={600}
                  value={timeLimit}
                  onChange={(event) => setTimeLimit(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]"
                />
              </div>
              <div>
                <label htmlFor="mock-pass" className="text-sm font-bold text-[#314957]">
                  Pass mark %
                </label>
                <input
                  id="mock-pass"
                  name="passMark"
                  type="number"
                  min={1}
                  max={100}
                  value={passMark}
                  onChange={(event) => setPassMark(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#cbd9d7] px-3 py-2.5 text-sm outline-none focus:border-[#087f78]"
                />
              </div>
            </div>

            {saveMessage && (
              <p
                role="status"
                className="flex items-start gap-2 rounded-lg bg-[#effafa] p-3 text-sm font-semibold text-[#06625e]"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                {saveMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={saving || questionCount === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#087f78] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="size-4" />
              {saving ? 'Saving…' : questionCount === 0 ? 'Import an Excel file to save' : `Save mock test (${questionCount} questions)`}
            </button>
          </form>
        </section>
      </div>

      <section className="h-fit rounded-xl border border-[#d8e2e0] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#142238]">Saved mock tests</h2>
            <p className="mt-1 text-sm text-[#607477]">Stored in Turso with questions in Excel order.</p>
          </div>
          <span className="rounded-full bg-[#fff1ed] px-3 py-1 text-sm font-bold text-[#c24834]">
            {savedTests.length}
          </span>
        </div>

        {savedTests.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-[#c5d8d4] bg-[#f8fbfa] p-8 text-center">
            <ClipboardList className="mx-auto size-9 text-[#8aa5a1]" />
            <p className="mt-3 text-sm font-bold text-[#314957]">No mock tests saved yet</p>
            <p className="mt-1 text-xs text-[#718181]">Import an Excel file above to create the first one.</p>
          </div>
        ) : (
          <ul className="mt-5 flex flex-col gap-3">
            {savedTests.map((test) => (
              <li key={test.id} className="rounded-lg border border-[#e3e8e6] bg-[#f8fbfa] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-extrabold text-[#142238]">{test.title}</p>
                    <p className="mt-0.5 truncate text-xs text-[#607477]">{test.fileName}</p>
                  </div>
                  <form
                    action={deleteMockTestAction}
                    onSubmit={(event) => {
                      if (!window.confirm(`Delete “${test.title}”? Its questions will be removed.`)) {
                        event.preventDefault()
                      }
                    }}
                  >
                    <input type="hidden" name="id" value={test.id} />
                    <button
                      type="submit"
                      aria-label={`Delete ${test.title}`}
                      className="rounded-lg border border-[#e7c9c9] p-1.5 text-[#b33636] hover:bg-[#fdeeee]"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </form>
                </div>
                {test.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#3d5153]">{test.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold text-[#06625e]">
                  <span className="rounded-full bg-[#e6f5f3] px-2.5 py-1">{test.questionCount} questions</span>
                  {test.timeLimitMin !== null && (
                    <span className="rounded-full bg-[#e6f5f3] px-2.5 py-1">{test.timeLimitMin} min</span>
                  )}
                  <span className="rounded-full bg-[#e6f5f3] px-2.5 py-1">Pass {test.passMark}%</span>
                </div>
                {test.createdAt && (
                  <p className="mt-2 text-[11px] font-semibold text-[#718181]">Saved {formatDate(test.createdAt)}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
