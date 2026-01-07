-- Household Expense Tracker Schema
-- Multi-tenant architecture with households containing up to 10 members

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HOUSEHOLDS (Tenants)
-- ============================================
CREATE TABLE households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HOUSEHOLD MEMBERS (Users in a household)
-- ============================================
CREATE TABLE household_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, user_id)
);

-- Index for fast user lookups
CREATE INDEX idx_household_members_user_id ON household_members(user_id);
CREATE INDEX idx_household_members_household_id ON household_members(household_id);

-- ============================================
-- CATEGORIES
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    icon VARCHAR(50),
    color VARCHAR(7), -- hex color
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, name, type)
);

CREATE INDEX idx_categories_household_id ON categories(household_id);

-- ============================================
-- ACCOUNTS (Bank accounts, cash, etc.)
-- ============================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('checking', 'savings', 'cash', 'credit_card', 'other')),
    is_shared BOOLEAN DEFAULT true,
    owner_id UUID REFERENCES household_members(id) ON DELETE SET NULL, -- null = shared
    initial_balance DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_accounts_household_id ON accounts(household_id);

-- ============================================
-- TRANSACTIONS
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES household_members(id) ON DELETE RESTRICT,
    amount DECIMAL(12, 2) NOT NULL, -- positive for income, negative for expense
    description VARCHAR(255),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_household_id ON transactions(household_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_member_id ON transactions(member_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);

-- ============================================
-- BUDGETS (Monthly budget per category)
-- ============================================
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    month DATE NOT NULL, -- First day of the month
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, category_id, month)
);

CREATE INDEX idx_budgets_household_id ON budgets(household_id);
CREATE INDEX idx_budgets_month ON budgets(month);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS VARCHAR(20) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result VARCHAR(20) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current household
CREATE OR REPLACE FUNCTION get_user_household_id(user_uuid UUID)
RETURNS UUID AS $$
    SELECT household_id FROM household_members WHERE user_id = user_uuid LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check household member count
CREATE OR REPLACE FUNCTION check_household_member_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM household_members WHERE household_id = NEW.household_id) >= 10 THEN
        RAISE EXCEPTION 'Household member limit (10) reached';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce member limit
CREATE TRIGGER enforce_household_member_limit
    BEFORE INSERT ON household_members
    FOR EACH ROW
    EXECUTE FUNCTION check_household_member_limit();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Households: Users can see households they're members of
CREATE POLICY "Users can view their households"
    ON households FOR SELECT
    USING (id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create households"
    ON households FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Owners can update their households"
    ON households FOR UPDATE
    USING (id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner'));

-- Household Members: Users can see members of their households
CREATE POLICY "Users can view household members"
    ON household_members FOR SELECT
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can join households"
    ON household_members FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage members"
    ON household_members FOR DELETE
    USING (
        household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid() AND role = 'owner')
        OR user_id = auth.uid()
    );

-- Categories: Users can manage categories in their households
CREATE POLICY "Users can view categories"
    ON categories FOR SELECT
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create categories"
    ON categories FOR INSERT
    WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update categories"
    ON categories FOR UPDATE
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete categories"
    ON categories FOR DELETE
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

-- Accounts: Users can manage accounts in their households
CREATE POLICY "Users can view accounts"
    ON accounts FOR SELECT
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create accounts"
    ON accounts FOR INSERT
    WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update accounts"
    ON accounts FOR UPDATE
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete accounts"
    ON accounts FOR DELETE
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

-- Transactions: Users can manage transactions in their households
CREATE POLICY "Users can view transactions"
    ON transactions FOR SELECT
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update transactions"
    ON transactions FOR UPDATE
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete transactions"
    ON transactions FOR DELETE
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

-- Budgets: Users can manage budgets in their households
CREATE POLICY "Users can view budgets"
    ON budgets FOR SELECT
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can create budgets"
    ON budgets FOR INSERT
    WITH CHECK (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update budgets"
    ON budgets FOR UPDATE
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete budgets"
    ON budgets FOR DELETE
    USING (household_id IN (SELECT household_id FROM household_members WHERE user_id = auth.uid()));

-- ============================================
-- DEFAULT CATEGORIES FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION create_default_categories(household_uuid UUID)
RETURNS void AS $$
BEGIN
    -- Income categories
    INSERT INTO categories (household_id, name, type, icon, is_default) VALUES
        (household_uuid, 'Salary', 'income', 'banknote', true),
        (household_uuid, 'Side Income', 'income', 'briefcase', true),
        (household_uuid, 'Gifts', 'income', 'gift', true),
        (household_uuid, 'Sales', 'income', 'tag', true),
        (household_uuid, 'Other Income', 'income', 'plus', true);

    -- Expense categories - Fixed
    INSERT INTO categories (household_id, name, type, icon, is_default) VALUES
        (household_uuid, 'Rent', 'expense', 'home', true),
        (household_uuid, 'Utilities', 'expense', 'zap', true),
        (household_uuid, 'Insurance', 'expense', 'shield', true),
        (household_uuid, 'Subscriptions', 'expense', 'repeat', true),
        (household_uuid, 'Internet', 'expense', 'wifi', true),
        (household_uuid, 'Phone', 'expense', 'smartphone', true);

    -- Expense categories - Variable
    INSERT INTO categories (household_id, name, type, icon, is_default) VALUES
        (household_uuid, 'Groceries', 'expense', 'shopping-cart', true),
        (household_uuid, 'Food Delivery', 'expense', 'utensils', true),
        (household_uuid, 'Dining Out', 'expense', 'coffee', true),
        (household_uuid, 'Transport', 'expense', 'car', true),
        (household_uuid, 'Shopping', 'expense', 'shopping-bag', true),
        (household_uuid, 'Entertainment', 'expense', 'film', true),
        (household_uuid, 'Hobbies', 'expense', 'heart', true),
        (household_uuid, 'Health', 'expense', 'activity', true),
        (household_uuid, 'Beauty', 'expense', 'sparkles', true),
        (household_uuid, 'Household', 'expense', 'home', true),
        (household_uuid, 'Pets', 'expense', 'cat', true),
        (household_uuid, 'Other', 'expense', 'more-horizontal', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
