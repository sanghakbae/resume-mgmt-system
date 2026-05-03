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

function isLocalHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1" || normalized.endsWith(".local");
}
