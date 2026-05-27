-- Reduce disk IO from large append-only tables.
--
-- Retention policy:
-- - capture_http_events: 14 days
-- - capture_inspection_runs: 30 days
-- - itgc_audit_log: 180 days
-- - policy_audit_logs: 180 days
-- - resume_visit_logs: 90 days
-- - policy_document_sections: keep sections for the latest 3 versions per document,
--   and delete older version sections only after 365 days.

create table if not exists public.data_retention_policies (
  table_name text primary key,
  retention_days integer not null,
  retention_basis text not null,
  notes text,
  updated_at timestamptz not null default now()
);

insert into public.data_retention_policies (table_name, retention_days, retention_basis, notes)
values
  ('capture_http_events', 14, 'created_at', 'HTTP capture event payloads and response previews are high-IO transient diagnostics.'),
  ('capture_inspection_runs', 30, 'created_at', 'Inspection snapshots are regenerated from runs and reports.'),
  ('capture_har_analyses', 30, 'created_at', 'HAR analysis summaries are operational diagnostics.'),
  ('inspection_results', 180, 'created_at', 'Retain recent inspection outcomes; archive externally if longer evidence is required.'),
  ('inspection_result_excludes', 180, 'created_at', 'Retain recent exclusion history.'),
  ('itgc_audit_log', 180, 'created_at_ts', 'Audit trail retained for recent operational review.'),
  ('asset_audit_logs', 180, 'created_at', 'Asset audit trail retained for recent operational review.'),
  ('license_audit_logs', 180, 'created_at', 'License audit trail retained for recent operational review.'),
  ('audit_logs', 180, 'created_at', 'Generic audit trail retained for recent operational review.'),
  ('security_audit_logs', 180, 'created_at', 'Security audit trail retained for recent operational review.'),
  ('policy_audit_logs', 180, 'created_at', 'Policy audit trail retained for recent operational review.'),
  ('policy_ai_report_history', 180, 'created_at', 'AI report outputs can be regenerated from source selections.'),
  ('policy_review_execution_history', 180, 'created_at', 'Review execution history retained for recent operations.'),
  ('lr_review_logs', 180, 'created_at', 'Legal/security review action logs retained for recent operations.'),
  ('resume_visit_logs', 90, 'visited_at', 'Public visit log details are not required for long-term counting.'),
  ('policy_document_sections', 365, 'policy_document_versions.created_at', 'Keep latest 3 versions per document regardless of age.')
on conflict (table_name)
do update set
  retention_days = excluded.retention_days,
  retention_basis = excluded.retention_basis,
  notes = excluded.notes,
  updated_at = now();

create index if not exists capture_http_events_created_at_idx
  on public.capture_http_events (created_at desc);

create index if not exists capture_http_events_session_created_idx
  on public.capture_http_events (capture_session_id, created_at desc);

create index if not exists capture_inspection_runs_created_at_idx
  on public.capture_inspection_runs (created_at desc);

create index if not exists capture_inspection_runs_session_started_idx
  on public.capture_inspection_runs (capture_session_id, started_at desc);

create index if not exists capture_har_analyses_created_at_idx
  on public.capture_har_analyses (created_at desc);

create index if not exists itgc_audit_log_created_at_ts_idx
  on public.itgc_audit_log (created_at_ts desc);

create index if not exists itgc_audit_log_actor_created_idx
  on public.itgc_audit_log (actor_email, created_at_ts desc);

create index if not exists policy_document_sections_version_idx
  on public.policy_document_sections (document_version_id);

create index if not exists policy_document_sections_created_at_idx
  on public.policy_document_sections (created_at desc);

create index if not exists policy_audit_logs_created_at_idx
  on public.policy_audit_logs (created_at desc);

create index if not exists policy_audit_logs_document_created_idx
  on public.policy_audit_logs (target_document_id, created_at desc);

create index if not exists policy_ai_report_history_created_at_idx
  on public.policy_ai_report_history (created_at desc);

create index if not exists policy_review_execution_history_created_at_idx
  on public.policy_review_execution_history (created_at desc);

create index if not exists policy_document_versions_document_created_idx
  on public.policy_document_versions (document_id, created_at desc);

create index if not exists pms_projects_status_updated_idx
  on public.pms_projects (status, updated_at desc);

create index if not exists pms_projects_due_date_idx
  on public.pms_projects (due_date);

create index if not exists lr_review_requests_status_created_idx
  on public.lr_review_requests (status, created_at desc);

