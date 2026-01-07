// Database types for Household Expense Tracker

export type Role = 'owner' | 'admin' | 'member';
export type CategoryType = 'income' | 'expense';
export type AccountType = 'checking' | 'savings' | 'cash' | 'credit_card' | 'other';

export interface Household {
  id: string;
  name: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  display_name: string;
  role: Role;
  created_at: string;
}

export interface Category {
  id: string;
  household_id: string;
  name: string;
  type: CategoryType;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Account {
  id: string;
  household_id: string;
  name: string;
  type: AccountType;
  is_shared: boolean;
  owner_id: string | null;
  initial_balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  household_id: string;
  account_id: string;
  category_id: string;
  member_id: string;
  amount: number;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
  member?: HouseholdMember;
  account?: Account;
}

export interface Budget {
  id: string;
  household_id: string;
  category_id: string;
  amount: number;
  month: string; // YYYY-MM-01
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category;
}

// Aggregated types for dashboard
export interface MonthlyOverview {
  month: string;
  total_income: number;
  total_expenses: number;
  balance: number;
}

export interface CategorySpending {
  category_id: string;
  category_name: string;
  category_icon: string | null;
  total: number;
  budget: number | null;
  percentage: number | null;
}

export interface MemberSpending {
  member_id: string;
  member_name: string;
  total: number;
}
