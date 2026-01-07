import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MagicLinkForm } from '@/components/auth/magic-link-form'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">
            Household Expenses
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Track your household finances together
          </p>
        </div>

        <div className="border rounded-lg p-8 mb-6 bg-card">
          <h2 className="text-xl font-semibold mb-4">
            Sign In
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Enter your email to receive a magic link
          </p>
          <MagicLinkForm />
        </div>

        <div className="border rounded-lg p-6 bg-card">
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
        </div>
      </div>
    </main>
  )
}
