-- ============================================================================
-- Tinpear: lock down blog writes + introduce an admin role
--
-- WHERE TO RUN:  Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- WHY:           The `blogs` table currently permits anonymous SELECT, INSERT,
--                UPDATE and DELETE. Anyone with the public anon key (which is
--                embedded in the browser bundle) can read, rewrite or wipe
--                every post by calling the PostgREST API directly — no login,
--                no admin page required.
--
--                middleware.ts only hides the /admin UI. This file is the
--                actual security boundary.
--
-- SAFE TO RE-RUN: every statement is idempotent (IF NOT EXISTS / DROP ... IF
--                 EXISTS / ON CONFLICT).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Admin flag on profiles
--     profiles currently has: id, username, full_name, avatar_url,
--     location, updated_at  (and zero rows)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists is_admin boolean not null default false;


-- ---------------------------------------------------------------------------
-- 2. Give the administrator a profile row with the flag set.
--
--    >>> REPLACE 'admin@yourdomain.com' WITH THE EMAIL YOU SIGN IN WITH. <<<
--    NOTE (confirmed): the real contact / sign-in email is
--    tinpear.now@gmail.com (used in app/about/page.tsx and the mail flow).
--
--    profiles is empty today, so this both creates the row and flags it.
--    The row is also required for the admin page to read is_admin.
-- ---------------------------------------------------------------------------
insert into public.profiles (id, username, full_name, is_admin)
select u.id, 'admin', 'Administrator', true
from auth.users u
where u.email = 'tinpear.now@gmail.com'
on conflict (id) do update set is_admin = true;


-- ---------------------------------------------------------------------------
-- 3. blogs: enable RLS, then allow public reads but admin-only writes
--
--    RLS may currently be DISABLED on this table (which is why anon could do
--    anything). Enabling it with no policies would deny everything — so the
--    read policy below is created in the same breath to keep the public
--    /news pages working.
-- ---------------------------------------------------------------------------
alter table public.blogs enable row level security;

-- Public read: /news and /news/[slug] are unauthenticated pages.
drop policy if exists "blogs_public_read" on public.blogs;
create policy "blogs_public_read"
  on public.blogs
  for select
  using (true);

-- Writes (INSERT + UPDATE + DELETE) require a signed-in user whose profile
-- row is flagged is_admin. FOR ALL with both USING and WITH CHECK covers
-- all three operations.
drop policy if exists "blogs_admin_write" on public.blogs;
create policy "blogs_admin_write"
  on public.blogs
  for all
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.is_admin = true
    )
  );


-- ---------------------------------------------------------------------------
-- 4. profiles: users manage their own row only
--
--    The admin page needs to read its own is_admin flag, hence SELECT on the
--    caller's own row. Scoped to auth.uid() = id so there is no recursion
--    back into the blogs policy above.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No DELETE policy on purpose: profiles rows are not user-deletable.


-- ============================================================================
-- VERIFICATION (run these as separate queries afterwards)
-- ============================================================================

-- (a) Confirm the admin flag landed — expect exactly 1 row with is_admin=true:
--     select u.email, p.is_admin
--     from auth.users u
--     join public.profiles p on p.id = u.id;

-- (b) Confirm RLS is on and policies exist:
--     select relname, relrowsecurity
--     from pg_class
--     where relname in ('blogs', 'profiles');
--     -- relrowsecurity must be 't' for both
--
--     select policyname, cmd, roles
--     from pg_policies
--     where schemaname = 'public'
--       and tablename in ('blogs', 'profiles');

-- (c) From the browser console on tinpear.org (anon key, no session):
--     An INSERT must now FAIL with a 403 RLS error instead of 201:
--
--     const KEY = '<anon key>';
--     fetch('https://droqeosuxenldeiytveo.supabase.co/rest/v1/blogs', {
--       method: 'POST',
--       headers: {
--         apikey: KEY,
--         Authorization: `Bearer ${KEY}`,
--         'Content-Type': 'application/json',
--         Prefer: 'return=minimal',
--       },
--       body: JSON.stringify({
--         title: 'probe', summary: 'probe', author: 'probe',
--         date: '2026-01-01', slug: 'probe-should-fail', content: 'probe',
--       }),
--     }).then(r => console.log(r.status));   // expect 403
--
--     SELECT must still return 200 (public news pages depend on it).

-- (d) Sanity-check the public news pages still render:
--     https://tinpear.org/news
--     https://tinpear.org/news/<any-existing-slug>
-- ============================================================================


-- ============================================================================
-- ROLLBACK (only if something breaks)
-- ============================================================================
-- drop policy if exists "blogs_public_read"  on public.blogs;
-- drop policy if exists "blogs_admin_write"  on public.blogs;
-- drop policy if exists "profiles_select_own" on public.profiles;
-- drop policy if exists "profiles_insert_own" on public.profiles;
-- drop policy if exists "profiles_update_own" on public.profiles;
-- alter table public.blogs    disable row level security;
-- alter table public.profiles disable row level security;
-- alter table public.profiles drop column if exists is_admin;
