'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createHouseholdAction, joinHouseholdAction } from '@/app/actions'

interface Props {
  userEmail: string
}

export function HouseholdSetup({ userEmail }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const defaultDisplayName = userEmail.split('@')[0]

  async function handleCreate(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await createHouseholdAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleJoin(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await joinHouseholdAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Tabs defaultValue="create" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="create">Create New</TabsTrigger>
        <TabsTrigger value="join">Join Existing</TabsTrigger>
      </TabsList>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Create Household</CardTitle>
            <CardDescription>
              Start a new household and invite others to join
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Household Name</Label>
                <Input
                  id="create-name"
                  name="name"
                  placeholder="e.g., The Smiths"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-displayName">Your Display Name</Label>
                <Input
                  id="create-displayName"
                  name="displayName"
                  placeholder="e.g., John"
                  defaultValue={defaultDisplayName}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Household'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="join">
        <Card>
          <CardHeader>
            <CardTitle>Join Household</CardTitle>
            <CardDescription>
              Enter the invite code shared with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleJoin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="join-inviteCode">Invite Code</Label>
                <Input
                  id="join-inviteCode"
                  name="inviteCode"
                  placeholder="e.g., ABC12345"
                  className="uppercase"
                  maxLength={8}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="join-displayName">Your Display Name</Label>
                <Input
                  id="join-displayName"
                  name="displayName"
                  placeholder="e.g., John"
                  defaultValue={defaultDisplayName}
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Joining...' : 'Join Household'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
