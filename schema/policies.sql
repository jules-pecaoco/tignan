-- =============================================================================
-- TIGNAN SOS SYSTEM — ROW LEVEL SECURITY POLICIES
-- =============================================================================
-- All RLS policies for public tables. Uses is_admin() from functions.sql
-- to avoid recursive lookups on the profiles table.
-- Run this after functions.sql.
-- =============================================================================

-- ─────────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ─────────────────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescuer_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescuers          DISABLE ROW LEVEL SECURITY;  -- legacy MVP table, no RLS

-- ═════════════════════════════════════════════
-- PROFILES
-- ═════════════════════════════════════════════

-- Users can read and update their own profile
CREATE POLICY "Profiles: Users can read own"
  ON profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Profiles: Users can update own"
  ON profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Profiles: Users can insert own"
  ON profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- Admins can read and update all profiles (non-recursive via is_admin())
CREATE POLICY "Profiles: Admins can read all"
  ON profiles FOR SELECT
  USING ( public.is_admin() );

CREATE POLICY "Profiles: Admins can update all"
  ON profiles FOR UPDATE
  USING ( public.is_admin() );

-- ═════════════════════════════════════════════
-- RESCUER PROFILES
-- ═════════════════════════════════════════════

CREATE POLICY "Rescuer Profiles: Rescuer can read own"
  ON rescuer_profiles FOR SELECT
  USING ( auth.uid() = id );

CREATE POLICY "Rescuer Profiles: Rescuer can update own"
  ON rescuer_profiles FOR UPDATE
  USING ( auth.uid() = id );

CREATE POLICY "Rescuer Profiles: Rescuers can insert own"
  ON rescuer_profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Rescuer Profiles: Admins can read all"
  ON rescuer_profiles FOR SELECT
  USING ( public.is_admin() );

CREATE POLICY "Rescuer Profiles: Admins can update all"
  ON rescuer_profiles FOR UPDATE
  USING ( public.is_admin() );

-- ═════════════════════════════════════════════
-- SOS ALERTS
-- ═════════════════════════════════════════════

CREATE POLICY "Alerts: Users can insert own"
  ON sos_alerts FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Alerts: Users can read own"
  ON sos_alerts FOR SELECT
  USING ( auth.uid() = user_id );

CREATE POLICY "Alerts: Verified rescuers can read all"
  ON sos_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM rescuer_profiles
      WHERE id = auth.uid() AND verified = true
    )
  );

CREATE POLICY "Alerts: Verified rescuers can update"
  ON sos_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM rescuer_profiles
      WHERE id = auth.uid() AND verified = true
    )
  );

CREATE POLICY "Alerts: Admins can do everything"
  ON sos_alerts FOR ALL
  USING ( public.is_admin() );
