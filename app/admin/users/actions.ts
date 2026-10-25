'use server'

import { revalidatePath } from 'next/cache'
import { isValidEmail, normalizeEmail } from '@/lib/access-types'
import { setPremiumRestriction } from '@/lib/db'

export async function setPremiumRestrictionAction(formData: FormData) {
  const email = normalizeEmail(formData.get('email'))
  const restricted = String(formData.get('restricted') ?? '') === 'true'

  if (!isValidEmail(email)) return

  try {
    const updated = await setPremiumRestriction(email, restricted)
    if (!updated) return

    revalidatePath('/admin/users')
    revalidatePath('/dashboard')
    revalidatePath('/full-mock')
  } catch (error) {
    console.error(`Could not update premium access for ${email}:`, error)
  }
}
