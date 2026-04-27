import { useEffect, useRef } from "react";
import type { GoogleCredentialResponse, GoogleWindow } from "@/types/google";

type GoogleSignInButtonProps = {
  clientId: string;
  disabled?: boolean;
  compact?: boolean;
  onSuccess: (response: GoogleCredentialResponse, nonce?: string) => void | Promise<void>;
};

export function GoogleSignInButton({ clientId, disabled, compact = false, onSuccess }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const googleRef = useRef<GoogleWindow["google"] | null>(null);
  const nonceRef = useRef<string>(createAuthNonce());

  useEffect(() => {
    if (disabled || (compact ? false : !buttonRef.current)) return;

    let cancelled = false;
    const googleWindow = window as GoogleWindow;
    const google = googleWindow.google;
    if (!google) return;
    googleRef.current = google;

    const initializeGoogleButton = async () => {
      const hashedNonce = await sha256(nonceRef.current);
      if (cancelled) return;

      if (buttonRef.current) {
        buttonRef.current.innerHTML = "";
      }
      const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
      const buttonWidth = buttonRef.current ? Math.min(Math.max(buttonRef.current.clientWidth, 160), 360) : 160;

      google.accounts.id.disableAutoSelect();
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => onSuccess(response, nonceRef.current),
        auto_select: false,
        nonce: hashedNonce,
        ux_mode: "popup",
      });

      if (compact) return;

      google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: isMobileViewport ? "small" : "medium",
        text: isMobileViewport ? "signin" : "signin_with",
        shape: isMobileViewport ? "rectangular" : "pill",
        width: buttonWidth,
      });
    };

    void initializeGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [clientId, compact, disabled, onSuccess]);

  if (compact) {
    return (
      <button
        type="button"
        className={`google-sign-in-button flex h-7 w-full items-center justify-center gap-1 rounded-[6px] border border-slate-200 bg-white px-2 text-[12px] font-medium leading-4 text-slate-600 ${disabled ? "pointer-events-none opacity-60" : ""}`}
        onClick={() => googleRef.current?.accounts.id.prompt()}
      >
        <span className="font-semibold text-blue-600">G</span>
        로그인
      </button>
    );
  }

  return <div ref={buttonRef} className={`google-sign-in-button h-7 w-full ${disabled ? "pointer-events-none opacity-60" : ""}`} />;
}

function createAuthNonce() {
  const bytes = new Uint8Array(16);
  window.crypto?.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
