-- ============================================================================
-- STALF Property Tax Calculator — Supabase schema
-- ============================================================================
-- Run this once in the Supabase SQL Editor (or via `supabase db push` /
-- the CLI) on a fresh project. It creates a single table used to save and
-- retrieve past tax computations ("history") from the app.
--
-- NOTE ON AUTH: this app does not currently have real user accounts — the
-- UI is always "logged in" as a single internal staff user (see
-- src/lib/AuthContext.jsx). Because of that, the policies below allow the
-- public anon key to read/write freely, scoped only by this table. That's
-- fine for an internal tool behind a private link, but the anon key ships
-- in the JS bundle, so anyone who has it can read/write every row. If this
-- ever needs to be locked down per-user, add Supabase Auth and swap the
-- policies below for `auth.uid() = created_by_id` checks.
-- ============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.tax_calculations (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),

  -- 'sale' | 'donation' | 'estate'
  computation_type    text not null check (computation_type in ('sale', 'donation', 'estate')),

  -- Short human-readable label shown in the history list,
  -- e.g. "Sale — Juan Dela Cruz to Maria Santos"
  title               text not null default '',

  -- Free-form snapshots of whatever was on screen when saved.
  -- Keeping these as jsonb avoids having to migrate the schema every time
  -- a form field is added/renamed in the calculator.
  party_info          jsonb not null default '{}'::jsonb,   -- seller/buyer or deceased/heirs
  property_details    jsonb not null default '{}'::jsonb,   -- land/stocks/vehicle/securities/estate props
  computation_result  jsonb not null default '{}'::jsonb,   -- full { breakdown, totalTax, ... } object

  -- Denormalized for fast sorting/filtering without unpacking jsonb.
  total_tax           numeric not null default 0,

  -- No real auth yet — free-text name of whoever was "logged in" when saved.
  created_by          text not null default 'Sadsad Tamesis Staff',

  notes               text
);

create index if not exists tax_calculations_created_at_idx
  on public.tax_calculations (created_at desc);

create index if not exists tax_calculations_type_idx
  on public.tax_calculations (computation_type);

alter table public.tax_calculations enable row level security;

-- Permissive policies matching the app's current "no login wall" design.
-- See the NOTE ON AUTH above before using this in a public-facing deployment.
drop policy if exists "Allow read for anon" on public.tax_calculations;
create policy "Allow read for anon"
  on public.tax_calculations for select
  to anon, authenticated
  using (true);

drop policy if exists "Allow insert for anon" on public.tax_calculations;
create policy "Allow insert for anon"
  on public.tax_calculations for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Allow update for anon" on public.tax_calculations;
create policy "Allow update for anon"
  on public.tax_calculations for update
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Allow delete for anon" on public.tax_calculations;
create policy "Allow delete for anon"
  on public.tax_calculations for delete
  to anon, authenticated
  using (true);
