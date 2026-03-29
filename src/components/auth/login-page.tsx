import { AlertCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import type { GoogleCredentialResponse } from "@/types/google";

type LoginPageProps = {
  clientId?: string;
  isReady: boolean;
  error: string | null;
  onLogin: (response: GoogleCredentialResponse) => void;
};

export function LoginPage({ clientId, isReady, error, onLogin }: LoginPageProps) {
  const configError = clientId ? null : "`.env`에 `VITE_GOOGLE_CLIENT_ID`를 설정해야 Google 로그인을 사용할 수 있습니다.";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_42%,#e2e8f0_100%)] px-4 py-6 sm:px-5 md:px-6 md:py-10">
      <div className="grid min-h-[calc(100vh-3rem)] w-full items-center gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-900 shadow-sm backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            Google OAuth 기반 개인 이력서 접근 제어
          </div>
          <div className="space-y-3">
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
              로그인한 사용자만 자신의 이력서에 접근하도록 분리했습니다.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
              Google 계정으로 로그인하면 사용자 식별자 기준으로 이력서 데이터가 분리 저장됩니다. 다른 계정으로 로그인하면 별도의 이력서 작업 공간이 열립니다.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-slate-900">개인별 분리</p>
              <p className="mt-2 text-[13px] leading-5 text-slate-600">Google `sub` 값을 기준으로 이력서 데이터를 사용자별로 구분해 저장합니다.</p>
            </div>
            <div className="rounded-[20px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-slate-900">즉시 편집</p>
              <p className="mt-2 text-[13px] leading-5 text-slate-600">로그인 후 바로 프로필과 수행 업무를 수정하고 공개 보기로 전환할 수 있습니다.</p>
            </div>
            <div className="rounded-[20px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold text-slate-900">간단한 운영</p>
              <p className="mt-2 text-[13px] leading-5 text-slate-600">현재 구현은 프론트엔드 단독 구조이며, 서버 연동 전 단계 데모에 적합합니다.</p>
            </div>
          </div>
        </section>

        <section className="w-full rounded-[28px] border border-white/80 bg-white/85 p-5 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur sm:p-6 md:p-8">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[18px] bg-slate-950 text-white">
            <LockKeyhole className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-semibold tracking-tight text-slate-950">로그인</h2>
          <p className="mt-2 text-[13px] leading-5 text-slate-600">
            Google 계정으로 로그인하면 본인 이력서 데이터만 불러옵니다. 첫 로그인 시 기본 샘플 이력서가 개인 작업 공간에 복사됩니다.
          </p>

          {(error || configError) && (
            <div className="mt-5 flex gap-3 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error ?? configError}</p>
            </div>
          )}

          <div className="mt-8 flex min-h-[44px] w-full items-center">
            {clientId ? <GoogleSignInButton clientId={clientId} disabled={!isReady} onSuccess={onLogin} /> : null}
            {!isReady && clientId ? <p className="text-sm text-slate-500">Google 로그인 버튼을 불러오는 중입니다.</p> : null}
          </div>

          <div className="mt-8 rounded-[18px] bg-slate-950 px-5 py-4 text-sm text-slate-200">
            서버 없이도 동작하도록 세션과 이력서를 브라우저에 저장합니다. 실제 운영 환경에서는 백엔드에서 Google ID 토큰 검증과 사용자 권한 검사를 추가해야 합니다.
          </div>
        </section>
      </div>
    </div>
  );
}
