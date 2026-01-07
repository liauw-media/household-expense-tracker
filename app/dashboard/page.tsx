import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

interface Props {
  searchParams: Promise<{ household?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const supabase = await createClient()
  const params = await searchParams

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Get ALL user's household memberships
  const { data: memberships } = await supabase
    .from('household_members')
    .select('*, household:households(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  // If no household, redirect to setup
  if (!memberships || memberships.length === 0) {
    redirect('/setup')
  }

  // Determine which household to show
  const cookieStore = await cookies()
  const savedHouseholdId = cookieStore.get('selected_household')?.value
  const requestedHouseholdId = params.household || savedHouseholdId

  // Find the requested household or default to first
  let member = memberships.find(m => m.household_id === requestedHouseholdId)
  if (!member) {
    member = memberships[0]
  }

  const household = member.household as any
  const allHouseholds = memberships.map(m => m.household as any)

  // Get current month and 6 months ago for trend
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  const trendStartMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`

  // Fetch all dashboard data in parallel
  const [
    { data: members },
    { data: categories },
    { data: accounts },
    { data: transactions },
    { data: allTransactions },
    { data: budgets }
  ] = await Promise.all([
    supabase
      .from('household_members')
      .select('*')
      .eq('household_id', household.id)
      .order('display_name'),
    supabase
      .from('categories')
      .select('*')
      .eq('household_id', household.id)
      .order('type')
      .order('name'),
    supabase
      .from('accounts')
      .select('*')
      .eq('household_id', household.id)
      .order('name'),
    supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*),
        member:household_members(*),
        account:accounts(*)
      `)
      .eq('household_id', household.id)
      .gte('date', currentMonth)
      .order('date', { ascending: false })
      .limit(50),
    // All transactions for last 6 months (for trend chart)
    supabase
      .from('transactions')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('household_id', household.id)
      .gte('date', trendStartMonth)
      .order('date', { ascending: false }),
    supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('household_id', household.id)
      .eq('month', currentMonth)
  ])

  return (
    <DashboardContent
      household={household}
      allHouseholds={allHouseholds}
      currentMember={member}
      members={members || []}
      categories={categories || []}
      accounts={accounts || []}
      transactions={transactions || []}
      allTransactions={allTransactions || []}
      budgets={budgets || []}
      currentMonth={currentMonth}
    />
  )
}
