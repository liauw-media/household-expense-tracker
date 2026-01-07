'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import type { HouseholdSettings } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/types'

interface Props {
  income: number
  expenses: number
  balance: number
  settings?: HouseholdSettings
}

export function OverviewCards({ income, expenses, balance, settings = DEFAULT_SETTINGS }: Props) {
  const fmt = (amount: number) => formatCurrency(amount, settings)

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Income</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-3 w-3 sm:h-4 sm:w-4 text-green-600"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            +{fmt(income)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Expenses</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-3 w-3 sm:h-4 sm:w-4 text-red-600"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            -{fmt(expenses)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-6">
          <CardTitle className="text-xs sm:text-sm font-medium">Balance</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <path d="M2 10h20" />
          </svg>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className={`text-lg sm:text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}{fmt(balance)}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
            Net this month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
