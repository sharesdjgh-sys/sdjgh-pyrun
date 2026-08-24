"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const PLATFORM_ORIGIN = "https://platform.sdjgh-ai.kr";
const VERIFY_URL = `${PLATFORM_ORIGIN}/api/auth/verify`;

let ssoToken: string | null = null;

export function getSsoToken() {
  return ssoToken;
}

// pyrun keeps its own login for direct (non-embedded) access — SSO only
// auto-signs-in users arriving through the platform iframe, it never blocks
// direct access the way the fully-open prompt-series apps do.
type Status = "skipped" | "pending" | "signing-in" | "done" | "expired";

export default function SsoGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("pending");
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      setStatus("skipped");
      return;
    }

    const embedded = window.self !== window.top;
    if (!embedded) {
      setStatus("skipped");
      return;
    }

    // `settled` only dedupes which single token attempt "owns" the flow (so a
    // duplicate sso:token message, or the 8s deadline firing after we've
    // already committed to an attempt, can't step on it). It must NOT also
    // gate whether a failure *within* that attempt gets reported — that was
    // the bug: once verify succeeded, `settled` flipped true before signIn()
    // even ran, so when signIn() itself rejected, fail()'s own `if (settled)
    // return` swallowed it silently and the screen was stuck on "연결 확인
    // 중..." forever instead of showing the expired message.
    let settled = false;

    function fail() {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      setStatus("expired");
      window.parent.postMessage({ type: "sso:expired" }, PLATFORM_ORIGIN);
    }

    // Unlike fail(), this always reports — it only ever runs after we've
    // already committed to one token attempt, so there's nothing left to dedupe.
    function reportFailure() {
      setStatus("expired");
      window.parent.postMessage({ type: "sso:expired" }, PLATFORM_ORIGIN);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== PLATFORM_ORIGIN || event.source !== window.parent) return;
      const data = event.data as { type?: string; token?: string };
      if (data?.type !== "sso:token" || !data.token) return;
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: data.token }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((result: { valid?: boolean }) => {
          if (!result?.valid) return Promise.reject(new Error("token invalid"));
          ssoToken = data.token as string;
          setStatus("signing-in");
          return signIn("sso", { ssoToken: data.token, redirect: false });
        })
        .then((signInResult) => {
          if (!signInResult || signInResult.error) throw new Error("sso sign-in failed");
          setStatus("done");
          // The registered iframe entry point is /login, which has no
          // session-awareness of its own (unlike the root page.tsx) — without
          // this, a successful SSO sign-in just leaves the login form on
          // screen forever, looking like SSO did nothing.
          router.replace("/learn");
        })
        .catch(reportFailure);
    }

    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "sso:ready" }, PLATFORM_ORIGIN);

    const timeout = setTimeout(fail, 8000);

    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timeout);
    };
  }, [router]);

  if (status === "pending" || status === "signing-in") {
    return <div style={overlayStyle}>연결 확인 중...</div>;
  }
  if (status === "expired") {
    return <div style={overlayStyle}>세션이 만료됐어요. 스마트 캠퍼스에서 다시 접속해 주세요.</div>;
  }
  return <>{children}</>;
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff",
  fontSize: "1rem",
  color: "#333",
  zIndex: 9999,
};