create index if not exists lr_review_logs_request_created_idx
  on public.lr_review_logs (request_id, created_at desc);

create index if not exists lr_review_results_request_created_idx
  on public.lr_review_results (request_id, created_at desc);

create index if not exists inspection_results_target_created_idx
  on public.inspection_results (target_id, created_at desc);

create index if not exists inspection_results_asset_created_idx
  on public.inspection_results (asset_id, created_at desc);

create index if not exists inspection_result_excludes_created_at_idx
  on public.inspection_result_excludes (created_at desc);

create index if not exists asset_audit_logs_created_at_idx
  on public.asset_audit_logs (created_at desc);

create index if not exists license_audit_logs_created_at_idx
  on public.license_audit_logs (created_at desc);

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

create index if not exists security_audit_logs_created_at_idx
  on public.security_audit_logs (created_at desc);

create index if not exists execution_record_status_due_idx
  on public.execution_record (status, due_date);

create index if not exists itgc_control_execution_control_updated_idx
  on public.itgc_control_execution (control_id, updated_at desc);

create index if not exists itgc_workflows_control_updated_idx
  on public.itgc_workflows (control_id, updated_at desc);

create index if not exists resume_visit_logs_visited_at_idx
  on public.resume_visit_logs (visited_at desc);

create or replace view public.capture_http_events_list as
select
  id,
  created_at,
  capture_session_id,
  target_url,
  request_timestamp,
  request_method,
  request_url,
  request_resource_type,
  response_timestamp,
  response_url,
  response_status,
  error_text
from public.capture_http_events;

create or replace view public.capture_inspection_runs_list as
select
  id,
  created_at,
  capture_session_id,
  target_url,
  started_at,
  ended_at,
  total_exchanges,
  total_errors,
  total_findings,
  critical_findings,
  high_findings,
  security_only,
  mask_sensitive
from public.capture_inspection_runs;

create or replace view public.capture_har_analyses_list as
select
  id,
  created_at,
  file_name,
  file_size,
  total_entries,
  average_wait_ms,
  slowest_url
from public.capture_har_analyses;

create or replace view public.itgc_audit_log_list as
select
  log_id,
  action,
  target,
  actor_name,
  actor_email,
  created_at,
  created_at_ts
from public.itgc_audit_log;

create or replace view public.policy_document_sections_list as
select
  id,
  document_version_id,
  parent_section_id,
  hierarchy_type,
  hierarchy_label,
  hierarchy_order,
  path_display,
  created_at,
  chapter_label,
  article_label,
  paragraph_label,
  item_label,
  sub_item_label
from public.policy_document_sections;

create or replace view public.policy_audit_logs_list as
select
  id,
  actor_user_id,
  action,
  target_document_id,
  result,
  created_at
from public.policy_audit_logs;

create or replace view public.resume_visit_logs_list as
select
  id,
  owner_id,
  visited_at,
  mode,
  owner_name,
  user_label
from public.resume_visit_logs;

create or replace view public.policy_document_versions_list as
select
  id,
  document_id,
  version_number,
  parse_warnings,
  created_at,
  effective_date
from public.policy_document_versions;

create or replace view public.pms_projects_list as
select
  id,
  code,
  title,
  service_name,
  service_area,
  requester,
  owner_team,
  priority,
  status,
  due_date,
  created_at,
  updated_at,
  risk,
  progress,
  next_action,
  assignee_role
from public.pms_projects;

create or replace view public.lr_review_requests_list as
select
  id,
  title,
  requester_id,
  requester_name,
  status,
  created_at,
  updated_at,
  request_created_at
from public.lr_review_requests;

create or replace view public.inspection_results_list as
select
  id,
  target_id,
  asset_id,
  item_id,
  asset_code,
  item_code,
  asset_type,
  item_name,
  risk_level,
  result_status,
  evidence_file_path,
  checked_by,
  checked_at,
  created_at,
  updated_at,
  inspection_status,
  action_status,
  reviewed_by
from public.inspection_results;

create or replace function public.prune_high_io_tables()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_capture_http_events bigint := 0;
  deleted_capture_inspection_runs bigint := 0;
  deleted_capture_har_analyses bigint := 0;
  deleted_inspection_results bigint := 0;
  deleted_inspection_result_excludes bigint := 0;
  deleted_itgc_audit_log bigint := 0;
  deleted_asset_audit_logs bigint := 0;
  deleted_license_audit_logs bigint := 0;
  deleted_audit_logs bigint := 0;
  deleted_security_audit_logs bigint := 0;
  deleted_policy_audit_logs bigint := 0;
  deleted_policy_ai_report_history bigint := 0;
  deleted_policy_review_execution_history bigint := 0;
  deleted_lr_review_logs bigint := 0;
  deleted_resume_visit_logs bigint := 0;
  deleted_policy_document_sections bigint := 0;
