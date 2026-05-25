create or replace function public.record_resume_download(
  p_owner_id text,
  p_owner_name text,
  p_user_label text,
  p_user_email text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.resume_visit_logs (owner_id, mode, owner_name, user_label, user_email)
  values (
    p_owner_id,
    'PDF 다운로드',
    p_owner_name,
    p_user_label,
    nullif(trim(p_user_email), '')
  )
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.record_resume_download(text, text, text, text) to anon, authenticated;
