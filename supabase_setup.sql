-- ============================================================
-- Supabase setup for the team-ranking admin panel.
-- Run this once in: Supabase dashboard -> SQL Editor -> New query -> Run.
-- ============================================================

-- 1) Table that stores the four teams and their scores.
create table if not exists public.teams (
  id          bigint generated always as identity primary key,
  name        text    not null unique,
  score       integer not null default 0,
  sort_order  integer not null
);

-- 2) Seed the four teams in the required display order.
insert into public.teams (name, score, sort_order) values
  ('โก๊ดโกด',  0, 1),
  ('เศร้าซึม', 0, 2),
  ('อี๋แหวะ',  0, 3),
  ('กลั๊วกลัว', 0, 4)
on conflict (name) do nothing;

-- 3) Row Level Security: anyone may READ, but nobody may write the
--    table directly. All writes go through the adjust_score() function.
alter table public.teams enable row level security;

drop policy if exists "teams public read" on public.teams;
create policy "teams public read"
  on public.teams for select
  to anon, authenticated
  using (true);

-- 4) Atomic add/subtract. SECURITY DEFINER lets it update the table
--    even though anon has no direct UPDATE policy.
create or replace function public.adjust_score(p_id bigint, p_delta integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.teams set score = score + p_delta where id = p_id;
$$;

grant execute on function public.adjust_score(bigint, integer) to anon, authenticated;

-- ============================================================
-- SECURITY NOTE
-- The admin password (Ctrl+I gate) is checked in the browser only,
-- so it keeps casual users out but is NOT cryptographically secure:
-- anyone who reads app.js gets the anon key and could call
-- adjust_score() themselves. That is fine for a classroom/event
-- scoreboard. For real protection, move scoring behind Supabase
-- Auth + an Edge Function instead of an anon-callable RPC.
-- ============================================================
