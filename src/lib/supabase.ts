import { createClient } from "@supabase/supabase-js";

const enableSupabase = ((import.meta.env.VITE_ENABLE_SUPABASE as string | undefined) ?? "false") === "true";
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const defaultAssetApiBaseUrl = "https://resume-assets.totoriverce.workers.dev";
const assetApiBaseUrl = ((import.meta.env.VITE_ASSET_API_BASE_URL as string | undefined) ?? defaultAssetApiBaseUrl).trim().replace(/\/+$/, "");

export const isSupabaseConfigured = Boolean(enableSupabase && supabaseUrl && supabaseAnonKey);
export const isAssetUploadConfigured = Boolean(assetApiBaseUrl || isSupabaseConfigured);

const sessionStorageAdapter = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(key);
  },
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        storage: sessionStorageAdapter,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export async function uploadResumeAsset(file: File, ownerId: string, kind: "profile" | "experience") {
  if (assetApiBaseUrl) {
    const { data: sessionData } = supabase ? await supabase.auth.getSession() : { data: { session: null } };
    const formData = new FormData();
    formData.set("file", file);
    formData.set("ownerId", ownerId);
    formData.set("kind", kind);

    const response = await fetch(`${assetApiBaseUrl}/api/assets/upload`, {
      method: "POST",
      headers: sessionData.session?.access_token
        ? {
            Authorization: `Bearer ${sessionData.session.access_token}`,
          }
        : undefined,
      body: formData,
    });

    const payload = await response.json().catch(() => null) as { publicUrl?: string; error?: string } | null;

    if (!response.ok || !payload?.publicUrl) {
      throw new Error(payload?.error || "Cloudflare R2 업로드에 실패했습니다.");
    }

    return payload.publicUrl;
  }

  if (!supabase) {
    throw new Error("Asset upload storage is not configured");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const fileName = `${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const filePath = `${ownerId}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from("resume-assets").upload(filePath, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from("resume-assets").getPublicUrl(filePath);
  return data.publicUrl;
}
