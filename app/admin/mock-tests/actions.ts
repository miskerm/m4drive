'use server'

import { revalidatePath } from 'next/cache'
import { parseMockWorkbook } from '@/lib/mock-excel'
import { addMockTest, deleteMockTest } from '@/lib/db'
import type { MockImportState, MockSaveState, ParsedMockQuestion } from '@/lib/mock-types'

const MAX_FILE_BYTES = 15 * 1024 * 1024
const MAX_QUESTIONS = 500

const idleImport: MockImportState = {
  status: 'idle',
  message: '',
  questions: [],
  warnings: [],
  suggestedTitle: '',
  fileName: '',
}

export async function importMockExcelAction(
  _previousState: MockImportState,
  formData: FormData,
): Promise<MockImportState> {
  const file = formData.get('mockExcel')

  if (!(file instanceof File) || file.size === 0) {
    return { ...idleImport, status: 'error', message: 'Choose an Excel file (.xlsx, .xls, or .csv) to import.' }
  }
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
    return { ...idleImport, status: 'error', message: 'Only .xlsx, .xls, and .csv files can be imported.' }
  }
  if (file.size > MAX_FILE_BYTES) {
    return { ...idleImport, status: 'error', message: 'The file is too large. Use a workbook smaller than 15 MB.' }
  }

  try {
    const result = parseMockWorkbook(await file.arrayBuffer(), file.name)

    if (result.questions.length === 0) {
      return {
        ...idleImport,
        status: 'error',
        fileName: file.name,
        warnings: result.warnings,
        message:
          'No questions could be read. Check that the sheet has a Question column and option columns (Option A-D), plus a correct answer column.',
      }
    }

    const sheetNote = result.sheetNames.length > 1 ? ` across ${result.sheetNames.length} sheets` : ''
    return {
      status: 'success',
      message: `Read ${result.questions.length} question${result.questions.length === 1 ? '' : 's'}${sheetNote} in Excel order. Review them below, then save the mock test.`,
      questions: result.questions,
      warnings: result.warnings,
      suggestedTitle: result.suggestedTitle,
      fileName: file.name,
    }
  } catch (error) {
    console.error('Failed to read mock test workbook:', error)
    return {
      ...idleImport,
      status: 'error',
      fileName: file.name,
      message: 'The workbook could not be read. Make sure it is a valid Excel or CSV file and try again.',
    }
  }
}

function parseQuestions(raw: FormDataEntryValue | null): ParsedMockQuestion[] | null {
  if (typeof raw !== 'string' || !raw.trim()) return null

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return null

    const questions: ParsedMockQuestion[] = []
    for (const item of parsed) {
      if (!item || typeof item !== 'object') return null
      const entry = item as Record<string, unknown>
      const question = String(entry.question ?? '').trim()
      const correct = String(entry.correct ?? '').trim()
      const options = Array.isArray(entry.options)
        ? entry.options.map((option) => String(option).trim()).filter(Boolean)
        : []

      if (!question || options.length < 2 || !options.includes(correct)) return null

      questions.push({
        position: questions.length + 1,
        question,
        options,
        correct,
        explanation: String(entry.explanation ?? '').trim(),
        module: String(entry.module ?? '').trim(),
        difficulty: String(entry.difficulty ?? '').trim(),
      })
    }

    return questions
  } catch {
    return null
  }
}

export async function saveMockTestAction(
  _previousState: MockSaveState,
  formData: FormData,
): Promise<MockSaveState> {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const fileName = String(formData.get('fileName') ?? '').trim() || 'manual-entry'
  const timeLimitRaw = Number(formData.get('timeLimit'))
  const passMarkRaw = Number(formData.get('passMark'))
  const questions = parseQuestions(formData.get('questions'))

  if (!title) return { status: 'error', message: 'Add a title for the mock test.' }
  if (!questions) {
    return { status: 'error', message: 'Import an Excel file with valid questions before saving.' }
  }
  if (questions.length > MAX_QUESTIONS) {
    return { status: 'error', message: `A mock test can contain at most ${MAX_QUESTIONS} questions.` }
  }
  if (!Number.isFinite(passMarkRaw) || passMarkRaw < 1 || passMarkRaw > 100) {
    return { status: 'error', message: 'Pass mark must be between 1 and 100.' }
  }
  if (!Number.isFinite(timeLimitRaw) || timeLimitRaw < 1 || timeLimitRaw > 600) {
    return { status: 'error', message: 'Time limit must be between 1 and 600 minutes.' }
  }

  try {
    await addMockTest({
      title,
      description: description || `Imported from ${fileName}`,
      fileName,
      timeLimitMin: Math.round(timeLimitRaw),
      passMark: Math.round(passMarkRaw),
      questions,
    })

    revalidatePath('/admin/mock-tests')
    revalidatePath('/full-mock')

    return {
      status: 'success',
      message: `Saved “${title}” with ${questions.length} question${questions.length === 1 ? '' : 's'} in Excel order.`,
    }
  } catch (error) {
    console.error('Failed to save mock test:', error)
    return { status: 'error', message: 'The mock test could not be saved. Check the database connection and try again.' }
  }
}

export async function deleteMockTestAction(formData: FormData) {
  const id = String(formData.get('id') ?? '').trim()
  if (!id) return

  try {
    await deleteMockTest(id)
    revalidatePath('/admin/mock-tests')
    revalidatePath('/full-mock')
  } catch (error) {
    console.error('Failed to delete mock test:', error)
  }
}
