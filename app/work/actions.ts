'use server'

import { cookies } from 'next/headers'

const COOKIE_NAME = 'work_access'

export async function validateWorkPassword(password: string): Promise<boolean> {
  const valid = password === process.env.WORK_PASSWORD

  if (valid) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    })
  }

  return valid
}

export async function hasWorkAccess(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === '1'
}
