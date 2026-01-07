import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MagicLinkForm } from '@/components/auth/magic-link-form'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { RecentHouseholds } from '@/components/landing/recent-households'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Fetch recent households
  const { data: recentHouseholds } = await supabase.rpc('get_recent_households', {
    limit_count: 3
  })

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            Household Expenses
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Track your household finances together
          </p>
        </div>

        <div className="border rounded-lg p-8 mb-6 bg-card/80 backdrop-blur-sm">
          <h2 className="text-xl font-semibold mb-4">
            Sign In
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Enter your email to receive a magic link
          </p>
          <MagicLinkForm />
        </div>

        <div className="border rounded-lg p-6 bg-card/80 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3">
            Features
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="text-primary mr-2">+</span>
              <span>Track income and expenses</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">+</span>
              <span>Share with up to 10 household members</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">+</span>
              <span>Set and track budgets by category</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">+</span>
              <span>Visual spending insights</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary mr-2">+</span>
              <span>Multiple accounts support</span>
            </li>
          </ul>

          {recentHouseholds && recentHouseholds.length > 0 && (
            <RecentHouseholds households={recentHouseholds} />
          )}
        </div>
      </div>
    </main>
  )
}
