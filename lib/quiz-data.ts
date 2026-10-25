export type User = { name: string; email: string; plan: 'free' | 'premium_1000' } | null

export type PracticeQuestion = { id: number; question: string; options: string[]; correct: string }
export type PracticeTopic = { name: string; detail: string; questions: PracticeQuestion[] }

export const practiceTopics: PracticeTopic[] = [
  {
    name: 'Road Signs',
    detail: 'Warning, regulatory, and information signs.',
    questions: [
      { id: 1, question: 'What does a red triangular sign mean?', options: ['Mandatory action', 'Warning', 'Information'], correct: 'Warning' },
      { id: 2, question: 'What does a red circle with a number inside mean?', options: ['Minimum speed', 'Maximum speed limit', 'Distance to the next town'], correct: 'Maximum speed limit' },
      { id: 3, question: 'What colour are information and direction signs?', options: ['Blue or green', 'Red', 'Yellow'], correct: 'Blue or green' },
    ],
  },
  {
    name: 'Rules of the Road',
    detail: 'Speed limits, lanes, intersections, and right of way.',
    questions: [
      { id: 1, question: 'What is the speed limit in a residential area?', options: ['40 km/h', '60 km/h', '80 km/h'], correct: '60 km/h' },
      { id: 2, question: 'At a four-way stop, who may go first?', options: ['The largest vehicle', 'The vehicle that stopped first', 'The vehicle turning right'], correct: 'The vehicle that stopped first' },
      { id: 3, question: 'What is the general speed limit on a freeway?', options: ['100 km/h', '120 km/h', '140 km/h'], correct: '120 km/h' },
    ],
  },
  {
    name: 'Vehicle Controls',
    detail: 'Mirrors, pedals, lights, and safety checks.',
    questions: [
      { id: 1, question: 'Which foot control slows or stops the vehicle?', options: ['Accelerator', 'Brake', 'Clutch'], correct: 'Brake' },
      { id: 2, question: 'When should you apply the parking brake?', options: ['When parked', 'When turning', 'When overtaking'], correct: 'When parked' },
      { id: 3, question: 'What must you check before changing lanes?', options: ['Only the interior mirror', 'Mirrors and blind spot', 'Nothing if you indicate'], correct: 'Mirrors and blind spot' },
    ],
  },
  {
    name: 'Safe Driving',
    detail: 'Defensive driving habits and hazard awareness.',
    questions: [
      { id: 1, question: 'What is the minimum following distance in good conditions?', options: ['1 second', '2 seconds', '5 seconds'], correct: '2 seconds' },
      { id: 2, question: 'What is the legal blood alcohol limit for ordinary drivers?', options: ['0.05 g per 100 ml', '0.08 g per 100 ml', '0.10 g per 100 ml'], correct: '0.05 g per 100 ml' },
      { id: 3, question: 'What should you do if oncoming headlights dazzle you?', options: ['Flash your lights back', 'Look at the left edge of the road and slow down', 'Speed up to pass quickly'], correct: 'Look at the left edge of the road and slow down' },
    ],
  },
]

export const totalPracticeQuestions = practiceTopics.reduce((sum, topic) => sum + topic.questions.length, 0)

export type ResultEntry = { label: string; score: number; at: number }
export type NotificationEntry = { kind: 'completed' | 'left'; title: string; message: string; at: number; read: boolean }
export type ProgressState = {
  answers: Record<string, boolean>
  attempts: number
  correctAttempts: number
  results: ResultEntry[]
  activeDays: string[]
  notifications: NotificationEntry[]
}

export const emptyProgress: ProgressState = { answers: {}, attempts: 0, correctAttempts: 0, results: [], activeDays: [], notifications: [] }

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function computeStreak(activeDays: string[]) {
  const days = new Set(activeDays)
  const cursor = new Date()
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(dayKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function computeStats(progress: ProgressState) {
  const topicStats = practiceTopics.map((topic) => {
    const keys = topic.questions.map((question) => `${topic.name}:${question.id}`)
    const answered = keys.filter((key) => key in progress.answers).length
    const correct = keys.filter((key) => progress.answers[key]).length
    return { name: topic.name, answered, total: keys.length, mastery: Math.round((correct / keys.length) * 100) }
  })
  const uniqueAnswered = topicStats.reduce((sum, topic) => sum + topic.answered, 0)
  return {
    overallProgress: Math.round((uniqueAnswered / totalPracticeQuestions) * 100),
    topicsCompleted: topicStats.filter((topic) => topic.answered === topic.total).length,
    totalTopics: practiceTopics.length,
    questionsAnswered: progress.attempts,
    averageScore: progress.attempts ? Math.round((progress.correctAttempts / progress.attempts) * 100) : 0,
    streak: computeStreak(progress.activeDays),
    topicStats,
    results: progress.results,
  }
}

export function formatResultTime(timestamp: number) {
  const date = new Date(timestamp)
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dayKey(date) === dayKey(new Date())) return `Today, ${time}`
  if (dayKey(date) === dayKey(yesterday)) return `Yesterday, ${time}`
  return `${date.toLocaleDateString()}, ${time}`
}
