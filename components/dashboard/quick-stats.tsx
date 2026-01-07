'use client'

import { TrendingUp, TrendingDown, Zap, Receipt } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { Transaction, HouseholdSettings } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/types'

interface Props {
  transactions: Transaction[]
  settings?: HouseholdSettings
}

export function QuickStats({ transactions, settings = DEFAULT_SETTINGS }: Props) {
  // Find biggest expense
  const expenses = transactions.filter(t => t.category?.type === 'expense')
  const biggestExpense = expenses.length > 0
    ? expenses.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max)
    : null

  // Top spending category
  const categorySpending = new Map<string, { name: string; total: number }>()
  expenses.forEach(t => {
    const catName = t.category?.name || 'Unknown'
    const existing = categorySpending.get(catName)
    if (existing) {
      existing.total += Math.abs(t.amount)
    } else {
      categorySpending.set(catName, { name: catName, total: Math.abs(t.amount) })
    }
  })
  const topCategory = Array.from(categorySpending.values())
    .sort((a, b) => b.total - a.total)[0]

  // Average daily spending (this month)
  const daysWithExpenses = new Set(expenses.map(t => t.date)).size
  const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const avgDaily = daysWithExpenses > 0 ? totalExpenses / daysWithExpenses : 0

  // Transaction count
  const txCount = transactions.length

  if (txCount === 0) {
    return null
  }

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {biggestExpense && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium">Biggest Expense</span>
            </div>
            <p className="text-lg font-bold">
              {formatCurrency(Math.abs(biggestExpense.amount), settings)}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {biggestExpense.description || biggestExpense.category?.name}
            </p>
          </CardContent>
        </Card>
      )}

      {topCategory && (
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium">Top Category</span>
            </div>
            <p className="text-lg font-bold truncate">{topCategory.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(topCategory.total, settings)}
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-blue-500 mb-1">
            <Zap className="h-4 w-4" />
            <span className="text-xs font-medium">Avg Daily Spend</span>
          </div>
          <p className="text-lg font-bold">
            {formatCurrency(avgDaily, settings)}
          </p>
          <p className="text-xs text-muted-foreground">
            {daysWithExpenses} days with expenses
          </p>
        </CardContent>
      </Card>

      <Card className="bg-purple-500/5 border-purple-500/20">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-purple-500 mb-1">
            <Receipt className="h-4 w-4" />
            <span className="text-xs font-medium">Transactions</span>
          </div>
          <p className="text-lg font-bold">{txCount}</p>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
