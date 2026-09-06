"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const PLATFORM_ORIGIN = "https://platform.sdjgh-ai.kr";
let ssoToken: string | null = null;
export function getSsoToken() { return ssoToken; }

type Status = "pending" | "signing-in" | "done" | "skipped" | "expired" | "timeout";

export default function SsoGuard({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("pending");
  const router = useRouter();

  useEffect(() => {
    // Direct visits (including other schools) never depend on the platform.
    if (window.self === window.top) { setStatus("skipped"); return; }
    let active = true;
    let accepted = false;
    let finished = false;
    let deadline: ReturnType<typeof setTimeout>;
    ssoToken = null;

    function finishFailure(next: "expired" | "timeout") {
      if (!active || finished) return;
      finished = true;
      clearTimeout(deadline);
      setStatus(next);
      if (next === "expired") window.parent.postMessage({ type: "sso:expired" }, PLATFORM_ORIGIN);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== PLATFORM_ORIGIN || event.source !== window.parent || accepted || finished) return;
      const data = event.data;
      if (data?.type !== "sso:token" || typeof data.token !== "string" || !data.token) return;
      accepted = true;
      clearTimeout(deadline);
      setStatus("signing-in");
      deadline = setTimeout(() => finishFailure("timeout"), 20000);
      // The credentials provider validates this token on the server before issuing a session.
      void signIn("sso", { ssoToken: data.token, redirect: false })
        .then((result) => {
          if (!active || finished) return;
          if (!result?.ok || result.error) { finishFailure("expired"); return; }
          finished = true;
          clearTimeout(deadline);
          ssoToken = data.token;
          // Refresh also replaces stale server props if the iframe opened on /learn.
          if (window.location.pathname === "/learn") router.refresh();
          else router.replace("/learn");
          setStatus("done");
        })
        .catch(() => finishFailure("timeout"));
    }

    deadline = setTimeout(() => finishFailure("timeout"), 8000);
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "sso:ready" }, PLATFORM_ORIGIN);
    return () => { active = false; clearTimeout(deadline); window.removeEventListener("message", onMessage); };
  }, [router]);

  if (status === "pending" || status === "signing-in") {
    return <div style={overlayStyle} role="status">{status === "pending" ? "스마트캠퍼스 연결 확인 중..." : "로그인 확인 중..."}</div>;
  }
  if (status === "expired" || status === "timeout") {
    return <div style={overlayStyle} role="alert">
      <p>{status === "expired" ? "세션이 만료됐어요. 스마트캠퍼스에서 다시 접속해 주세요." : "스마트캠퍼스 연결이 지연되고 있어요. 다시 시도해 주세요."}</p>
      <button type="button" onClick={() => window.location.reload()}>다시 연결</button>
    </div>;
  }
  return <>{children}</>;
}

const overlayStyle: React.CSSProperties = {
  position: "fixed", inset: 0, display: "flex", flexDirection: "column",
  gap: 16, alignItems: "center", justifyContent: "center", background: "#fff",
  fontSize: "1rem", color: "#333", zIndex: 9999,
};
