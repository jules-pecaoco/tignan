-- =============================================================================
-- TIGNAN SOS SYSTEM — HELPER FUNCTIONS
-- =============================================================================
-- Security-definer functions used by RLS policies and application logic.
-- Run this after tables.sql.
-- =============================================================================

-- ─────────────────────────────────────────────
-- is_admin()
-- ─────────────────────────────────────────────
-- SECURITY DEFINER: bypasses RLS on profiles to prevent infinite recursion
-- when admin policies on the profiles table check the caller's role.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
