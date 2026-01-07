import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { HouseholdSetup } from '@/components/household/household-setup'

export default async function SetupPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Check if user already has a household
  const { data: member } = await supabase
    .from('household_members')
    .select('*, household:households(*)')
    .eq('user_id', user.id)
    .single()

  if (member) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
          <p className="text-muted-foreground">
            Create a new household or join an existing one
          </p>
        </div>
        <HouseholdSetup userEmail={user.email || ''} />
      </div>
    </main>
  )
}
