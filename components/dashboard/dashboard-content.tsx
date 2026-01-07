'use client'

import { useMemo } from 'react'
import { useRealtimeSync } from '@/hooks/use-realtime-sync'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { OverviewCards } from './overview-cards'
import { QuickStats } from './quick-stats'
import { SpendingChart } from './spending-chart'
import { MonthlyTrendChart } from './monthly-trend-chart'
import { IncomeExpenseChart } from './income-expense-chart'
import { TransactionList } from './transaction-list'
import { AddTransactionDialog } from './add-transaction-dialog'
import { AddAccountDialog } from './add-account-dialog'
import { BudgetList } from './budget-list'
import { SettingsDialog } from '@/components/settings/settings-dialog'
import { InviteQRDialog } from '@/components/household/invite-qr-dialog'
import { formatCurrency } from '@/lib/format'
import type { Household, HouseholdMember, Category, Account, Transaction, Budget, HouseholdSettings } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/types'

interface Props {
  household: Household
  currentMember: HouseholdMember
  members: HouseholdMember[]
  categories: Category[]
  accounts: Account[]
  transactions: Transaction[]
  allTransactions: Transaction[] // For trend chart (last 6 months)
  budgets: Budget[]
  currentMonth: string
}

export function DashboardContent({
  household,
  currentMember,
  members,
  categories,
  accounts,
  transactions,
  allTransactions,
  budgets,
  currentMonth
}: Props) {
  const settings = household.settings || DEFAULT_SETTINGS

  // Subscribe to realtime updates
  useRealtimeSync(household.id)

  // Calculate overview stats
  const stats = useMemo(() => {
    let totalIncome = 0
    let totalExpenses = 0

    transactions.forEach(t => {
      const amount = Math.abs(t.amount)
      if (t.category?.type === 'income') {
        totalIncome += amount
      } else {
        totalExpenses += amount
      }
    })

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    }
  }, [transactions])

  // Calculate category spending for chart
  const categorySpending = useMemo(() => {
    const spending = new Map<string, { name: string; value: number; budget: number | null }>()

    transactions
      .filter(t => t.category?.type === 'expense')
      .forEach(t => {
        const catId = t.category_id
        const existing = spending.get(catId)
        const amount = Math.abs(t.amount)

        if (existing) {
          existing.value += amount
        } else {
          const budget = budgets.find(b => b.category_id === catId)
          spending.set(catId, {
            name: t.category?.name || 'Unknown',
            value: amount,
            budget: budget?.amount || null
          })
        }
      })

    return Array.from(spending.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }, [transactions, budgets])

  // Calculate monthly trend data for last 6 months
  const monthlyTrend = useMemo(() => {
    const monthData = new Map<string, { income: number; expenses: number }>()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthData.set(monthKey, { income: 0, expenses: 0 })
    }

    // Aggregate transactions
    allTransactions.forEach((t) => {
      const monthKey = t.date.substring(0, 7)
      const data = monthData.get(monthKey)
      if (data) {
        const amount = Math.abs(t.amount)
        if (t.category?.type === 'income') {
          data.income += amount
        } else {
          data.expenses += amount
        }
      }
    })

    return Array.from(monthData.entries()).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
    }))
  }, [allTransactions])

  const expenseCategories = categories.filter(c => c.type === 'expense')
  const incomeCategories = categories.filter(c => c.type === 'income')

  const monthName = new Date(currentMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold truncate">{household.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </span>
                <InviteQRDialog
                  inviteCode={household.invite_code}
                  householdName={household.name}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{currentMember.display_name}</p>
                <Badge variant="secondary" className="text-xs">
                  {currentMember.role}
                </Badge>
              </div>
              <SettingsDialog
                householdId={household.id}
                settings={household.settings || DEFAULT_SETTINGS}
              />
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <TabsList className="w-full sm:w-auto overflow-x-auto">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
              <TabsTrigger value="budgets" className="text-xs sm:text-sm">Budgets</TabsTrigger>
              <TabsTrigger value="accounts" className="text-xs sm:text-sm">Accounts</TabsTrigger>
            </TabsList>

            <div className="flex gap-2 w-full sm:w-auto">
              <AddTransactionDialog
                householdId={household.id}
                memberId={currentMember.id}
                categories={categories}
                accounts={accounts}
                members={members}
              />
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{monthName}</h2>
            </div>

            <OverviewCards
              income={stats.income}
              expenses={stats.expenses}
              balance={stats.balance}
              settings={settings}
            />

            <QuickStats transactions={transactions} settings={settings} />

            {/* Charts Row */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Income vs Expenses</CardTitle>
                  <CardDescription>This month&apos;s breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <IncomeExpenseChart
                    income={stats.income}
                    expenses={stats.expenses}
                    settings={settings}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                  <CardDescription>Top expense categories</CardDescription>
                </CardHeader>
                <CardContent>
                  {categorySpending.length > 0 ? (
                    <SpendingChart data={categorySpending} settings={settings} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No expenses recorded yet
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Latest activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <TransactionList
                    transactions={transactions.slice(0, 5)}
                    settings={settings}
                    compact
                  />
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend</CardTitle>
                <CardDescription>Income vs expenses over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <MonthlyTrendChart data={monthlyTrend} settings={settings} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>{monthName}</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={transactions} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Budgets</CardTitle>
                <CardDescription>Track spending against your budget targets</CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetList
                  householdId={household.id}
                  categories={expenseCategories}
                  budgets={budgets}
                  transactions={transactions}
                  currentMonth={currentMonth}
                  settings={settings}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Accounts</h2>
              <AddAccountDialog householdId={household.id} />
            </div>

            {accounts.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {accounts.map(account => {
                  // Calculate current balance
                  const accountTransactions = transactions.filter(t => t.account_id === account.id)
                  const transactionSum = accountTransactions.reduce((sum, t) => sum + t.amount, 0)
                  const currentBalance = account.initial_balance + transactionSum

                  return (
                    <Card key={account.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                          <Badge variant={account.is_shared ? 'default' : 'secondary'}>
                            {account.is_shared ? 'Shared' : 'Personal'}
                          </Badge>
                        </div>
                        <CardDescription className="capitalize">
                          {account.type.replace('_', ' ')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-2xl font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(currentBalance, household.settings || DEFAULT_SETTINGS)}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">No accounts yet</p>
                  <AddAccountDialog householdId={household.id} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
