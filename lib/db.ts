import { createClient, type Client } from '@libsql/client'
import type { AdminUser, StudyModule, StudyModuleFile } from '@/lib/types'
import type { ParsedMockQuestion, SavedMockTest } from '@/lib/mock-types'
import type { LearnerAccess, LearnerDevice, LearnerPlan } from '@/lib/access-types'

let client: Client | undefined

export function db(): Client {
  const url = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!url) throw new Error('TURSO_DATABASE_URL is not configured')
  if (!client) client = createClient({ url, authToken, intMode: 'number' })
  return client
}

let tableReady = false

async function ensureStudyModulesTable() {
  if (tableReady) return
  await db().execute(`CREATE TABLE IF NOT EXISTS study_modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_data BLOB NOT NULL,
    created_at TEXT NOT NULL
  )`)
  tableReady = true
}

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  return Number(value ?? 0)
}

function toBytes(value: unknown): Uint8Array {
  if (value instanceof Uint8Array) return value
  if (value instanceof ArrayBuffer) return new Uint8Array(value)
  if (Array.isArray(value)) return new Uint8Array(value)
  return new Uint8Array()
}

async function withRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt < attempts - 1) await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
  throw lastError
}

export async function getStudyModules(): Promise<StudyModule[]> {
  try {
    return await withRetry(async () => {
      await ensureStudyModulesTable()
      const result = await db().execute(
        'SELECT id, title, description, file_name, length(file_data) AS file_size, created_at FROM study_modules ORDER BY id DESC',
      )
      return result.rows.map((row) => ({
        id: toNumber(row.id),
        title: String(row.title ?? ''),
        description: String(row.description ?? ''),
        fileName: String(row.file_name ?? ''),
        fileSize: toNumber(row.file_size),
        createdAt: String(row.created_at ?? ''),
      }))
    })
  } catch (error) {
    console.error('Could not load study modules:', error)
    return []
  }
}

export async function getStudyModuleFile(id: number): Promise<StudyModuleFile | null> {
  try {
    return await withRetry(async () => {
      await ensureStudyModulesTable()
      const result = await db().execute({
        sql: 'SELECT id, title, file_name, file_data FROM study_modules WHERE id = ?',
        args: [id],
      })
      const row = result.rows[0]
      if (!row) return null
      return {
        id: toNumber(row.id),
        title: String(row.title ?? ''),
        fileName: String(row.file_name ?? 'module.pdf'),
        data: toBytes(row.file_data),
      }
    })
  } catch (error) {
    console.error(`Could not load study module ${id}:`, error)
    return null
  }
}

export async function addStudyModule(input: {
  title: string
  description: string
  fileName: string
  fileData: Uint8Array
}) {
  await ensureStudyModulesTable()
  await db().execute({
    sql: 'INSERT INTO study_modules (title, description, file_name, file_data, created_at) VALUES (?, ?, ?, ?, ?)',
    args: [input.title, input.description, input.fileName, input.fileData, new Date().toISOString()],
  })
  tableReady = false
}

export async function deleteStudyModule(id: number) {
  await withRetry(async () => {
    await ensureStudyModulesTable()
    await db().execute({ sql: 'DELETE FROM study_modules WHERE id = ?', args: [id] })
  })
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  try {
    return await withRetry(async () => {
      const result = await db().execute('SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT 100')
      return result.rows.map((row) => ({
        id: toNumber(row.id),
        name: String(row.name ?? ''),
        email: String(row.email ?? ''),
        role: String(row.role ?? 'user'),
        createdAt: String(row.created_at ?? ''),
      }))
    })
  } catch (error) {
    console.error('Could not load users:', error)
    return []
  }
}

let accessTablesReady = false

async function ensureAccessTables() {
  if (accessTablesReady) return
  await db().execute(`CREATE TABLE IF NOT EXISTS learner_access (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    plan TEXT NOT NULL,
    restricted INTEGER NOT NULL DEFAULT 0,
    restricted_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`)
  await db().execute(`CREATE TABLE IF NOT EXISTS learner_devices (
    email TEXT NOT NULL,
    device_id TEXT NOT NULL,
    label TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    first_seen TEXT NOT NULL,
    last_seen TEXT NOT NULL,
    PRIMARY KEY (email, device_id)
  )`)
  await db().execute('CREATE INDEX IF NOT EXISTS learner_devices_email_idx ON learner_devices (email)')
  accessTablesReady = true
}

