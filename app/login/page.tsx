"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (result?.error) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
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
        padding: 32,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)",
      }}
    >
      {/* Blobs */}
      <div style={{ position: "absolute", top: -80, left: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%,#C9B6FF,#A78BFA00)", filter: "blur(8px)", animation: "blobFloat 9s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: -90, right: -50, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle at 60% 40%,#FFC2DA,#FF8FB800)", filter: "blur(8px)", animation: "blobFloat 11s ease-in-out infinite reverse" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
        {/* Logo area */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 22 }}>
          <Image
            src="/pyrun_studio-1대1-logo.png"
            alt="PyRun Studio"
            width={160}
            height={160}
            style={{ objectFit: "contain" }}
            priority
          />
          <div style={{ fontSize: 13.5, color: "#8B83A8", marginTop: 6 }}>
            코딩하면 캐릭터가 반응하는 실습형 파이썬
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", borderRadius: 28, padding: "30px 28px", boxShadow: "0 18px 50px rgba(90,63,214,.14)", border: "1px solid #F1ECFA" }}>
          <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 21, marginBottom: 20, color: "#2C2747" }}>로그인</div>

          {error && (
            <div style={{ background: "#FFF0F4", border: "1px solid #FFD0DC", borderRadius: 12, padding: "11px 14px", marginBottom: 16, fontSize: 13.5, color: "#E23E70" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", fontSize: 13, color: "#8B83A8", fontWeight: 600, marginBottom: 7 }}>아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", border: "2px solid #ECE7F8", borderRadius: 14, background: "#FBFAFF", fontSize: 15, color: "#2C2747", fontFamily: "inherit", outline: "none", marginBottom: 16 }}
              onFocus={(e) => { e.target.style.borderColor = "#7B5CF0"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#ECE7F8"; e.target.style.background = "#FBFAFF"; }}
              placeholder="아이디를 입력하세요"
              required
            />

            <label style={{ display: "block", fontSize: 13, color: "#8B83A8", fontWeight: 600, marginBottom: 7 }}>비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "14px 16px", border: "2px solid #ECE7F8", borderRadius: 14, background: "#FBFAFF", fontSize: 15, color: "#2C2747", fontFamily: "inherit", outline: "none", marginBottom: 24 }}
              onFocus={(e) => { e.target.style.borderColor = "#7B5CF0"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#ECE7F8"; e.target.style.background = "#FBFAFF"; }}
              placeholder="비밀번호를 입력하세요"
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: 15, border: "none", borderRadius: 16,
                background: loading ? "#A78BFA" : "linear-gradient(180deg,#8B6CFF,#7B5CF0)",
                color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 17,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 0 #5B3FD6,0 12px 22px rgba(123,92,240,.34)",
                transition: "transform .12s, box-shadow .12s",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #5B3FD6"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 0 #5B3FD6,0 12px 22px rgba(123,92,240,.34)"; }}
            >
              {loading ? (
                <span style={{ width: 18, height: 18, border: "2.5px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" stroke="none"><path d="M7 4l13 8-13 8z" /></svg>
              )}
              학습 시작하기
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "#8B83A8" }}>
            아직 계정이 없나요?{" "}
            <Link href="/register" style={{ color: "#7B5CF0", fontWeight: 700, textDecoration: "none" }}>회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
