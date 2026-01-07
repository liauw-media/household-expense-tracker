'use client'

import { useRouter } from 'next/navigation'
import { ChevronDown, Home, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { switchHouseholdAction } from '@/app/actions'
import type { Household } from '@/lib/types'

interface Props {
  currentHousehold: Household
  allHouseholds: Household[]
}

export function HouseholdSwitcher({ currentHousehold, allHouseholds }: Props) {
  const router = useRouter()

  async function handleSwitch(householdId: string) {
    if (householdId === currentHousehold.id) return

    await switchHouseholdAction(householdId)
    router.push(`/dashboard?household=${householdId}`)
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1">
          <ChevronDown className="h-4 w-4" />
          <span className="sr-only">Switch household</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {allHouseholds.map((household) => (
          <DropdownMenuItem
            key={household.id}
            onClick={() => handleSwitch(household.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Home className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 truncate">{household.name}</span>
            {household.id === currentHousehold.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
