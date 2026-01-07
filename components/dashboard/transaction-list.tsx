'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteTransactionAction } from '@/app/actions'
import type { Transaction, HouseholdSettings } from '@/lib/types'
import { DEFAULT_SETTINGS } from '@/lib/types'

interface Props {
  transactions: Transaction[]
  settings?: HouseholdSettings
  compact?: boolean
}

export function TransactionList({ transactions, settings = DEFAULT_SETTINGS, compact = false }: Props) {
  const formatCurrency = (amount: number) => {
    return Math.abs(amount).toLocaleString(settings.locale, {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: settings.showCents ? 2 : 0,
      maximumFractionDigits: settings.showCents ? 2 : 0,
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(settings.locale, {
      day: '2-digit',
      month: '2-digit'
    })
  }

  if (transactions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No transactions yet
      </p>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {transactions.map(transaction => (
          <div
            key={transaction.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {transaction.description || transaction.category?.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(transaction.date)} • {transaction.member?.display_name}
              </p>
            </div>
            <span className={`text-sm font-medium ${
              transaction.category?.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.category?.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs sm:text-sm">Date</TableHead>
            <TableHead className="text-xs sm:text-sm">Description</TableHead>
            <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Category</TableHead>
            <TableHead className="hidden md:table-cell text-xs sm:text-sm">Member</TableHead>
            <TableHead className="text-right text-xs sm:text-sm">Amount</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map(transaction => (
            <TableRow key={transaction.id}>
              <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-4">
                {formatDate(transaction.date)}
              </TableCell>
              <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                <div>
                  <span className="block truncate max-w-[120px] sm:max-w-none">
                    {transaction.description || '-'}
                  </span>
                  <span className="sm:hidden text-[10px] text-muted-foreground">
                    {transaction.category?.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell py-2 sm:py-4">
                <Badge variant={transaction.category?.type === 'income' ? 'default' : 'secondary'} className="text-xs">
                  {transaction.category?.name}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell text-xs sm:text-sm py-2 sm:py-4">
                {transaction.member?.display_name}
              </TableCell>
              <TableCell className={`text-right font-medium text-xs sm:text-sm py-2 sm:py-4 ${
                transaction.category?.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.category?.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell className="py-2 sm:py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                  onClick={async () => {
                    if (confirm('Delete this transaction?')) {
                      await deleteTransactionAction(transaction.id)
                    }
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
