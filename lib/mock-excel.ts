import 'server-only'

import * as XLSX from 'xlsx'
import type { ParsedMockQuestion } from '@/lib/mock-types'

const MAX_QUESTIONS = 500
const MAX_WARNINGS = 12

type OptionKey = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

type OptionColumn = { index: number; key: OptionKey }

type ColumnMap = {
  question: number
  options: OptionColumn[]
  optionsList: number | null
  correct: number | null
  explanation: number | null
  module: number | null
  difficulty: number | null
  order: number | null
}

export type MockWorkbookResult = {
  questions: ParsedMockQuestion[]
  warnings: string[]
  skippedCount: number
  suggestedTitle: string
  sheetNames: string[]
}

const OPTION_KEYS: OptionKey[] = ['A', 'B', 'C', 'D', 'E', 'F']

function text(value: unknown) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function headerKey(value: unknown) {
  return text(value).toLowerCase().replace(/[^a-z0-9]/g, '')
}

function cell(row: unknown[], index: number | null) {
  if (index === null || index < 0) return ''
  return text(row[index])
}

function matchOptionKey(value: unknown): OptionKey | null {
  const key = headerKey(value)
  if (!key) return null

  const single = key.match(/^([a-f])$/)
  if (single) return single[1].toUpperCase() as OptionKey

  const lettered = key.match(/^(?:option|opt|choice|answer)([a-f])$/)
  if (lettered) return lettered[1].toUpperCase() as OptionKey

  const numbered = key.match(/^(?:option|opt|choice|answer)([1-6])$/)
  if (numbered) return OPTION_KEYS[Number(numbered[1]) - 1] ?? null

  return null
}

function isOrderHeader(key: string) {
  return /^(no|number|num|id|order|position|pos|index|sn|sr|sno|serial|questionno|questionnumber|qno|qnumber|itemno)$/.test(key)
}

function isQuestionHeader(key: string) {
  return /^(q|question|questions|questiontext|prompt|item|statement|scenario)$/.test(key)
}

function isCorrectHeader(key: string) {
  return /^(correct|correctanswer|correctoption|correctchoice|answer|answerkey|key)$/.test(key)
}

function isOptionsListHeader(key: string) {
  return /^(options|choices|alloptions|answeroptions)$/.test(key)
}

function isExplanationHeader(key: string) {
  return /^(explanation|explain|reason|rationale|note|notes|feedback)$/.test(key)
}

function isModuleHeader(key: string) {
  return /^(module|modules|topic|category|section|subject|area)$/.test(key)
}

function isDifficultyHeader(key: string) {
  return /^(difficulty|level|complexity)$/.test(key)
}

function looksLikeHeader(row: unknown[]) {
  const keys = row.map(headerKey).filter(Boolean)
  const hasQuestion = keys.some((key) => isQuestionHeader(key))
  const hasSupport = keys.some(
    (key) => matchOptionKey(key) !== null || isCorrectHeader(key) || isOptionsListHeader(key),
  )
  return hasQuestion && hasSupport
}

function mapFromHeader(row: unknown[]): ColumnMap | null {
  let question: number | null = null
  let correct: number | null = null
  let optionsList: number | null = null
  let explanation: number | null = null
  let module: number | null = null
  let difficulty: number | null = null
  let order: number | null = null
  const options: OptionColumn[] = []

  row.forEach((value, index) => {
    const key = headerKey(value)
    if (!key) return

    if (isOrderHeader(key)) {
      if (order === null) order = index
      return
    }

    const optionKey = matchOptionKey(value)
    if (optionKey) {
      if (!options.some((option) => option.key === optionKey)) options.push({ index, key: optionKey })
      return
    }

    if (question === null && isQuestionHeader(key)) {
      question = index
      return
    }
    if (correct === null && isCorrectHeader(key)) {
      correct = index
      return
    }
    if (optionsList === null && isOptionsListHeader(key)) {
      optionsList = index
      return
    }
    if (explanation === null && isExplanationHeader(key)) {
      explanation = index
      return
    }
    if (module === null && isModuleHeader(key)) {
      module = index
      return
    }
    if (difficulty === null && isDifficultyHeader(key)) {
      difficulty = index
      return
    }
  })

  if (question === null) return null
  if (options.length === 0 && optionsList === null) return null

  options.sort((a, b) => OPTION_KEYS.indexOf(a.key) - OPTION_KEYS.indexOf(b.key))

  return { question, options, optionsList, correct, explanation, module, difficulty, order }
}