export async function getLearnerAccess(email: string): Promise<LearnerAccess | null> {
  try {
    return await withRetry(async () => {
      await ensureAccessTables()
      const accessResult = await db().execute({
        sql: 'SELECT email, name, plan, restricted, restricted_at, created_at, updated_at FROM learner_access WHERE email = ?',
        args: [email],
      })
      const row = accessResult.rows[0]
      if (!row) return null

      const deviceResult = await db().execute({
        sql: 'SELECT device_id, label, user_agent, first_seen, last_seen FROM learner_devices WHERE email = ? ORDER BY last_seen DESC',
        args: [email],
      })

      const devices: LearnerDevice[] = deviceResult.rows.map((device) => ({
        deviceId: String(device.device_id ?? ''),
        label: String(device.label ?? 'Unknown device'),
        userAgent: String(device.user_agent ?? ''),
        firstSeen: String(device.first_seen ?? ''),
        lastSeen: String(device.last_seen ?? ''),
      }))

      return {
        email: String(row.email ?? ''),
        name: String(row.name ?? 'Learner'),
        plan: (String(row.plan ?? 'free') === 'premium_1000' ? 'premium_1000' : 'free') as LearnerPlan,
        restricted: toNumber(row.restricted) === 1,
        restrictedAt: row.restricted_at === null ? null : String(row.restricted_at),
        deviceCount: devices.length,
        devices,
        createdAt: String(row.created_at ?? ''),
        updatedAt: String(row.updated_at ?? ''),
      }
    })
  } catch (error) {
    console.error(`Could not load learner access for ${email}:`, error)
    return null
  }
}

export async function registerLearnerDevice(input: {
  email: string
  name: string
  plan: LearnerPlan
  deviceId: string
  label: string
  userAgent: string
}): Promise<LearnerAccess> {
  await ensureAccessTables()
  const now = new Date().toISOString()

  const existing = await withRetry(async () =>
    db().execute({ sql: 'SELECT email FROM learner_access WHERE email = ?', args: [input.email] }),
  )

  if (existing.rows.length === 0) {
    await db().execute({
      sql: 'INSERT INTO learner_access (email, name, plan, restricted, restricted_at, created_at, updated_at) VALUES (?, ?, ?, 0, NULL, ?, ?)',
      args: [input.email, input.name, input.plan, now, now],
    })
  } else {
    await db().execute({
      sql: 'UPDATE learner_access SET name = ?, plan = ?, updated_at = ? WHERE email = ?',
      args: [input.name, input.plan, now, input.email],
    })
  }

  const knownDevice = await withRetry(async () =>
    db().execute({
      sql: 'SELECT device_id FROM learner_devices WHERE email = ? AND device_id = ?',
      args: [input.email, input.deviceId],
    }),
  )

  if (knownDevice.rows.length === 0) {
    await db().execute({
      sql: 'INSERT INTO learner_devices (email, device_id, label, user_agent, first_seen, last_seen) VALUES (?, ?, ?, ?, ?, ?)',
      args: [input.email, input.deviceId, input.label, input.userAgent, now, now],
    })
  } else {
    await db().execute({
      sql: 'UPDATE learner_devices SET label = ?, user_agent = ?, last_seen = ? WHERE email = ? AND device_id = ?',
      args: [input.label, input.userAgent, now, input.email, input.deviceId],
    })
  }

  const access = await getLearnerAccess(input.email)
  if (!access) throw new Error(`Learner access for ${input.email} could not be read after registering the device.`)
  return access
}

export async function getTrackedLearners(): Promise<LearnerAccess[]> {
  try {
    return await withRetry(async () => {
      await ensureAccessTables()
      const accessResult = await db().execute(
        'SELECT email, name, plan, restricted, restricted_at, created_at, updated_at FROM learner_access ORDER BY updated_at DESC, email ASC LIMIT 200',
      )
      if (accessResult.rows.length === 0) return []

      const deviceResult = await db().execute(
        'SELECT email, device_id, label, user_agent, first_seen, last_seen FROM learner_devices ORDER BY last_seen DESC LIMIT 1000',
      )

      const devicesByEmail = new Map<string, LearnerDevice[]>()
      for (const device of deviceResult.rows) {
        const email = String(device.email ?? '')
        const list = devicesByEmail.get(email) ?? []
        list.push({
          deviceId: String(device.device_id ?? ''),
          label: String(device.label ?? 'Unknown device'),
          userAgent: String(device.user_agent ?? ''),
          firstSeen: String(device.first_seen ?? ''),
          lastSeen: String(device.last_seen ?? ''),
        })
        devicesByEmail.set(email, list)
      }

      return accessResult.rows.map((row) => {
        const email = String(row.email ?? '')
        const devices = devicesByEmail.get(email) ?? []
        return {
          email,
          name: String(row.name ?? 'Learner'),
          plan: (String(row.plan ?? 'free') === 'premium_1000' ? 'premium_1000' : 'free') as LearnerPlan,
          restricted: toNumber(row.restricted) === 1,
          restrictedAt: row.restricted_at === null ? null : String(row.restricted_at),
          deviceCount: devices.length,
          devices,
          createdAt: String(row.created_at ?? ''),
          updatedAt: String(row.updated_at ?? ''),
        }
      })
    })
  } catch (error) {
    console.error('Could not load tracked learners:', error)
    return []
  }
}

