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
import type { Transaction } from '@/lib/types'

interface Props {
  transactions: Transaction[]
  compact?: boolean
}

export function TransactionList({ transactions, compact = false }: Props) {
  const formatCurrency = (amount: number) => {
    return Math.abs(amount).toLocaleString('de-DE', {
      style: 'currency',
      currency: 'EUR'
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('de-DE', {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Member</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map(transaction => (
          <TableRow key={transaction.id}>
            <TableCell className="font-medium">
              {formatDate(transaction.date)}
            </TableCell>
            <TableCell>
              {transaction.description || '-'}
            </TableCell>
            <TableCell>
              <Badge variant={transaction.category?.type === 'income' ? 'default' : 'secondary'}>
                {transaction.category?.name}
              </Badge>
            </TableCell>
            <TableCell>{transaction.member?.display_name}</TableCell>
            <TableCell className={`text-right font-medium ${
              transaction.category?.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.category?.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
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
  )
}
