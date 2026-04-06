-- =============================================================================
-- TIGNAN SOS SYSTEM — TABLE DEFINITIONS
-- =============================================================================
-- All DDL: extensions, tables, columns, constraints, and realtime configuration.
-- Run this first before any other schema file.
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────
-- 1. SOS ALERTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sos_alerts (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid,                                       -- FK added below after profiles exists
  name          text NOT NULL,
  phone         text NOT NULL,
  lat           float8 NOT NULL,
  lng           float8 NOT NULL,
  status        text NOT NULL DEFAULT 'sending',            -- sending | api | sms | delivered
  priority      text NOT NULL DEFAULT 'P1',
  rescuer_id    uuid,                                       -- FK added below after rescuers exists
  rescuer_name  text,
  rescuer_callsign      text,
  rescuer_assigned_at   timestamptz,
  acknowledged_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 2. PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'user',               -- user | rescuer | admin
  full_name   text NOT NULL,
  phone       text NOT NULL,
  address     text NOT NULL,                              -- barangay / address
  avatar_url  text,                                       -- storage bucket path
  created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 3. RESCUER PROFILES (role = 'rescuer' only)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescuer_profiles (
  id              uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  callsign        text UNIQUE,                            -- assigned by admin on approval
  id_number       text NOT NULL,                          -- submitted gov ID number
  id_image_url    text NOT NULL,                          -- storage bucket path
  gps_lat         float8,                                 -- current/home GPS
  gps_lng         float8,
  verified        boolean NOT NULL DEFAULT false,
  verified_at     timestamptz,
  verified_by     uuid REFERENCES profiles(id),
  status          text NOT NULL DEFAULT 'available'       -- available | busy
);

-- ─────────────────────────────────────────────
-- 4. RESCUERS (legacy MVP table, kept for FK)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rescuers (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        text NOT NULL,
  callsign    text NOT NULL UNIQUE,
  status      text NOT NULL DEFAULT 'available',          -- available | busy
  created_at  timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────
-- FOREIGN KEYS
-- ─────────────────────────────────────────────
ALTER TABLE sos_alerts
  ADD CONSTRAINT fk_alert_user    FOREIGN KEY (user_id)    REFERENCES profiles(id),
  ADD CONSTRAINT fk_alert_rescuer FOREIGN KEY (rescuer_id) REFERENCES rescuers(id);

-- ─────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER TABLE sos_alerts        REPLICA IDENTITY FULL;
ALTER TABLE profiles          REPLICA IDENTITY FULL;
ALTER TABLE rescuer_profiles  REPLICA IDENTITY FULL;
ALTER TABLE rescuers          REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE sos_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE rescuer_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE rescuers;
