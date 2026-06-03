import { initializeApp, type FirebaseApp } from "firebase/app";
import { browserSessionPersistence, getAuth, setPersistence, type Auth } from "firebase/auth";
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore";

const enableFirebase = ((import.meta.env.VITE_ENABLE_FIREBASE as string | undefined) ?? "false") === "true";
const apiKey = (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined)?.trim();
const authDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined)?.trim();
const projectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined)?.trim();
const appId = (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined)?.trim();
const storageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined)?.trim();
const messagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined)?.trim();

const defaultAssetApiBaseUrl = "https://resume-assets.totoriverce.workers.dev";
const assetApiBaseUrl = ((import.meta.env.VITE_ASSET_API_BASE_URL as string | undefined) ?? defaultAssetApiBaseUrl).trim().replace(/\/+$/, "");

export const isFirebaseConfigured = Boolean(enableFirebase && apiKey && projectId && appId);
export const isAssetUploadConfigured = Boolean(assetApiBaseUrl || isFirebaseConfigured);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

if (isFirebaseConfigured) {
  app = initializeApp({
    apiKey: apiKey!,
    authDomain,
    projectId: projectId!,
    appId: appId!,
    storageBucket,
    messagingSenderId,
  });
  authInstance = getAuth(app);
  // Mirror the old JSON/Supabase behaviour: drop undefined fields instead of
  // throwing, since resume items carry optional fields (image, url, etc.).
  try {
    firestoreInstance = initializeFirestore(app, { ignoreUndefinedProperties: true });
  } catch {
    // Already initialized (e.g. during dev HMR) — reuse the existing instance.
    firestoreInstance = getFirestore(app);
  }

  // Keep the auth session scoped to the browser tab via sessionStorage.
  void setPersistence(authInstance, browserSessionPersistence).catch(() => undefined);
}

export const auth = authInstance;
export const db = firestoreInstance;

export async function uploadResumeAsset(file: File, ownerId: string, kind: "profile" | "experience") {
  if (!assetApiBaseUrl) {
    throw new Error("Asset upload storage is not configured");
  }

  const idToken = auth?.currentUser ? await auth.currentUser.getIdToken().catch(() => null) : null;

  const formData = new FormData();
  formData.set("file", file);
  formData.set("ownerId", ownerId);
  formData.set("kind", kind);

  const response = await fetch(`${assetApiBaseUrl}/api/assets/upload`, {
    method: "POST",
    headers: idToken
      ? {
          Authorization: `Bearer ${idToken}`,
        }
      : undefined,
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as { publicUrl?: string; error?: string } | null;

  if (!response.ok || !payload?.publicUrl) {
    throw new Error(payload?.error || "Cloudflare R2 업로드에 실패했습니다.");
  }

  return payload.publicUrl;
}
