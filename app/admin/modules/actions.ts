'use server'

import { revalidatePath } from 'next/cache'
import { addStudyModule, deleteStudyModule } from '@/lib/db'
import type { ModuleFormState } from '@/lib/types'

const MAX_FILE_BYTES = 20 * 1024 * 1024

export async function createModuleAction(_previousState: ModuleFormState, formData: FormData): Promise<ModuleFormState> {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const file = formData.get('moduleFile')

  if (!title) return { status: 'error', message: 'Please add a module title.' }
  if (!description) return { status: 'error', message: 'Please add a short description.' }
  if (!(file instanceof File) || file.size === 0) return { status: 'error', message: 'Choose a PDF file to upload.' }
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') return { status: 'error', message: 'Only PDF modules can be uploaded.' }
  if (file.size > MAX_FILE_BYTES) return { status: 'error', message: 'The PDF must be smaller than 20 MB.' }

  try {
    const fileData = new Uint8Array(await file.arrayBuffer())
    await addStudyModule({ title, description, fileName: file.name, fileData })
    revalidatePath('/admin/modules')
    revalidatePath('/study')
    return { status: 'success', message: `“${title}” was uploaded and is now available in Study.` }
  } catch (error) {
    console.error('Failed to upload study module:', error)
    return { status: 'error', message: 'The module could not be saved. Check the database connection and try again.' }
  }
}

export async function deleteModuleAction(formData: FormData) {
  const id = Number(formData.get('id'))
  if (!Number.isFinite(id) || id <= 0) return
  try {
    await deleteStudyModule(id)
    revalidatePath('/admin/modules')
    revalidatePath('/study')
  } catch (error) {
    console.error('Failed to delete study module:', error)
  }
}
