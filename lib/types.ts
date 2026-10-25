export type StudyModule = {
  id: number
  title: string
  description: string
  fileName: string
  fileSize: number
  createdAt: string
}

export type StudyModuleFile = {
  id: number
  title: string
  fileName: string
  data: Uint8Array
}

export type AdminUser = {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

export type ModuleFormState = {
  status: 'idle' | 'success' | 'error'
  message: string
}
