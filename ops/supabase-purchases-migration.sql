-- ============================================================================
-- Tinpear: course purchases (payment gateway -> Supabase)
--
-- WHERE TO RUN:  Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- WHY:           The payment webhook / verify endpoint writes purchases here so
--                a course only unlocks for users who actually paid.
--
-- SAFE TO RE-RUN: every statement is idempotent (IF NOT EXISTS / DROP ... IF
--                 EXISTS / ON CONFLICT).
-- ============================================================================

-- One row per successful payment -> course.
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  course_title text not null,
  amount_cents integer not null,
  currency text not null default 'ngn',
  gateway text not null default 'paystack',
  reference text,
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

-- Users can read their own purchases (used by the course gating check).
drop policy if exists "purchases_select_own" on public.purchases;
create policy "purchases_select_own"
  on public.purchases
  for select
  using (auth.uid() = user_id);

-- Writes come from the payment verify/confirmation endpoint via the service
-- role (RLS bypassed). No insert/update/delete policy for anonymous users.
