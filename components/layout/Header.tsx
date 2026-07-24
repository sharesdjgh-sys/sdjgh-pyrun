"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { canOpenAdminPage, isAdministratorRole, isStudentRole } from "@/lib/roles";

export default function Header() {
  const { data: session } = useSession();
  const name = session?.user?.name || "학생";
  const initial = name.slice(0, 1);
  const sessionUser = session?.user as { username?: string; role?: string } | undefined;
  const username = sessionUser?.username;
  const role = sessionUser?.role;
  const canManage = canOpenAdminPage(role);
  const isAdmin = isAdministratorRole(role);
  const identityText = username
    ? isStudentRole(role) ? `아이디: ${username}` : `@${username}`
    : null;

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
      <Link href="/learn" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src="/pyrun_studio-logo.png"
          alt="PyRun Studio"
          width={160}
          height={44}
          style={{ objectFit: "contain" }}
          priority
        />
      </Link>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* User badge */}
        <div
          title={identityText ?? name}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#F4F0FE", borderRadius: 99, padding: "5px 12px 5px 5px" }}
        >
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(140deg,#FF8FB8,#FF5C8A)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 14 }}>
            {initial}
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#544D70" }}>{name}</span>
            {identityText && (
              <span style={{ marginTop: 2, fontSize: 10.5, fontWeight: 600, color: "#8B83A8" }}>
                {identityText}
              </span>
            )}
          </div>
        </div>

        {/* Admin link — teacher/admin only */}
        {canManage && (
          <Link
            href="/admin"
            title={isAdmin ? "관리자 설정" : "관리"}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #C9BFEE", borderRadius: 99, padding: "8px 14px", fontSize: 13.5, fontWeight: 700, color: "#7B5CF0", textDecoration: "none", whiteSpace: "nowrap" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F2FE")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {isAdmin ? "관리자 설정" : "관리"}
          </Link>
        )}

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
