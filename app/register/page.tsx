"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ schoolCode: "", username: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "오류가 발생했습니다.");
    } else {
      router.push("/login");
    }
  }

  const inputStyle = {
    width: "100%", padding: "14px 16px", border: "2px solid #ECE7F8", borderRadius: 14,
    background: "#FBFAFF", fontSize: 15, color: "#2C2747", fontFamily: "inherit",
    outline: "none", marginBottom: 16,
  };

  return (
    <div
      style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        padding: 32, position: "relative", overflow: "hidden",
        background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)",
      }}
    >
      <div style={{ position: "absolute", top: -70, right: -50, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%,#B8FFE4,#18C99A00)", filter: "blur(8px)", animation: "blobFloat 10s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: -80, left: -60, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%,#C9B6FF,#A78BFA00)", filter: "blur(8px)", animation: "blobFloat 12s ease-in-out infinite reverse" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 24, color: "#2C2747" }}>반가워요! 함께 시작해요</div>
          <div style={{ fontSize: 13.5, color: "#8B83A8", marginTop: 4 }}>간단한 정보만 입력하면 끝나요</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 28, padding: "30px 28px", boxShadow: "0 18px 50px rgba(90,63,214,.14)", border: "1px solid #F1ECFA" }}>
          <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 21, marginBottom: 20, color: "#2C2747" }}>회원가입</div>

          {error && (
            <div style={{ background: "#FFF0F4", border: "1px solid #FFD0DC", borderRadius: 12, padding: "11px 14px", marginBottom: 16, fontSize: 13.5, color: "#E23E70" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", fontSize: 13, color: "#8B83A8", fontWeight: 600, marginBottom: 7 }}>학교명</label>
            <input
              type="text"
              value={form.schoolCode}
              onChange={(e) => setForm({ ...form, schoolCode: e.target.value })}
              style={inputStyle}
              placeholder="예: 서대전여고"
              required
            />

            <label style={{ display: "block", fontSize: 13, color: "#8B83A8", fontWeight: 600, marginBottom: 7 }}>
              닉네임 <span style={{ color: "#BDB6D4", fontWeight: 500 }}>(선택)</span>
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#7B5CF0"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#ECE7F8"; e.target.style.background = "#FBFAFF"; }}
              placeholder="코딩하는 지민"
            />

            <label style={{ display: "block", fontSize: 13, color: "#8B83A8", fontWeight: 600, marginBottom: 7 }}>아이디</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#7B5CF0"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#ECE7F8"; e.target.style.background = "#FBFAFF"; }}
              placeholder="영문/숫자 4자 이상"
              required
            />

            <label style={{ display: "block", fontSize: 13, color: "#8B83A8", fontWeight: 600, marginBottom: 7 }}>비밀번호</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ ...inputStyle, marginBottom: 24 }}
              onFocus={(e) => { e.target.style.borderColor = "#7B5CF0"; e.target.style.background = "#fff"; }}
              onBlur={(e) => { e.target.style.borderColor = "#ECE7F8"; e.target.style.background = "#FBFAFF"; }}
              placeholder="8자 이상"
              minLength={8}
              required
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                padding: 15, border: "none", borderRadius: 16,
                background: loading ? "#5ED4AA" : "linear-gradient(180deg,#34D9A6,#18C99A)",
                color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 17,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 6px 0 #0FA37C,0 12px 22px rgba(24,201,154,.32)",
                transition: "transform .12s, box-shadow .12s",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(4px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #0FA37C"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 0 #0FA37C,0 12px 22px rgba(24,201,154,.32)"; }}
            >
              {loading ? (
                <span style={{ width: 18, height: 18, border: "2.5px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
              ) : null}
              가입하고 시작하기
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "#8B83A8" }}>
            이미 계정이 있나요?{" "}
            <Link href="/login" style={{ color: "#7B5CF0", fontWeight: 700, textDecoration: "none" }}>로그인</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
