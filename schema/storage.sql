-- =============================================================================
-- TIGNAN SOS SYSTEM — STORAGE CONFIGURATION
-- =============================================================================
-- Bucket creation and storage-level RLS policies for the 'tignan-assets' bucket.
-- Run this after policies.sql.
-- =============================================================================

-- ─────────────────────────────────────────────
-- BUCKET
-- ─────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('tignan-assets', 'tignan-assets', true, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- AVATARS — Public read, Authenticated upload
-- ─────────────────────────────────────────────
CREATE POLICY "Storage: Avatar public read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'tignan-assets'
    AND (storage.foldername(name))[1] = 'avatars'
  );

CREATE POLICY "Storage: Avatar auth insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'tignan-assets'
    AND (storage.foldername(name))[1] = 'avatars'
  );

-- ─────────────────────────────────────────────
-- RESCUER IDS — Admin read, Authenticated upload
-- ─────────────────────────────────────────────
CREATE POLICY "Storage: Rescuer ID admin read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'tignan-assets'
    AND (storage.foldername(name))[1] = 'rescuer-ids'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Storage: Rescuer ID auth insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'tignan-assets'
    AND (storage.foldername(name))[1] = 'rescuer-ids'
  );
