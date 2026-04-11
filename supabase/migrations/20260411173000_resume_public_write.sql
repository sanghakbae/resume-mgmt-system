drop policy if exists "public create resume workspace" on public.resume_workspaces;
drop policy if exists "public update resume workspace" on public.resume_workspaces;
drop policy if exists "public upload resume assets" on storage.objects;
drop policy if exists "public update resume assets" on storage.objects;

create policy "authenticated users can create their own resume workspace"
on public.resume_workspaces
for insert
to authenticated
with check ((select auth.jwt()->>'email') = editor_email);

create policy "authenticated editor can update resume workspace"
on public.resume_workspaces
for update
to authenticated
using ((select auth.jwt()->>'email') = editor_email)
with check ((select auth.jwt()->>'email') = editor_email);

create policy "authenticated upload resume assets"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'resume-assets');

create policy "authenticated update resume assets"
on storage.objects
for update
to authenticated
using (bucket_id = 'resume-assets')
with check (bucket_id = 'resume-assets');
