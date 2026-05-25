create table if not exists public.resume_visit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null references public.resume_workspaces(owner_id) on delete cascade,
  visited_at timestamptz not null default now(),
  mode text not null,
  owner_name text not null,
  user_label text not null,
  user_email text
);

create index if not exists resume_visit_logs_owner_idx
  on public.resume_visit_logs (owner_id, visited_at desc);

alter table public.resume_visit_logs enable row level security;

create policy "public read resume visit logs"
on public.resume_visit_logs
for select
using (true);

-- Bootstrap the primary workspace counter to a baseline of 1232 so the
-- public-facing visit chip starts from this value.
update public.resume_visit_counters
set count = greatest(coalesce(count, 0), 1232),
    updated_at = now()
where owner_id = 'public-resume';

-- Backfill placeholder log entries so each existing aggregated counter
-- has the same number of rows in the new log table.
do $$
declare
  rec record;
  existing_count bigint;
  remaining bigint;
begin
  for rec in select owner_id, count from public.resume_visit_counters loop
    select count(*) into existing_count
    from public.resume_visit_logs
    where owner_id = rec.owner_id;

    remaining := greatest(coalesce(rec.count, 0) - existing_count, 0);

    if remaining > 0 then
      insert into public.resume_visit_logs (owner_id, visited_at, mode, owner_name, user_label)
      select
        rec.owner_id,
        now() - (s.i || ' minutes')::interval,
        '공개 보기',
        rec.owner_id,
        '익명 방문자'
      from generate_series(1, remaining::int) as s(i);
    end if;
  end loop;
end $$;

create or replace function public.record_resume_visit(
  p_owner_id text,
  p_mode text,
  p_owner_name text,
  p_user_label text,
  p_user_email text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  insert into public.resume_visit_logs (owner_id, mode, owner_name, user_label, user_email)
  values (
    p_owner_id,
    p_mode,
    p_owner_name,
    p_user_label,
    nullif(trim(p_user_email), '')
  );

  select count(*) into new_count
  from public.resume_visit_logs
  where owner_id = p_owner_id;

  insert into public.resume_visit_counters (owner_id, count, updated_at)
  values (p_owner_id, new_count, now())
  on conflict (owner_id)
  do update set count = excluded.count, updated_at = excluded.updated_at;

  return new_count;
end;
$$;

grant execute on function public.record_resume_visit(text, text, text, text, text) to anon, authenticated;
