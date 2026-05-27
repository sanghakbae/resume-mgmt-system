import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type VisitCounterRow = {
  owner_id: string;
  count: number | null;
};

export function shouldCountPublicVisit(isPublicResumeMode: boolean, isLoggedIn: boolean) {
  if (!isPublicResumeMode || isLoggedIn || typeof window === "undefined") return false;
  return !isLocalHost(window.location.hostname);
}

export async function getPublicVisitCount(ownerId: string) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from("resume_visit_counters")
    .select("owner_id, count")
    .eq("owner_id", ownerId)
    .maybeSingle<VisitCounterRow>();

  if (error) {
    throw error;
  }

  return data?.count ?? 0;
}

export async function incrementPublicVisitCount(ownerId: string) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.rpc("increment_resume_visit_count", {
    p_owner_id: ownerId,
  });

  if (error) {
    throw error;
  }

  return typeof data === "number" ? data : Number(data ?? 0);
}

type VisitLogRow = {
  id: string;
  visited_at: string;
  mode: string;
  owner_name: string;
  user_label: string;
};

export async function recordPublicVisitLog(input: {
  ownerId: string;
  mode: string;
  ownerName: string;
  userLabel: string;
  userEmail?: string;
}) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.rpc("record_resume_visit", {
    p_owner_id: input.ownerId,
    p_mode: input.mode,
    p_owner_name: input.ownerName,
    p_user_label: input.userLabel,
    p_user_email: input.userEmail ?? "",
  });

  if (error) throw error;
  return typeof data === "number" ? data : Number(data ?? 0);
}

export async function recordPublicDownloadLog(input: {
  ownerId: string;
  ownerName: string;
  userLabel: string;
  userEmail?: string;
}) {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase.rpc("record_resume_download", {
    p_owner_id: input.ownerId,
    p_owner_name: input.ownerName,
    p_user_label: input.userLabel,
    p_user_email: input.userEmail ?? "",
  });

  if (error) throw error;
  return typeof data === "string" ? data : null;
}

export async function fetchPublicVisitLogs(ownerId: string, limit = 50) {
  if (!isSupabaseConfigured || !supabase) return [];

  const { data, error } = await supabase
    .from("resume_visit_logs")
    .select("id, visited_at, mode, owner_name, user_label")
    .eq("owner_id", ownerId)
    .order("visited_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []).map((row: VisitLogRow) => ({
    id: row.id,
    visitedAt: row.visited_at,
    mode: row.mode,
    ownerName: row.owner_name,
    userLabel: row.user_label,
    userEmail: "",
  }));
}

function isLocalHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1" || normalized.endsWith(".local");
}
