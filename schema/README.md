# Tignan Database Schema

The database schema for the Tignan SOS system, powered by Supabase (PostgreSQL).

## Files

Run the SQL files **in this order** on a fresh Supabase project:

| # | File | Purpose |
|---|---|---|
| 1 | `tables.sql` | Extensions, table definitions, foreign keys, realtime config |
| 2 | `functions.sql` | Helper functions used by RLS policies (`is_admin()`) |
| 3 | `policies.sql` | Row Level Security policies for all public tables |
| 4 | `storage.sql` | Storage bucket creation and storage-object policies |
| 5 | `seed.sql` | Test accounts and sample data (**dev only**) |

## Quick Start

Paste each file into the **Supabase SQL Editor** in the order listed above.

## Architecture

- **profiles** — Extends `auth.users` with role, name, phone, address.
- **rescuer_profiles** — Extra details for rescuer accounts (ID, callsign, GPS, verification).
- **sos_alerts** — SOS events with status tracking and rescuer assignment.
- **rescuers** — Legacy MVP lookup table for demo rescuers.

## Technical Stack

- **Service Provider**: Supabase
- **Database Engine**: PostgreSQL
- **Core Features**: Realtime subscriptions, Row Level Security, Storage buckets
