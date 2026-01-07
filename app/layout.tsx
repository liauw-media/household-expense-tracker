import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Household Expenses',
  description: 'Track your household finances together',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
