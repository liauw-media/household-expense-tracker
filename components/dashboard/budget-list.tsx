'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateBudgetAction } from '@/app/actions'
import type { Category, Budget, Transaction } from '@/lib/types'

interface Props {
  householdId: string
  categories: Category[]
  budgets: Budget[]
  transactions: Transaction[]
  currentMonth: string
}

export function BudgetList({
  householdId,
  categories,
  budgets,
  transactions,
  currentMonth
}: Props) {
  const router = useRouter()

  // Calculate spending per category
  const spendingByCategory = new Map<string, number>()
  transactions
    .filter(t => t.category?.type === 'expense')
    .forEach(t => {
      const current = spendingByCategory.get(t.category_id) || 0
      spendingByCategory.set(t.category_id, current + Math.abs(t.amount))
    })

  // Create budget map
  const budgetByCategory = new Map<string, number>()
  budgets.forEach(b => {
    budgetByCategory.set(b.category_id, b.amount)
  })

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR'
    })
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No expense categories available
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {categories.map(category => {
        const spent = spendingByCategory.get(category.id) || 0
        const budget = budgetByCategory.get(category.id) || 0
        const percentage = budget > 0 ? (spent / budget) * 100 : 0

        return (
          <BudgetRow
            key={category.id}
            householdId={householdId}
            category={category}
            spent={spent}
            budget={budget}
            percentage={percentage}
            currentMonth={currentMonth}
            formatCurrency={formatCurrency}
          />
        )
      })}
    </div>
  )
}

interface BudgetRowProps {
  householdId: string
  category: Category
  spent: number
  budget: number
  percentage: number
  currentMonth: string
  formatCurrency: (amount: number) => string
}

function BudgetRow({
  householdId,
  category,
  spent,
  budget,
  percentage,
  currentMonth,
  formatCurrency
}: BudgetRowProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newBudget, setNewBudget] = useState(budget.toString())

  async function handleSave() {
    setLoading(true)

    const formData = new FormData()
    formData.append('householdId', householdId)
    formData.append('categoryId', category.id)
    formData.append('month', currentMonth)
    formData.append('amount', newBudget)

    await updateBudgetAction(formData)

    setLoading(false)
    setEditing(false)
    router.refresh()
  }

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{category.name}</span>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-24 h-8"
                disabled={loading}
              />
              <Button
                size="sm"
                onClick={handleSave}
                disabled={loading}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditing(false)
                  setNewBudget(budget.toString())
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {formatCurrency(spent)} / {budget > 0 ? formatCurrency(budget) : 'No budget'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            </>
          )}
        </div>
      </div>

      {budget > 0 && (
        <div className="space-y-1">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{percentage.toFixed(0)}% used</span>
            <span>{formatCurrency(Math.max(budget - spent, 0))} remaining</span>
          </div>
        </div>
      )}
    </div>
  )
}
