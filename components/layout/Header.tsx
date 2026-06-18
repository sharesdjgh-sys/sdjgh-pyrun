"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();
  const name = session?.user?.name || "학생";
  const initial = name.slice(0, 1);

  return (
    <header
      style={{
        height: 66, flex: "none", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 22px",
        background: "rgba(255,255,255,.82)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid #EDE7F8", position: "sticky", top: 0, zIndex: 10,
      }}
    >
      {/* Logo */}
      <Link href="/learn" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
        <div style={{ width: 40, height: 40, borderRadius: 13, background: "linear-gradient(140deg,#8B6CFF,#7B5CF0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(123,92,240,.35)" }}>
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="10" rx="3" />
            <circle cx="12" cy="5" r="2" />
            <path d="M12 7v4" />
            <line x1="8" y1="16" x2="8" y2="16" />
            <line x1="16" y1="16" x2="16" y2="16" />
          </svg>
        </div>
        <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 18, letterSpacing: -0.3, color: "#2C2747", whiteSpace: "nowrap" }}>
          파이썬 학습 놀이터
        </div>
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* User badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F4F0FE", borderRadius: 99, padding: "5px 12px 5px 5px" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(140deg,#FF8FB8,#FF5C8A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 14 }}>
            {initial}
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#544D70" }}>{name}</span>
        </div>

        {/* Progress link */}
        <Link
          href="/progress"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #ECE7F8", borderRadius: 99, padding: "8px 14px", fontSize: 13.5, fontWeight: 700, color: "#7B5CF0", textDecoration: "none", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F2FE")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          성장 기록
        </Link>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="로그아웃"
          style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", border: "1.5px solid #ECE7F8", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A93B5", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#FF5C8A"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#FFD3E0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9A93B5"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#ECE7F8"; }}
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
}
