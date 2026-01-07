-- Function to get recent public households (for landing page)
CREATE OR REPLACE FUNCTION get_recent_households(limit_count INT DEFAULT 3)
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  member_count BIGINT,
  created_at TIMESTAMPTZ
) AS $$
  SELECT
    h.id,
    h.name,
    COUNT(hm.id) as member_count,
    h.created_at
  FROM households h
  LEFT JOIN household_members hm ON h.id = hm.household_id
  GROUP BY h.id, h.name, h.created_at
  HAVING COUNT(hm.id) < 10  -- Only show households that aren't full
  ORDER BY h.created_at DESC
  LIMIT limit_count;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
