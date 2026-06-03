import { useCallback, useEffect, useMemo, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { normalizeGoogleUser } from "@/lib/google-auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase";
import type { GoogleUser } from "@/types/resume";

const SESSION_STORAGE_KEY = "resume.auth.session";

function readStoredSession(allowedEmails: string[]): GoogleUser | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = normalizeGoogleUser(JSON.parse(raw) as GoogleUser);
    if (allowedEmails.length > 0 && !allowedEmails.includes(parsed.email.toLowerCase())) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function useGoogleAuth(options?: { allowedEmails?: string[]; deniedMessage?: string; enabled?: boolean }) {
  const allowedEmailSignature = options?.allowedEmails?.join("\n") ?? "";
  const allowedEmails = useMemo(
    () => allowedEmailSignature.split("\n").map((value) => value.toLowerCase()).filter(Boolean),
    [allowedEmailSignature],
  );
  const deniedMessage = options?.deniedMessage ?? "관리자 계정만 로그인 가능합니다.";
  const enabled = options?.enabled ?? true;
  const [user, setUser] = useState<GoogleUser | null>(() => readStoredSession(allowedEmails));
  // Popup sign-in has no external script to load, so it is ready as soon as Firebase is configured.
  const isReady = !enabled || isFirebaseConfigured;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (allowedEmails.length === 0 || !user) return;
    if (allowedEmails.includes(user.email.toLowerCase())) return;

    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
  }, [allowedEmails, user]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }

    const firebaseAuth = auth;
    const unsubscribe = onAuthStateChanged(firebaseAuth, (sessionUser) => {
      if (!sessionUser?.email) {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setUser(null);
        return;
      }

      const email = sessionUser.email.toLowerCase();
      if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
        // A non-editor signed in: drop the Firebase session so it can't be reused.
        void firebaseSignOut(firebaseAuth).catch(() => undefined);
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setUser(null);
        setError(deniedMessage);
        return;
      }

      const nextUser = normalizeGoogleUser({
        sub: sessionUser.uid,
        email: sessionUser.email,
        name: sessionUser.displayName ?? sessionUser.email,
        picture: sessionUser.photoURL ?? undefined,
      });
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [allowedEmails, deniedMessage]);

  const signIn = useCallback(async () => {
    if (!isFirebaseConfigured || !auth) {
      setError("Firebase 로그인 설정이 연결되지 않았습니다.");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);

      const email = result.user.email?.toLowerCase() ?? "";
      if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
        await firebaseSignOut(auth).catch(() => undefined);
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setUser(null);
        setError(deniedMessage);
        return;
      }

      setError(null);
      // onAuthStateChanged populates the user state.
    } catch (signInError) {
      const code = (signInError as { code?: string })?.code ?? "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        return; // User dismissed the popup; not a real error.
      }
      const message = signInError instanceof Error ? signInError.message : String(signInError);
      setError(`Firebase 인증에 실패했습니다: ${message}`);
    }
  }, [allowedEmails, deniedMessage]);

  const signOut = useCallback(async () => {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);

    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
  }, []);

  return {
    user,
    isReady,
    error,
    signIn,
    signOut,
  };
}