function positionalMap(offset: number): ColumnMap {
  return {
    question: offset,
    options: [
      { index: offset + 1, key: 'A' },
      { index: offset + 2, key: 'B' },
      { index: offset + 3, key: 'C' },
      { index: offset + 4, key: 'D' },
    ],
    optionsList: null,
    correct: offset + 5,
    explanation: offset + 6,
    module: null,
    difficulty: null,
    order: offset === 1 ? 0 : null,
  }
}

function hasIndexColumn(rows: unknown[][], start: number) {
  let checked = 0
  let numeric = 0
  for (let index = start; index < Math.min(rows.length, start + 12); index++) {
    const row = rows[index]
    if (!row || row.every((value) => !text(value))) continue
    checked++
    if (/^\d+$/.test(text(row[0])) && text(row[1])) numeric++
  }
  return checked >= 3 && numeric === checked
}

function splitOptions(value: string) {
  if (!value) return []
  const trimmed = value.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      if (Array.isArray(parsed)) {
        return parsed.map((item) => text(item)).filter(Boolean)
      }
    } catch {
      // fall through to delimiter parsing
    }
  }
  return trimmed
    .split(/\s*[|;]\s*/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function dedupe(values: string[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    if (!value || seen.has(value.toLowerCase())) return false
    seen.add(value.toLowerCase())
    return true
  })
}