begin
  delete from public.capture_http_events
  where created_at < now() - interval '14 days';
  get diagnostics deleted_capture_http_events = row_count;

  delete from public.capture_inspection_runs
  where created_at < now() - interval '30 days';
  get diagnostics deleted_capture_inspection_runs = row_count;

  delete from public.capture_har_analyses
  where created_at < now() - interval '30 days';
  get diagnostics deleted_capture_har_analyses = row_count;

  delete from public.inspection_results
  where created_at < now() - interval '180 days';
  get diagnostics deleted_inspection_results = row_count;

  delete from public.inspection_result_excludes
  where created_at < now() - interval '180 days';
  get diagnostics deleted_inspection_result_excludes = row_count;

  delete from public.itgc_audit_log
  where created_at_ts < now() - interval '180 days';
  get diagnostics deleted_itgc_audit_log = row_count;

  delete from public.asset_audit_logs
  where created_at < now() - interval '180 days';
  get diagnostics deleted_asset_audit_logs = row_count;

  delete from public.license_audit_logs
  where created_at < now() - interval '180 days';
  get diagnostics deleted_license_audit_logs = row_count;

  delete from public.audit_logs
  where created_at < now() - interval '180 days';
  get diagnostics deleted_audit_logs = row_count;

  delete from public.security_audit_logs
  where created_at < now() - interval '180 days';
  get diagnostics deleted_security_audit_logs = row_count;

  delete from public.policy_audit_logs
  where created_at < now() - interval '180 days';
  get diagnostics deleted_policy_audit_logs = row_count;

  delete from public.policy_ai_report_history
  where created_at < now() - interval '180 days';
  get diagnostics deleted_policy_ai_report_history = row_count;

  delete from public.policy_review_execution_history
  where created_at < now() - interval '180 days';
  get diagnostics deleted_policy_review_execution_history = row_count;

  delete from public.lr_review_logs
  where created_at < now() - interval '180 days';
  get diagnostics deleted_lr_review_logs = row_count;

  delete from public.resume_visit_logs
  where visited_at < now() - interval '90 days';
  get diagnostics deleted_resume_visit_logs = row_count;

  with ranked_versions as (
    select
      id,
      document_id,
      created_at,
      row_number() over (
        partition by document_id
        order by version_number desc, created_at desc, id desc
      ) as version_rank
    from public.policy_document_versions
  ),
  deletable_versions as (
    select id
    from ranked_versions
    where version_rank > 3
      and created_at < now() - interval '365 days'
  )
  delete from public.policy_document_sections sections
  using deletable_versions versions
  where sections.document_version_id = versions.id;
  get diagnostics deleted_policy_document_sections = row_count;

  return jsonb_build_object(
    'capture_http_events', deleted_capture_http_events,
    'capture_inspection_runs', deleted_capture_inspection_runs,
    'capture_har_analyses', deleted_capture_har_analyses,
    'inspection_results', deleted_inspection_results,
    'inspection_result_excludes', deleted_inspection_result_excludes,
    'itgc_audit_log', deleted_itgc_audit_log,
    'asset_audit_logs', deleted_asset_audit_logs,
    'license_audit_logs', deleted_license_audit_logs,
    'audit_logs', deleted_audit_logs,
    'security_audit_logs', deleted_security_audit_logs,
    'policy_audit_logs', deleted_policy_audit_logs,
    'policy_ai_report_history', deleted_policy_ai_report_history,
    'policy_review_execution_history', deleted_policy_review_execution_history,
    'lr_review_logs', deleted_lr_review_logs,
    'resume_visit_logs', deleted_resume_visit_logs,
    'policy_document_sections', deleted_policy_document_sections
  );
end;
$$;

grant execute on function public.prune_high_io_tables() to service_role;

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

  insert into public.resume_visit_counters (owner_id, count, updated_at)
  values (p_owner_id, 1, now())
  on conflict (owner_id)
  do update set
    count = coalesce(public.resume_visit_counters.count, 0) + 1,
    updated_at = excluded.updated_at
  returning count into new_count;

  return new_count;
end;
$$;

grant execute on function public.record_resume_visit(text, text, text, text, text) to anon, authenticated;
