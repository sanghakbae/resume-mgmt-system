import { useEffect, useState } from "react";
import { normalizeGoogleUser, parseGoogleCredential } from "@/lib/google-auth";
import type { GoogleCredentialResponse, GoogleWindow } from "@/types/google";
import type { GoogleUser } from "@/types/resume";

const SESSION_STORAGE_KEY = "resume.auth.session";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function readStoredSession(): GoogleUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = normalizeGoogleUser(JSON.parse(raw) as GoogleUser);
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch {
    return null;
  }
}

function injectGoogleScript() {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_SRC}"]`);

    if (existingScript) {
      if ((window as GoogleWindow).google) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google script")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });
}

export function useGoogleAuth() {
  const [user, setUser] = useState<GoogleUser | null>(() => readStoredSession());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    injectGoogleScript()
      .then(() => {
        if (!mounted) return;
        setIsReady(true);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Google 로그인 스크립트를 불러오지 못했습니다.");
      });

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = (response: GoogleCredentialResponse) => {
    try {
      const nextUser = parseGoogleCredential(response.credential);
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setError(null);
    } catch {
      setError("Google 로그인 정보를 처리하지 못했습니다.");
    }
  };

  const signOut = () => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);

    const googleWindow = window as GoogleWindow;
    googleWindow.google?.accounts.id.disableAutoSelect();
  };

  return {
    user,
    isReady,
    error,
    signIn,
    signOut,
  };
}
