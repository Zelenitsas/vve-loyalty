'use server'

import {
  getCustomerByEmail,
  createCustomer,
  getCustomerByUniqueId,
  updateStampCount,
  deleteCustomer,
} from '@/lib/supabase'
import { sendStampCardEmail, sendReengagementEmail } from '@/lib/email'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  const h = await headers()
  const host = h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

// ── Register ──────────────────────────────────────────────────────────────────

export type RegisterState = { success?: boolean; name?: string; error?: string } | null

export async function registerCustomer(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = (formData.get('name') as string)?.trim()
  const email = (formData.get('email') as string)?.trim().toLowerCase()

  if (!name || !email) return { error: 'Name and email are required.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email.' }

  const existing = await getCustomerByEmail(email)
  if (existing) return { error: 'Email already registered — check your inbox!' }

  const customer = await createCustomer(name, email)
  if (!customer) return { error: 'Registration failed. Please try again.' }

  return { success: true, name }
}

// ── Add Points (spend-based) ───────────────────────────────────────────────────

export type AddPointsState = {
  success?: boolean
  name?: string
  pointsAdded?: number
  newTotal?: number
  error?: string
} | null

export async function addPointsAction(
  uniqueId: string,
  prevState: AddPointsState,
  formData: FormData
): Promise<AddPointsState> {
  const pointsToAdd = parseInt(formData.get('points') as string)
  if (!pointsToAdd || pointsToAdd <= 0) return { error: 'Invalid amount.' }

  const customer = await getCustomerByUniqueId(uniqueId)
  if (!customer) return { error: 'Customer not found.' }

  const newTotal = customer.stamp_count + pointsToAdd
  const ok = await updateStampCount(uniqueId, newTotal)
  if (!ok) return { error: 'Failed to add points. Try again.' }

  revalidatePath('/cashier')
  return { success: true, name: customer.name, pointsAdded: pointsToAdd, newTotal }
}

// ── Delete Customer ───────────────────────────────────────────────────────────

export type DeleteState = { success?: boolean; error?: string } | null

export async function deleteCustomerAction(
  uniqueId: string,
  prevState: DeleteState,
  formData: FormData
): Promise<DeleteState> {
  const ok = await deleteCustomer(uniqueId)
  if (!ok) return { error: 'Failed to delete.' }
  revalidatePath('/cashier')
  return { success: true }
}

// ── Re-engagement ─────────────────────────────────────────────────────────────

export type ReengageState = { success?: boolean; error?: string } | null

export async function reengageCustomer(
  uniqueId: string,
  prevState: ReengageState,
  formData: FormData
): Promise<ReengageState> {
  const customer = await getCustomerByUniqueId(uniqueId)
  if (!customer) return { error: 'Customer not found.' }

  const baseUrl = await getBaseUrl()
  const scanUrl = `${baseUrl}/scan/${uniqueId}`
  const daysSince = customer.last_visit_at
    ? Math.floor((Date.now() - new Date(customer.last_visit_at).getTime()) / 86_400_000)
    : undefined
  const offer = (formData.get('offer') as string)?.trim() || undefined

  try {
    await sendReengagementEmail({
      name: customer.name,
      email: customer.email,
      stampCount: customer.stamp_count,
      scanUrl,
      logoUrl: '',
      daysSince,
      offer,
    })
    return { success: true }
  } catch (e) {
    console.error('Re-engagement email failed:', e)
    return { error: 'Failed to send email.' }
  }
}

// ── Cashier Login ─────────────────────────────────────────────────────────────

export type LoginState = { error?: string } | null

export async function cashierLogin(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = formData.get('password') as string
  if (password !== process.env.CASHIER_PASSWORD) return { error: 'Incorrect password.' }

  const cookieStore = await cookies()
  cookieStore.set('is_cashier', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    path: '/',
  })

  redirect('/cashier')
}
