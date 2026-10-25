export type ParsedMockQuestion = {
  position: number
  question: string
  options: string[]
  correct: string
  explanation: string
  module: string
  difficulty: string
}

export type MockImportState = {
  status: 'idle' | 'success' | 'error'
  message: string
  questions: ParsedMockQuestion[]
  warnings: string[]
  suggestedTitle: string
  fileName: string
}

export type MockSaveState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export type SavedMockTest = {
  id: string
  title: string
  description: string
  fileName: string
  questionCount: number
  timeLimitMin: number | null
  passMark: number
  createdAt: string
}
