"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { canOpenAdminPage, isAdministratorRole, isStudentRole } from "@/lib/roles";
import StudentProfileModal from "@/components/account/StudentProfileModal";
import PendingLink from "@/components/PendingLink";

export default function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [schoolBranding, setSchoolBranding] = useState<{ name: string; logoUrl: string | null; logoScale: number } | null>(null);
  const { data: session, status } = useSession();
  const sessionUser = session?.user as { username?: string; nickname?: string; displayName?: string; role?: string } | undefined;
  const username = sessionUser?.username;
  const role = sessionUser?.role;
  const canManage = canOpenAdminPage(role);
  const isAdmin = isAdministratorRole(role);
  const isStudent = isStudentRole(role);
  const name = isStudent ? sessionUser?.nickname || "코드러너" : session?.user?.name || "사용자";
  const initial = name.slice(0, 1);
  const studentRealName = sessionUser?.displayName || (!sessionUser?.nickname ? session?.user?.name : "");
  const identityText = username
    ? isStudent ? studentRealName || "학생" : `@${username}`
    : null;

  useEffect(() => {
    if (status !== "authenticated") {
      setSchoolBranding(null);
      return;
    }

    let cancelled = false;
    const loadBranding = () => {
      fetch("/api/school-branding", { cache: "no-store" })
        .then((response) => response.ok ? response.json() : null)
        .then((data) => {
          if (!cancelled && data?.school) setSchoolBranding(data.school);
        })
        .catch(() => undefined);
    };
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<{ name: string; logoUrl: string | null; logoScale: number }>).detail;
      if (detail) setSchoolBranding(detail);
      else loadBranding();
    };

    loadBranding();
    window.addEventListener("school-branding-updated", handleUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("school-branding-updated", handleUpdate);
    };
  }, [status]);

  const schoolLogoScale = Math.min(140, Math.max(70, schoolBranding?.logoScale ?? 100)) / 100;
  const schoolLogoWidth = Math.round(142 * schoolLogoScale);
  const schoolLogoHeight = Math.round(34 * schoolLogoScale);

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
      <PendingLink href="/learn" pendingLabel="학습 화면 여는 중..." style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
        <Image
          src="/pyrun_studio-logo.png"
          alt="PyRun Studio"
          width={160}
          height={44}
          style={{ objectFit: "contain" }}
          priority
        />
      </PendingLink>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* The logo is resolved from the signed-in user's school. */}
        {schoolBranding?.logoUrl ? (
          schoolBranding.logoUrl === "/sdj-logo.png" ? (
            <div role="img" aria-label={schoolBranding.name} style={{ position: "relative", flex: "none", width: schoolLogoWidth, aspectRatio: "2396 / 449", pointerEvents: "none" }}>
              <Image src="/sdj-logo.png" alt="" width={2396} height={449} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", clipPath: "inset(0 84.5% 0 0)" }} priority />
              <Image src="/sdj-logo.png" alt="" width={2396} height={449} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", clipPath: "inset(27% 0 0 15.5%)" }} priority />
            </div>
          ) : (
            <Image src={schoolBranding.logoUrl} alt={`${schoolBranding.name} 로고`} width={300} height={90} unoptimized style={{ flex: "none", width: schoolLogoWidth, height: schoolLogoHeight, objectFit: "contain" }} />
          )
        ) : schoolBranding ? (
          <div title={schoolBranding.name} style={{ maxWidth: 142, overflow: "hidden", color: "#77708B", fontSize: 12, fontWeight: 750, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {schoolBranding.name}
          </div>
        ) : null}

        {/* User badge */}
        <button
          type="button"
          onClick={() => isStudent && setProfileOpen(true)}
          disabled={!isStudent}
          title={identityText ?? name}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#F4F0FE", border: "1px solid transparent", borderRadius: 99, padding: "5px 12px 5px 5px", cursor: isStudent ? "pointer" : "default", fontFamily: "inherit", textAlign: "left" }}
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
        </button>

        {/* Admin link — teacher/admin only */}
        {canManage && (
          <PendingLink
            href="/admin"
            className="header-management-link"
            title={isAdmin ? "관리자 설정" : "관리"}
            pendingLabel="이동 중..."
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #C9BFEE", borderRadius: 99, padding: "8px 14px", fontSize: 13.5, fontWeight: 700, color: "#7B5CF0", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            {isAdmin ? "관리자 설정" : "관리"}
          </PendingLink>
        )}

        {/* Progress link */}
        <PendingLink
          href="/progress"
          className="header-growth-record-link"
          pendingLabel="이동 중..."
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #ECE7F8", borderRadius: 99, padding: "8px 14px", fontSize: 13.5, fontWeight: 700, color: "#7B5CF0", textDecoration: "none", whiteSpace: "nowrap" }}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          성장 기록
        </PendingLink>

        {/* Logout */}
        <button
          onClick={() => {
            if (signingOut) return;
            setSigningOut(true);
            void signOut({ callbackUrl: "/login" }).catch(() => setSigningOut(false));
          }}
          disabled={signingOut}
          aria-busy={signingOut}
          aria-label={signingOut ? "로그아웃 중" : "로그아웃"}
          title={signingOut ? "로그아웃 중..." : "로그아웃"}
          style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", border: "1.5px solid #ECE7F8", display: "flex", alignItems: "center", justifyContent: "center", color: "#9A93B5", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#FF5C8A"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#FFD3E0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9A93B5"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#ECE7F8"; }}
        >
          {signingOut ? <span className="button-loading-spinner" style={{ width: 15, height: 15, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} /> : <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>}
        </button>
      </div>
      <StudentProfileModal open={profileOpen && isStudent} onClose={() => setProfileOpen(false)} />
    </header>
  );
}
