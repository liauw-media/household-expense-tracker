'use client'

import { Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface RecentHousehold {
  id: string
  name: string
  member_count: number
  created_at: string
}

interface Props {
  households: RecentHousehold[]
}

export function RecentHouseholds({ households }: Props) {
  if (households.length === 0) return null

  const handleClick = (household: RecentHousehold) => {
    // Redirect to setup page - user will need to get invite code from household owner
    const confirmed = window.confirm(
      `Would you like to join "${household.name}"?\n\nYou'll need to sign in first, then enter the household's invite code.`
    )
    if (confirmed) {
      window.location.href = '/setup'
    }
  }

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 text-center">
        Recently created households
      </h3>
      <div className="grid gap-2">
        {households.map((household) => (
          <Card
            key={household.id}
            className="cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => handleClick(household)}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <span className="font-medium truncate">{household.name}</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{household.member_count}/10</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
