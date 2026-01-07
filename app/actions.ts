'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { HouseholdSettings } from '@/lib/types'

export async function createHouseholdAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const displayName = formData.get('displayName') as string

  if (!name || !displayName) {
    return { error: 'Name and display name are required' }
  }

  // Use RPC to create household atomically (bypasses RLS chicken-and-egg problem)
  const { data: household, error } = await supabase.rpc('create_household_with_owner', {
    household_name: name,
    owner_display_name: displayName
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, household }
}

export async function joinHouseholdAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const inviteCode = (formData.get('inviteCode') as string).toUpperCase().trim()
  const displayName = formData.get('displayName') as string

  if (!inviteCode || !displayName) {
    return { error: 'Invite code and display name are required' }
  }

  // Use RPC to join household atomically
  const { data: household, error } = await supabase.rpc('join_household_by_code', {
    invite_code_input: inviteCode,
    member_display_name: displayName
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, household }
}

export async function createTransactionAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const householdId = formData.get('householdId') as string
  const accountId = formData.get('accountId') as string
  const categoryId = formData.get('categoryId') as string
  const memberId = formData.get('memberId') as string
  const amount = parseFloat(formData.get('amount') as string)
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const type = formData.get('type') as string // 'income' or 'expense'

  // Make amount negative for expenses
  const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount)

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      household_id: householdId,
      account_id: accountId,
      category_id: categoryId,
      member_id: memberId,
      amount: finalAmount,
      description,
      date
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, transaction: data }
}

export async function deleteTransactionAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function createAccountAction(formData: FormData) {
  const supabase = await createClient()

  const householdId = formData.get('householdId') as string
  const name = formData.get('name') as string
  const type = formData.get('type') as string
  const isShared = formData.get('isShared') === 'true'
  const initialBalance = parseFloat(formData.get('initialBalance') as string) || 0

  const { data, error } = await supabase
    .from('accounts')
    .insert({
      household_id: householdId,
      name,
      type,
      is_shared: isShared,
      initial_balance: initialBalance
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, account: data }
}

export async function updateBudgetAction(formData: FormData) {
  const supabase = await createClient()

  const householdId = formData.get('householdId') as string
  const categoryId = formData.get('categoryId') as string
  const month = formData.get('month') as string
  const amount = parseFloat(formData.get('amount') as string)

  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { household_id: householdId, category_id: categoryId, month, amount },
      { onConflict: 'household_id,category_id,month' }
    )
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true, budget: data }
}

export async function updateCategoryAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const icon = formData.get('icon') as string | null
  const color = formData.get('color') as string | null

  const { error } = await supabase
    .from('categories')
    .update({ name, icon, color })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteCategoryAction(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateHouseholdSettingsAction(
  householdId: string,
  settings: HouseholdSettings
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('households')
    .update({ settings })
    .eq('id', householdId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
