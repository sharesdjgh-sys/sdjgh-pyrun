"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PasswordRecoveryModal from "@/components/account/PasswordRecoveryModal";

export default function LoginPage() {
  const router = useRouter();
  const [schoolCode, setSchoolCode] = useState("서대전여고");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("schoolCode");
    if (code) setSchoolCode(code);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { schoolCode, username, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("학번 또는 비밀번호가 올바르지 않습니다.");
    } else {
      router.push("/learn");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(20px, 4vw, 48px)",
        position: "relative",
        overflowX: "hidden",
        background: "linear-gradient(160deg,#D7CDEA 0%,#CEC4E3 24%,#BEADDC 55%,#AE9ED6 76%,#9E8BCC 100%)",
      }}
    >
      {/* Blobs */}
      <div style={{ position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%,#C9B6FF,#A78BFA00)", filter: "blur(8px)", animation: "blobFloat 9s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: -90, right: -50, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle at 60% 40%,#FFC2DA,#FF8FB800)", filter: "blur(8px)", animation: "blobFloat 11s ease-in-out infinite reverse" }} />

      <div className="relative grid w-full max-w-[860px] items-center gap-5 md:grid-cols-[minmax(180px,280px)_minmax(0,400px)] md:justify-center md:gap-8 lg:gap-12">
        {/* Logo area */}
        <div className="flex min-w-0 flex-col items-center text-center">
          <video
            src="/pyrun_studio_login.mp4?v=3"
            aria-label="PyRun Studio animated logo"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className="pointer-events-none h-auto w-[150px] object-contain sm:w-[180px] md:w-[280px]"
            style={{
              WebkitMaskImage: "linear-gradient(to right,transparent 0%,#000 10%,#000 90%,transparent 100%),linear-gradient(to bottom,transparent 0%,#000 7%,#000 93%,transparent 100%)",
              WebkitMaskComposite: "source-in",
              maskImage: "linear-gradient(to right,transparent 0%,#000 10%,#000 90%,transparent 100%),linear-gradient(to bottom,transparent 0%,#000 7%,#000 93%,transparent 100%)",
              maskComposite: "intersect",
            }}
          />
          <div style={{ maxWidth: 260, fontSize: 13.5, color: "#51436F", fontWeight: 600, marginTop: 6, lineHeight: 1.55, textShadow: "0 1px 0 rgba(255,255,255,.28)" }}>
            코딩하면 캐릭터가 반응하는 실습형 파이썬
          </div>
        </div>

        {/* Card */}
        <div
          className="w-full max-w-[400px]"
          style={{
            padding: "80px 4px 0",
          }}
        >
          <h1 className="sr-only">로그인</h1>

          {error && (
            <div style={{ background: "#FFF0F4", border: "1px solid #FFD0DC", borderRadius: 12, padding: "11px 14px", marginBottom: 16, fontSize: 13.5, color: "#E23E70" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", fontSize: 13, color: "#574875", fontWeight: 700, marginBottom: 7 }}>학교명</label>
            <input
              type="text"
              value={schoolCode}
              onChange={(e) => setSchoolCode(e.target.value)}
              style={{ width: "100%", padding: "12px 15px", border: "2px solid rgba(126,101,181,.18)", borderRadius: 14, background: "rgba(255,255,255,.68)", fontSize: 15, color: "#2C2747", fontFamily: "inherit", outline: "none", marginBottom: 12, boxShadow: "inset 0 1px 2px rgba(83,61,130,.05)" }}
              placeholder="예: 서대전여고"
              autoComplete="organization"
              required
            />

            <label style={{ display: "block", fontSize: 13, color: "#574875", fontWeight: 700, marginBottom: 7 }}>학번</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "12px 15px", border: "2px solid rgba(126,101,181,.18)", borderRadius: 14, background: "rgba(255,255,255,.68)", fontSize: 15, color: "#2C2747", fontFamily: "inherit", outline: "none", marginBottom: 12, boxShadow: "inset 0 1px 2px rgba(83,61,130,.05)" }}
              onFocus={(e) => { e.target.style.borderColor = "#7B5CF0"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(126,101,181,.18)"; e.target.style.background = "rgba(255,255,255,.68)"; }}
              placeholder="학번을 입력하세요"
              required
            />

            <label style={{ display: "block", fontSize: 13, color: "#574875", fontWeight: 700, marginBottom: 7 }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px 15px", border: "2px solid rgba(126,101,181,.18)", borderRadius: 14, background: "rgba(255,255,255,.68)", fontSize: 15, color: "#2C2747", fontFamily: "inherit", outline: "none", marginBottom: 8, boxShadow: "inset 0 1px 2px rgba(83,61,130,.05)" }}
              onFocus={(e) => { e.target.style.borderColor = "#7B5CF0"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(126,101,181,.18)"; e.target.style.background = "rgba(255,255,255,.68)"; }}
              placeholder="비밀번호를 입력하세요"
              required
            />

            <div style={{ textAlign: "right", marginBottom: 14 }}>
              <button type="button" onClick={() => setRecoveryOpen(true)} style={{ padding: 0, border: 0, background: "transparent", color: "#7B5CF0", fontFamily: "inherit", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>비밀번호를 잊었나요?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: 14, border: "none", borderRadius: 16,
                background: loading ? "#9A86D8" : "linear-gradient(180deg,#8168D8,#6C50C5)",
                color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 17,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 0 #52399F,0 12px 24px rgba(82,57,159,.28)",
                transition: "transform .12s, box-shadow .12s",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #52399F"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 0 #52399F,0 12px 24px rgba(82,57,159,.28)"; }}
            >
              {loading ? (
                <span style={{ width: 18, height: 18, border: "2.5px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" stroke="none"><path d="M7 4l13 8-13 8z" /></svg>
              )}
              학습 시작하기
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 14, fontSize: 14, color: "#5D507A", fontWeight: 500 }}>
            아직 계정이 없나요?{" "}
            <Link href="/register" style={{ color: "#7B5CF0", fontWeight: 700, textDecoration: "none" }}>회원가입</Link>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
            <Image
              src="/lifeprofessor-logo.png"
              alt="인생교수의 AI 연구소"
              width={403}
              height={61}
              style={{ width: 160, height: "auto", opacity: 0.76 }}
            />
          </div>
        </div>
      </div>
      <PasswordRecoveryModal open={recoveryOpen} initialSchoolCode={schoolCode} initialUsername={username} onClose={() => setRecoveryOpen(false)} />
    </div>
  );
}
