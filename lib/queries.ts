import { SupabaseClient } from '@supabase/supabase-js';
import type {
  Household,
  HouseholdMember,
  Category,
  Account,
  Transaction,
  Budget,
  CategorySpending
} from './types';

// ============================================
// HOUSEHOLD QUERIES
// ============================================

export async function getUserHousehold(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from('household_members')
    .select('*, household:households(*)')
    .eq('user_id', user.id)
    .single();

  return member;
}

export async function createHousehold(
  supabase: SupabaseClient,
  name: string,
  displayName: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Generate invite code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let inviteCode = '';
  for (let i = 0; i < 8; i++) {
    inviteCode += chars[Math.floor(Math.random() * chars.length)];
  }

  // Create household
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({ name, invite_code: inviteCode })
    .select()
    .single();

  if (householdError) throw householdError;

  // Add creator as owner
  const { error: memberError } = await supabase
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: user.id,
      display_name: displayName,
      role: 'owner'
    });

  if (memberError) throw memberError;

  // Create default categories
  await supabase.rpc('create_default_categories', { household_uuid: household.id });

  return household;
}

export async function joinHousehold(
  supabase: SupabaseClient,
  inviteCode: string,
  displayName: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Find household by invite code
  const { data: household, error: findError } = await supabase
    .from('households')
    .select()
    .eq('invite_code', inviteCode.toUpperCase())
    .single();

  if (findError || !household) throw new Error('Invalid invite code');

  // Join as member
  const { error: joinError } = await supabase
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: user.id,
      display_name: displayName,
      role: 'member'
    });

  if (joinError) {
    if (joinError.code === '23505') {
      throw new Error('You are already a member of this household');
    }
    throw joinError;
  }

  return household;
}

// ============================================
// CATEGORY QUERIES
// ============================================

export async function getCategories(supabase: SupabaseClient, householdId: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('household_id', householdId)
    .order('type')
    .order('name');

  if (error) throw error;
  return data as Category[];
}

// ============================================
// ACCOUNT QUERIES
// ============================================

export async function getAccounts(supabase: SupabaseClient, householdId: string) {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('household_id', householdId)
    .order('name');

  if (error) throw error;
  return data as Account[];
}

export async function createAccount(
  supabase: SupabaseClient,
  householdId: string,
  account: Partial<Account>
) {
  const { data, error } = await supabase
    .from('accounts')
    .insert({ ...account, household_id: householdId })
    .select()
    .single();

  if (error) throw error;
  return data as Account;
}

// ============================================
// TRANSACTION QUERIES
// ============================================

export async function getTransactions(
  supabase: SupabaseClient,
  householdId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    memberId?: string;
    limit?: number;
  }
) {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      category:categories(*),
      member:household_members(*),
      account:accounts(*)
    `)
    .eq('household_id', householdId)
    .order('date', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }
  if (options?.memberId) {
    query = query.eq('member_id', options.memberId);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Transaction[];
}

export async function createTransaction(
  supabase: SupabaseClient,
  transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select(`
      *,
      category:categories(*),
      member:household_members(*),
      account:accounts(*)
    `)
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function updateTransaction(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Transaction>
) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================================
// BUDGET QUERIES
// ============================================

export async function getBudgets(
  supabase: SupabaseClient,
  householdId: string,
  month: string
) {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('household_id', householdId)
    .eq('month', month);

  if (error) throw error;
  return data as Budget[];
}

export async function upsertBudget(
  supabase: SupabaseClient,
  householdId: string,
  categoryId: string,
  month: string,
  amount: number
) {
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      { household_id: householdId, category_id: categoryId, month, amount },
      { onConflict: 'household_id,category_id,month' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as Budget;
}

// ============================================
// DASHBOARD QUERIES
// ============================================

export async function getMonthlyOverview(
  supabase: SupabaseClient,
  householdId: string,
  month: string // YYYY-MM-01
) {
  const startDate = month;
  const endDate = new Date(month);
  endDate.setMonth(endDate.getMonth() + 1);
  const endDateStr = endDate.toISOString().split('T')[0];

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, category:categories(type)')
    .eq('household_id', householdId)
    .gte('date', startDate)
    .lt('date', endDateStr);

  if (error) throw error;

  let totalIncome = 0;
  let totalExpenses = 0;

  transactions?.forEach((t: any) => {
    if (t.category?.type === 'income') {
      totalIncome += Math.abs(t.amount);
    } else {
      totalExpenses += Math.abs(t.amount);
    }
  });

  return {
    month,
    total_income: totalIncome,
    total_expenses: totalExpenses,
    balance: totalIncome - totalExpenses
  };
}

export async function getCategorySpending(
  supabase: SupabaseClient,
  householdId: string,
  month: string
): Promise<CategorySpending[]> {
  const startDate = month;
  const endDate = new Date(month);
  endDate.setMonth(endDate.getMonth() + 1);
  const endDateStr = endDate.toISOString().split('T')[0];

  // Get transactions grouped by category
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select(`
      amount,
      category:categories!inner(id, name, icon, type)
    `)
    .eq('household_id', householdId)
    .eq('categories.type', 'expense')
    .gte('date', startDate)
    .lt('date', endDateStr);

  if (txError) throw txError;

  // Get budgets for the month
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('category_id, amount')
    .eq('household_id', householdId)
    .eq('month', month);

  if (budgetError) throw budgetError;

  // Aggregate by category
  const categoryMap = new Map<string, CategorySpending>();

  transactions?.forEach((t: any) => {
    const catId = t.category.id;
    const existing = categoryMap.get(catId);
    const amount = Math.abs(t.amount);

    if (existing) {
      existing.total += amount;
    } else {
      const budget = budgets?.find(b => b.category_id === catId);
      categoryMap.set(catId, {
        category_id: catId,
        category_name: t.category.name,
        category_icon: t.category.icon,
        total: amount,
        budget: budget?.amount || null,
        percentage: null
      });
    }
  });

  // Calculate percentages
  const result = Array.from(categoryMap.values()).map(cat => ({
    ...cat,
    percentage: cat.budget ? (cat.total / cat.budget) * 100 : null
  }));

  return result.sort((a, b) => b.total - a.total);
}

export async function getHouseholdMembers(supabase: SupabaseClient, householdId: string) {
  const { data, error } = await supabase
    .from('household_members')
    .select('*')
    .eq('household_id', householdId)
    .order('display_name');

  if (error) throw error;
  return data as HouseholdMember[];
}
