"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterSchoolPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    schoolName: "",
    schoolCode: "",
    displayName: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/auth/register-school", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "학교를 등록하지 못했습니다.");
      return;
    }
    router.push(`/login?schoolCode=${encodeURIComponent(form.schoolCode.trim().toLowerCase())}`);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    marginBottom: 14,
    border: "2px solid #ECE7F8",
    borderRadius: 12,
    background: "#FBFAFF",
    fontFamily: "inherit",
    fontSize: 14,
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 28, background: "linear-gradient(160deg,#F4EFFC,#FCEFF6 52%,#EEF3FE)" }}>
      <section style={{ width: "100%", maxWidth: 460, padding: "30px 28px", borderRadius: 24, background: "#fff", boxShadow: "0 18px 50px rgba(90,63,214,.14)" }}>
        <h1 style={{ margin: "0 0 6px", color: "#2C2747", fontSize: 23 }}>새 학교 시작하기</h1>
        <p style={{ margin: "0 0 22px", color: "#8B83A8", fontSize: 13.5 }}>
          학교와 첫 관리자 계정, 기본 커리큘럼을 한 번에 만듭니다.
        </p>
        {error && <div style={{ marginBottom: 16, padding: 11, borderRadius: 10, background: "#FFF0F4", color: "#E23E70", fontSize: 13 }}>{error}</div>}
        <form onSubmit={submit}>
          <label style={{ fontSize: 12.5, color: "#776F91", fontWeight: 700 }}>학교 정식 명칭</label>
          <input style={inputStyle} value={form.schoolName} onChange={(event) => setForm({ ...form, schoolName: event.target.value })} placeholder="예: 새봄중학교" required />
          <label style={{ fontSize: 12.5, color: "#776F91", fontWeight: 700 }}>로그인 학교명</label>
          <input style={inputStyle} value={form.schoolCode} onChange={(event) => setForm({ ...form, schoolCode: event.target.value.toLowerCase() })} placeholder="예: 대신고" pattern="[가-힣a-z0-9-]{2,40}" required />
          <label style={{ fontSize: 12.5, color: "#776F91", fontWeight: 700 }}>관리자 이름</label>
          <input style={inputStyle} value={form.displayName} onChange={(event) => setForm({ ...form, displayName: event.target.value })} placeholder="예: 김선생" required />
          <label style={{ fontSize: 12.5, color: "#776F91", fontWeight: 700 }}>관리자 아이디</label>
          <input style={inputStyle} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} minLength={4} placeholder="영문/숫자 4자 이상" required />
          <label style={{ fontSize: 12.5, color: "#776F91", fontWeight: 700 }}>비밀번호</label>
          <input type="password" style={inputStyle} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={8} placeholder="8자 이상" required />
          <button disabled={loading} style={{ width: "100%", padding: 13, border: 0, borderRadius: 13, background: "#7B5CF0", color: "#fff", fontWeight: 800, cursor: loading ? "wait" : "pointer" }}>
            {loading ? "학교를 만드는 중..." : "학교와 관리자 계정 만들기"}
          </button>
        </form>
        <div style={{ marginTop: 17, textAlign: "center", color: "#8B83A8", fontSize: 13 }}>
          이미 학교가 등록되어 있나요? <Link href="/register" style={{ color: "#7B5CF0", fontWeight: 700 }}>회원가입</Link>
        </div>
      </section>
    </main>
  );
}
