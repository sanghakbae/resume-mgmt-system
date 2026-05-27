-- Keep lightweight list views usable from PostgREST while preserving RLS behavior
-- from the underlying tables.

alter view public.capture_http_events_list set (security_invoker = true);
alter view public.capture_inspection_runs_list set (security_invoker = true);
alter view public.capture_har_analyses_list set (security_invoker = true);
alter view public.itgc_audit_log_list set (security_invoker = true);
alter view public.policy_document_sections_list set (security_invoker = true);
alter view public.policy_audit_logs_list set (security_invoker = true);
alter view public.resume_visit_logs_list set (security_invoker = true);
alter view public.policy_document_versions_list set (security_invoker = true);
alter view public.pms_projects_list set (security_invoker = true);
alter view public.lr_review_requests_list set (security_invoker = true);
alter view public.inspection_results_list set (security_invoker = true);

grant select on public.capture_http_events_list to anon, authenticated;
grant select on public.capture_inspection_runs_list to anon, authenticated;
grant select on public.capture_har_analyses_list to anon, authenticated;
grant select on public.itgc_audit_log_list to anon, authenticated;
grant select on public.policy_document_sections_list to anon, authenticated;
grant select on public.policy_audit_logs_list to anon, authenticated;
grant select on public.resume_visit_logs_list to anon, authenticated;
grant select on public.policy_document_versions_list to anon, authenticated;
grant select on public.pms_projects_list to anon, authenticated;
grant select on public.lr_review_requests_list to anon, authenticated;
grant select on public.inspection_results_list to anon, authenticated;

grant select on public.data_retention_policies to authenticated;
