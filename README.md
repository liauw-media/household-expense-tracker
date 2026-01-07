# Household Expense Tracker

A multi-tenant household finance management app for tracking shared and personal expenses within a household.

## Vision

Transform the traditional Excel-based household budgeting into a collaborative web application where household members can jointly manage finances, track spending, and stay on budget together.

## The Problem

Managing household finances with multiple people is messy:
- Excel files get out of sync
- No real-time collaboration
- Hard to see who spent what
- Budget tracking requires manual work
- No mobile-friendly access

## The Solution

A modern, multi-tenant web app where households can:
- **Track transactions** - Log expenses with categories, dates, and who paid
- **Manage budgets** - Set monthly budgets per category, track plan vs actual
- **Multiple accounts** - Track different accounts (checking, savings, cash, shared)
- **Personal + shared views** - See individual spending and household totals
- **Visual insights** - Charts showing spending trends and budget health

## Core Concepts

### Multi-Tenancy (Households)
- Each **household** is a tenant with up to 10 members
- Members can be invited via email
- Role-based access: Owner, Member
- Data is fully isolated between households

### Accounts
- Bank accounts, cash, credit cards
- Personal or shared designation
- Track balances across accounts

### Transactions
- Date, amount, category, description
- Assigned to a household member
- Linked to an account
- Supports income and expenses

### Budgets
- Monthly budget targets per category
- Track planned vs actual spending
- Alerts when approaching/exceeding budget

### Categories
- Pre-defined expense categories (customizable)
- **Income:** Salary, Side income, Gifts, Sales
- **Fixed costs:** Rent, Utilities, Insurance, Subscriptions
- **Variable costs:** Groceries, Dining out, Transport, Shopping, Hobbies

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Magic Links) |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |
| Hosting | Vercel |
| Boilerplate | [Supalite](https://supalite.dev) |

## Key Features (MVP)

### Authentication & Tenancy
- [ ] Magic link authentication
- [ ] Create household (becomes owner)
- [ ] Invite members via email
- [ ] Switch between households (if member of multiple)

### Transactions
- [ ] Add/edit/delete transactions
- [ ] Filter by date range, category, member
- [ ] Bulk import (future: from bank CSV)

### Budgets
- [ ] Set monthly budget per category
- [ ] View budget vs actual spending
- [ ] Visual progress bars

### Accounts
- [ ] Create personal/shared accounts
- [ ] Track running balance
- [ ] Assign transactions to accounts

### Dashboard
- [ ] Monthly overview (income, expenses, balance)
- [ ] Spending by category (pie/bar chart)
- [ ] Budget health indicators
- [ ] Recent transactions

### Reports
- [ ] Monthly trends chart
- [ ] Category breakdown
- [ ] Member contribution view

## Data Model Overview

```
Household (tenant)
├── Members (users with roles)
├── Accounts (personal/shared)
├── Categories (customizable)
├── Budgets (monthly targets)
└── Transactions (the actual data)
```

## User Flows

### New User
1. Sign up with email (magic link)
2. Create a new household OR accept invitation
3. Set up accounts and categories
4. Start logging transactions

### Daily Use
1. Open app on phone/desktop
2. Quick-add transaction (amount, category, done)
3. View dashboard for budget status

### Monthly Review
1. Check budget vs actual
2. Review spending by category
3. Adjust next month's budget if needed

## Security

- Row Level Security (RLS) on all tables
- Users can only access their household's data
- Invite-only household membership
- No data sharing between tenants

## Future Ideas (Post-MVP)

- Recurring transactions
- Bank sync / CSV import
- Receipt photo upload
- Split expenses between members
- Savings goals
- Currency support
- Mobile app (React Native)
- Export to PDF/Excel

## Getting Started

```bash
# Clone the repo
git clone <repo-url>
cd household-expense-tracker

# Set up environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Install dependencies
npm install

# Run locally
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Contributing

This is a personal project for household finance tracking. Feel free to fork and adapt for your own needs.

## License

MIT
