-- Fix RLS infinite recursion by using security definer functions

-- Function to get user's household IDs (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_household_ids(user_uuid UUID)
RETURNS SETOF UUID AS $$
    SELECT household_id FROM household_members WHERE user_id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Users can view their households" ON households;
DROP POLICY IF EXISTS "Users can view household members" ON household_members;
DROP POLICY IF EXISTS "Owners can manage members" ON household_members;
DROP POLICY IF EXISTS "Users can view categories" ON categories;
DROP POLICY IF EXISTS "Users can create categories" ON categories;
DROP POLICY IF EXISTS "Users can update categories" ON categories;
DROP POLICY IF EXISTS "Users can delete categories" ON categories;
DROP POLICY IF EXISTS "Users can view accounts" ON accounts;
DROP POLICY IF EXISTS "Users can create accounts" ON accounts;
DROP POLICY IF EXISTS "Users can update accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete accounts" ON accounts;
DROP POLICY IF EXISTS "Users can view transactions" ON transactions;
DROP POLICY IF EXISTS "Users can create transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete transactions" ON transactions;
DROP POLICY IF EXISTS "Users can view budgets" ON budgets;
DROP POLICY IF EXISTS "Users can create budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete budgets" ON budgets;

-- Recreate policies using the security definer function

-- Households
CREATE POLICY "Users can view their households"
    ON households FOR SELECT
    USING (id IN (SELECT get_user_household_ids(auth.uid())));

-- Household Members
CREATE POLICY "Users can view household members"
    ON household_members FOR SELECT
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Owners can manage members"
    ON household_members FOR DELETE
    USING (
        (SELECT role FROM household_members WHERE user_id = auth.uid() AND household_id = household_members.household_id LIMIT 1) = 'owner'
        OR user_id = auth.uid()
    );

-- Categories
CREATE POLICY "Users can view categories"
    ON categories FOR SELECT
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can create categories"
    ON categories FOR INSERT
    WITH CHECK (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can update categories"
    ON categories FOR UPDATE
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can delete categories"
    ON categories FOR DELETE
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

-- Accounts
CREATE POLICY "Users can view accounts"
    ON accounts FOR SELECT
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can create accounts"
    ON accounts FOR INSERT
    WITH CHECK (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can update accounts"
    ON accounts FOR UPDATE
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can delete accounts"
    ON accounts FOR DELETE
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

-- Transactions
CREATE POLICY "Users can view transactions"
    ON transactions FOR SELECT
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can create transactions"
    ON transactions FOR INSERT
    WITH CHECK (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can update transactions"
    ON transactions FOR UPDATE
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can delete transactions"
    ON transactions FOR DELETE
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

-- Budgets
CREATE POLICY "Users can view budgets"
    ON budgets FOR SELECT
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can create budgets"
    ON budgets FOR INSERT
    WITH CHECK (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can update budgets"
    ON budgets FOR UPDATE
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));

CREATE POLICY "Users can delete budgets"
    ON budgets FOR DELETE
    USING (household_id IN (SELECT get_user_household_ids(auth.uid())));