function loose(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

function resolveCorrect(raw: string, options: string[]): string | null {
  const value = raw.trim()
  if (!value) return null

  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const letter = compact.match(/^(?:OPTION|OPT|CHOICE|ANSWER)?([A-F])$/)
  if (letter) {
    const index = letter[1].charCodeAt(0) - 65
    if (index < options.length) return options[index]
  }

  const number = compact.match(/^(?:OPTION|OPT|CHOICE|ANSWER)?([1-6])$/)
  if (number) {
    const index = Number(number[1]) - 1
    if (index < options.length) return options[index]
  }

  const exact = options.find((option) => option.toLowerCase() === value.toLowerCase())
  if (exact) return exact

  const normalized = loose(value)
  const near = options.find((option) => loose(option) === normalized)
  if (near) return near

  return null
}

function inferCorrectColumn(
  rows: unknown[][],
  start: number,
  map: ColumnMap,
): number | null {
  const used = new Set<number>()
  used.add(map.question)
  if (map.optionsList !== null) used.add(map.optionsList)
  if (map.explanation !== null) used.add(map.explanation)
  if (map.module !== null) used.add(map.module)
  if (map.difficulty !== null) used.add(map.difficulty)
  if (map.order !== null) used.add(map.order)
  map.options.forEach((option) => used.add(option.index))

  const sample = rows.slice(start, Math.min(rows.length, start + 25))
  const columnCount = sample.reduce((max, row) => Math.max(max, row.length), 0)
  let best: { index: number; hits: number } | null = null

  for (let index = 0; index < columnCount; index++) {
    if (used.has(index)) continue
    let nonEmpty = 0
    let matches = 0
    for (const row of sample) {
      const raw = text(row[index])
      if (!raw) continue
      const options = map.options.map((option) => cell(row, option.index)).filter(Boolean)
      if (options.length < 2) continue
      nonEmpty++
      if (resolveCorrect(raw, options)) matches++
    }
    if (nonEmpty >= 2 && matches === nonEmpty && (!best || matches > best.hits)) {
      best = { index, hits: matches }
    }
  }

  return best?.index ?? null
}

function suggestTitle(workbook: XLSX.WorkBook, fileName: string) {
  const propertyTitle = text(workbook.Props?.Title)
  if (propertyTitle && !/^sheet\d*$/i.test(propertyTitle)) return propertyTitle

  const base = fileName.replace(/\.(xlsx|xls|csv)$/i, '').replace(/[_-]+/g, ' ').trim()
  if (base && !/^(book|workbook|export|sheet\d*)$/i.test(base)) return base

  const namedSheet = workbook.SheetNames.find((name) => !/^sheet\d*$/i.test(name))
  return namedSheet ?? 'Mock test'
}

export function parseMockWorkbook(buffer: ArrayBuffer, fileName: string): MockWorkbookResult {
  const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array', cellDates: false })
  const questions: ParsedMockQuestion[] = []
  const warnings: string[] = []
  let skippedCount = 0

  const warn = (message: string) => {
    if (warnings.length < MAX_WARNINGS) warnings.push(message)
  }

  let titleFromSheet = ''

  for (const sheetName of workbook.SheetNames) {
    if (questions.length >= MAX_QUESTIONS) break
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue

    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false,
    })
    if (rows.length === 0) continue

    let headerIndex = -1
    let map: ColumnMap | null = null

    for (let index = 0; index < Math.min(rows.length, 10); index++) {
      if (looksLikeHeader(rows[index] ?? [])) {
        headerIndex = index
        map = mapFromHeader(rows[index] ?? [])
        break
      }
    }

    let start = headerIndex >= 0 ? headerIndex + 1 : 0

    if (headerIndex < 0) {
      const firstRow = rows[0] ?? []
      const filled = firstRow.map(text).filter(Boolean)
      if (filled.length === 1 && filled[0].length > 3) {
        titleFromSheet ||= filled[0]
        start = 1
      }
      const offset = hasIndexColumn(rows, start) ? 1 : 0
      map = positionalMap(offset)
    }

    if (!map) continue
    if (map.correct === null) {
      map.correct = inferCorrectColumn(rows, start, map)
    }

    const sheetStart = questions.length
    const orderValues: Array<number | null> = []

    for (let rowIndex = start; rowIndex < rows.length; rowIndex++) {
      if (questions.length >= MAX_QUESTIONS) break
      const row = rows[rowIndex] ?? []
      if (row.every((value) => !text(value))) continue

      const excelRow = rowIndex + 1
      const question = cell(row, map.question)

      if (!question) {
        skippedCount++
        warn(`${sheetName}, row ${excelRow}: skipped because the question text is empty.`)
        continue
      }

      let options: string[]
      if (map.optionsList !== null && !map.options.length) {
        options = splitOptions(cell(row, map.optionsList))
      } else {
        options = map.options.map((option) => cell(row, option.index)).filter(Boolean)
        if (map.optionsList !== null) {
          const extra = splitOptions(cell(row, map.optionsList))
          if (extra.length > options.length) options = extra
        }
      }
      options = dedupe(options).slice(0, OPTION_KEYS.length)

      if (options.length < 2) {
        skippedCount++
        warn(`${sheetName}, row ${excelRow}: skipped because it has fewer than two answer options.`)
        continue
      }

      const rawCorrect = cell(row, map.correct)
      if (!rawCorrect) {
        skippedCount++
        warn(`${sheetName}, row ${excelRow}: skipped because the correct answer is empty.`)
        continue
      }

      const correct = resolveCorrect(rawCorrect, options)
      if (!correct) {
        skippedCount++
        warn(
          `${sheetName}, row ${excelRow}: skipped because "${rawCorrect}" does not match any option (use A-D, 1-4, or the exact option text).`,
        )
        continue
      }

      questions.push({
        position: questions.length + 1,
        question,
        options,
        correct,
        explanation: cell(row, map.explanation),
        module: cell(row, map.module),
        difficulty: cell(row, map.difficulty),
      })

      const rawOrder = map.order !== null ? cell(row, map.order) : ''
      orderValues.push(/^\d+$/.test(rawOrder) ? Number(rawOrder) : null)
    }

    // When the workbook includes an Order/No column, honour it. Otherwise keep sheet row order.
    if (questions.length > sheetStart) {
      const created = questions.splice(sheetStart)
      const ordered = created.map((question, index) => ({ question, order: orderValues[index] }))
      if (ordered.length > 1 && ordered.every((item) => item.order !== null)) {
        ordered.sort((a, b) => (a.order as number) - (b.order as number))
      }
      questions.push(...ordered.map((item) => item.question))
    }
  }

  questions.forEach((question, index) => {
    question.position = index + 1
  })

  if (questions.length >= MAX_QUESTIONS) {
    warn(`Only the first ${MAX_QUESTIONS} questions were imported. Split larger workbooks into multiple mock tests.`)
  }
  if (skippedCount > warnings.length) {
    warn(`${skippedCount - warnings.length} more row(s) were skipped.`)
  }

  return {
    questions,
    warnings,
    skippedCount,
    suggestedTitle: titleFromSheet || suggestTitle(workbook, fileName),
    sheetNames: workbook.SheetNames,
  }
}
