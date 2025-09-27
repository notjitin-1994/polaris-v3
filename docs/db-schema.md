### Database Schema (Supabase / PostgreSQL)

This document describes the production-ready schema for user profiles and the `blueprint_generator` feature.

#### Entities

- **auth.users** (managed by Supabase Auth)
  - Source of truth for user identity.

- **public.user_profiles** (1-1 extension of `auth.users`)
  - `user_id` (PK, UUID, FK → `auth.users.id`, ON DELETE CASCADE)
  - `full_name` (TEXT, nullable)
  - `avatar_url` (TEXT, nullable)
  - `preferences` (JSONB, NOT NULL, default `{}`)
  - `created_at` (TIMESTAMPTZ, NOT NULL, default `now()`)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, default `now()`)

- **public.blueprint_generator** (N-1 with `auth.users`)
  - `id` (PK, UUID, default `gen_random_uuid()`)
  - `user_id` (UUID, NOT NULL, FK → `auth.users.id`, ON DELETE CASCADE)
  - `version` (INT, NOT NULL, default `1`)
  - `static_answers` (JSONB, NOT NULL, default `{}`)
  - `dynamic_questions` (JSONB, NOT NULL, default `[]`) - Form schema format for UI rendering
  - `dynamic_questions_raw` (JSONB, NOT NULL, default `[]`) - Raw Ollama format for blueprint generation
  - `dynamic_answers` (JSONB, NOT NULL, default `{}`)
  - `blueprint_json` (JSONB, NOT NULL, default `{}`)
  - `blueprint_markdown` (TEXT, nullable)
  - `status` (TEXT, NOT NULL, CHECK in ['draft','generating','completed','error'], default 'draft')
  - `created_at` (TIMESTAMPTZ, NOT NULL, default `now()`)
  - `updated_at` (TIMESTAMPTZ, NOT NULL, default `now()`)

#### Indexing Strategy

- `blueprint_generator`:
  - BTREE: `(user_id)`, `(status)`, `(created_at)`
  - Composite BTREE: `(user_id, status)`
  - GIN (jsonb_path_ops): `static_answers`, `dynamic_questions`, `dynamic_questions_raw`, `dynamic_answers`, `blueprint_json`

#### RLS Policies

- Enable RLS on `user_profiles` and `blueprint_generator`.
- Policies (per-table): SELECT/INSERT/UPDATE/DELETE allowed only when `user_id = auth.uid()`.

#### Functions & Triggers

- `public.set_updated_at()` — BEFORE UPDATE trigger to set `updated_at = now()`.
- `public.increment_blueprint_version()` — BEFORE UPDATE trigger to increment `version` on any update.

#### Notes

- Uses `gen_random_uuid()` (pgcrypto). `uuid-ossp` is also enabled for compatibility.
- JSONB defaults ensure safe shape for reads and partial writes.
- Check constraint for `status` enforces known state machine phases.


