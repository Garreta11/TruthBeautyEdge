'use server'

export async function validateWorkPassword(password: string): Promise<boolean> {
  return password === process.env.WORK_PASSWORD
}
