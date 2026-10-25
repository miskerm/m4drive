import { createClient } from '@libsql/client'

export function getDb() {
  const url = process.env.TURSO_DATABASE_URL
  if (!url) throw new Error('TURSO_DATABASE_URL is not configured')
  return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
}

export async function ensureSchema() {
  const db = getDb()
  await db.batch([
    `CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', email_verified INTEGER NOT NULL DEFAULT 0, verification_token TEXT, verification_expires_at TEXT, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, user_agent TEXT, ip_address TEXT, created_at TEXT NOT NULL, expires_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS study_modules (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, file_name TEXT NOT NULL, file_data BLOB NOT NULL, created_at TEXT NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS imported_questions (id INTEGER PRIMARY KEY AUTOINCREMENT, module_id INTEGER, question TEXT NOT NULL, options_json TEXT NOT NULL, correct_answer TEXT NOT NULL, created_at TEXT NOT NULL)`,
  ])
  return db
}
