-- RPC functions to bypass RLS chicken-and-egg problems

-- Function to create household and add owner in one atomic operation
CREATE OR REPLACE FUNCTION create_household_with_owner(
    household_name VARCHAR(100),
    owner_display_name VARCHAR(50)
)
RETURNS JSON AS $$
DECLARE
    new_household_id UUID;
    new_invite_code VARCHAR(8);
    chars VARCHAR(32) := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result JSON;
BEGIN
    -- Generate invite code
    new_invite_code := '';
    FOR i IN 1..8 LOOP
        new_invite_code := new_invite_code || substr(chars, floor(random() * 32 + 1)::int, 1);
    END LOOP;

    -- Create household
    INSERT INTO households (name, invite_code)
    VALUES (household_name, new_invite_code)
    RETURNING id INTO new_household_id;

    -- Add creator as owner
    INSERT INTO household_members (household_id, user_id, display_name, role)
    VALUES (new_household_id, auth.uid(), owner_display_name, 'owner');

    -- Create default categories
    PERFORM create_default_categories(new_household_id);

    -- Return the household data
    SELECT json_build_object(
        'id', h.id,
        'name', h.name,
        'invite_code', h.invite_code,
        'created_at', h.created_at
    ) INTO result
    FROM households h
    WHERE h.id = new_household_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to join household by invite code
CREATE OR REPLACE FUNCTION join_household_by_code(
    invite_code_input VARCHAR(20),
    member_display_name VARCHAR(50)
)
RETURNS JSON AS $$
DECLARE
    found_household_id UUID;
    member_count INT;
    result JSON;
BEGIN
    -- Find household by invite code
    SELECT id INTO found_household_id
    FROM households
    WHERE invite_code = upper(invite_code_input);

    IF found_household_id IS NULL THEN
        RAISE EXCEPTION 'Invalid invite code';
    END IF;

    -- Check member count
    SELECT COUNT(*) INTO member_count
    FROM household_members
    WHERE household_id = found_household_id;

    IF member_count >= 10 THEN
        RAISE EXCEPTION 'Household has reached member limit (10)';
    END IF;

    -- Check if already a member
    IF EXISTS (SELECT 1 FROM household_members WHERE household_id = found_household_id AND user_id = auth.uid()) THEN
        RAISE EXCEPTION 'Already a member of this household';
    END IF;

    -- Add as member
    INSERT INTO household_members (household_id, user_id, display_name, role)
    VALUES (found_household_id, auth.uid(), member_display_name, 'member');

    -- Return household data
    SELECT json_build_object(
        'id', h.id,
        'name', h.name,
        'invite_code', h.invite_code,
        'created_at', h.created_at
    ) INTO result
    FROM households h
    WHERE h.id = found_household_id;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