export async function setPremiumRestriction(email: string, restricted: boolean) {
  await ensureAccessTables()
  const now = new Date().toISOString()
  const result = await db().execute({
    sql: 'UPDATE learner_access SET restricted = ?, restricted_at = ?, updated_at = ? WHERE email = ?',
    args: [restricted ? 1 : 0, restricted ? now : null, now, email],
  })
  return result.rowsAffected > 0
}

let mockTablesReady = false

async function ensureMockTables() {
  if (mockTablesReady) return
  await db().execute(`CREATE TABLE IF NOT EXISTS mock_tests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    file_name TEXT NOT NULL,
    question_count INTEGER NOT NULL,
    time_limit_min INTEGER,
    pass_mark INTEGER NOT NULL,
    created_at TEXT NOT NULL
  )`)
  await db().execute(`CREATE TABLE IF NOT EXISTS mock_questions (
    id TEXT PRIMARY KEY,
    mock_test_id TEXT NOT NULL,
    position INTEGER NOT NULL,
    question TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    module TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`)
  mockTablesReady = true
}

export async function getMockTests(): Promise<SavedMockTest[]> {
  try {
    return await withRetry(async () => {
      await ensureMockTables()
      const result = await db().execute(
        'SELECT id, title, description, file_name, question_count, time_limit_min, pass_mark, created_at FROM mock_tests ORDER BY created_at DESC, id DESC',
      )
      return result.rows.map((row) => ({
        id: String(row.id ?? ''),
        title: String(row.title ?? ''),
        description: String(row.description ?? ''),
        fileName: String(row.file_name ?? ''),
        questionCount: toNumber(row.question_count),
        timeLimitMin: row.time_limit_min === null ? null : toNumber(row.time_limit_min),
        passMark: toNumber(row.pass_mark),
        createdAt: String(row.created_at ?? ''),
      }))
    })
  } catch (error) {
    console.error('Could not load mock tests:', error)
    return []
  }
}

export async function addMockTest(input: {
  title: string
  description: string
  fileName: string
  timeLimitMin: number | null
  passMark: number
  questions: ParsedMockQuestion[]
}) {
  await ensureMockTables()

  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  const statements = [
    {
      sql: 'INSERT INTO mock_tests (id, title, description, file_name, question_count, time_limit_min, pass_mark, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        id,
        input.title,
        input.description,
        input.fileName,
        input.questions.length,
        input.timeLimitMin,
        input.passMark,
        now,
      ],
    },
    ...input.questions.map((question) => ({
      sql: 'INSERT INTO mock_questions (id, mock_test_id, position, question, options_json, correct_answer, explanation, module, difficulty, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [
        `${id}:${question.position}`,
        id,
        question.position,
        question.question,
        JSON.stringify(question.options),
        question.correct,
        question.explanation,
        question.module,
        question.difficulty,
        now,
      ],
    })),
  ]

  await db().batch(statements, 'write')
  return id
}

export async function deleteMockTest(id: string) {
  await withRetry(async () => {
    await ensureMockTables()
    await db().batch(
      [
        { sql: 'DELETE FROM mock_questions WHERE mock_test_id = ?', args: [id] },
        { sql: 'DELETE FROM mock_tests WHERE id = ?', args: [id] },
      ],
      'write',
    )
  })
}

export async function getMockTestQuestions(mockTestId: string): Promise<ParsedMockQuestion[]> {
  try {
    return await withRetry(async () => {
      await ensureMockTables()
      const result = await db().execute({
        sql: 'SELECT position, question, options_json, correct_answer, explanation, module, difficulty FROM mock_questions WHERE mock_test_id = ? ORDER BY position ASC',
        args: [mockTestId],
      })
      return result.rows.map((row) => {
        let options: string[] = []
        try {
          const parsed = JSON.parse(String(row.options_json ?? '[]')) as unknown
          if (Array.isArray(parsed)) options = parsed.map((option) => String(option))
        } catch {
          options = []
        }
        return {
          position: toNumber(row.position),
          question: String(row.question ?? ''),
          options,
          correct: String(row.correct_answer ?? ''),
          explanation: String(row.explanation ?? ''),
          module: String(row.module ?? ''),
          difficulty: String(row.difficulty ?? ''),
        }
      })
    })
  } catch (error) {
    console.error(`Could not load mock questions for ${mockTestId}:`, error)
    return []
  }
}
