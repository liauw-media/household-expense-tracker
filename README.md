# Household Expense Tracker

A real-time, multi-tenant household finance management app for tracking shared and personal expenses.

**Live Demo:** [household-expense-tracker.vercel.app](https://household-expense-tracker.vercel.app)

## Features

- **Real-time sync** - Changes sync instantly across all household members via Supabase Realtime
- **Magic link auth** - Passwordless email authentication
- **QR code invites** - Share household invite codes via QR
- **Transaction tracking** - Log income/expenses with categories, dates, and member attribution
- **Budget management** - Set monthly budgets per category with visual progress tracking
- **Multiple accounts** - Track checking, savings, cash, credit cards (shared or personal)
- **Analytics dashboard** - Monthly trends, category breakdowns, income vs expense charts
- **Quick stats** - Biggest expense, top category, daily average, transaction count
- **Category customization** - Edit category names, icons, and colors
- **Multi-currency** - Support for EUR, USD, GBP, CHF, JPY, CAD, AUD
- **Responsive design** - Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Magic Links) |
| Realtime | Supabase Realtime |
| Styling | Tailwind CSS |
| Components | shadcn/ui + Radix UI |
| Charts | Recharts |
| Hosting | Vercel |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/Smooth-Operation/household-expense-tracker.git
cd household-expense-tracker

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run locally
pnpm dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Setup

Run the migrations in `supabase/migrations/` in order, then enable Realtime:

```sql
alter publication supabase_realtime add table transactions;
alter publication supabase_realtime add table budgets;
alter publication supabase_realtime add table accounts;
alter publication supabase_realtime add table categories;
```

## Architecture

```
Household (tenant, max 10 members)
├── Members (owner/admin/member roles)
├── Accounts (personal/shared)
├── Categories (20 defaults + custom)
├── Budgets (monthly targets per category)
└── Transactions (income/expenses)
```

- **Row Level Security (RLS)** on all tables - users only see their household's data
- **Server Components** for data fetching, **Server Actions** for mutations
- **Realtime subscriptions** filtered by household_id

## License

MIT
