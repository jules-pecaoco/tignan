-- =============================================================================
-- TIGNAN SOS SYSTEM — SEED / TEST DATA
-- =============================================================================
-- Test account creation helper and sample accounts for development.
-- Run this last, after all other schema files.
--
-- ⚠ FOR DEVELOPMENT ONLY — do not run in production.
-- =============================================================================

-- ─────────────────────────────────────────────
-- HELPER: create_test_user()
-- ─────────────────────────────────────────────
-- Creates a fully valid Supabase auth user + public profile in one call.
-- Bypasses email verification for fast local development.
CREATE OR REPLACE FUNCTION public.create_test_user(
    u_email     text,
    u_password  text,
    u_full_name text,
    u_phone     text,
    u_address   text,
    u_role      text DEFAULT 'user'
) RETURNS uuid AS $$
DECLARE
    u_id uuid;
BEGIN
    u_id := gen_random_uuid();

    -- auth.users
    INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, recovery_sent_at, last_sign_in_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin,
        created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        u_id, 'authenticated', 'authenticated', u_email,
        crypt(u_password, gen_salt('bf')),
        now(), now(), now(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('full_name', u_full_name),
        false, now(), now(),
        '', '', '', ''
    );

    -- auth.identities (required for Supabase login)
    INSERT INTO auth.identities (
        id, user_id, identity_data, provider, provider_id,
        last_sign_in_at, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), u_id,
        jsonb_build_object('sub', u_id::text, 'email', u_email),
        'email', u_id::text,
        now(), now(), now()
    );

    -- public.profiles
    INSERT INTO public.profiles (id, role, full_name, phone, address)
    VALUES (u_id, u_role, u_full_name, u_phone, u_address);

    RETURN u_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────
-- SEED ACCOUNTS
-- ─────────────────────────────────────────────
-- All passwords: password123

-- Admin
SELECT public.create_test_user(
  'admin@test.com', 'password123',
  'SYSTEM ADMIN', '0000000000', 'TIGNAN HQ', 'admin'
);

-- Civilian
SELECT public.create_test_user(
  'user@test.com', 'password123',
  'JUAN DELA CRUZ', '0917000000', 'BARANGAY ONE', 'user'
);

-- Rescuer (with verified rescuer profile)
DO $$
DECLARE
    r_id uuid;
BEGIN
    r_id := public.create_test_user(
      'rescuer@test.com', 'password123',
      'RESCUER BRAVO', '0918000000', 'BARANGAY TWO', 'rescuer'
    );

    INSERT INTO public.rescuer_profiles
      (id, callsign, id_number, id_image_url, gps_lat, gps_lng, verified, status)
    VALUES
      (r_id, 'BRAVO-1', 'ID-12345', 'avatars/default.png', 14.5995, 120.9842, true, 'available');
END $$;

-- Legacy MVP demo rescuers
INSERT INTO rescuers (name, callsign, status) VALUES
  ('Unit-07', 'BRAVO-1', 'available'),
  ('Unit-12', 'DELTA-2', 'available')
ON CONFLICT DO NOTHING;
