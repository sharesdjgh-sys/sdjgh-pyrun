"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { Award, Eye, EyeOff, KeyRound, ShieldCheck, UserRound, X } from "lucide-react";

type ProfileData = {
  user: {
    username: string;
    displayName: string | null;
    studentNumber: string | null;
    grade: number | null;
    classNumber: number | null;
    seatNumber: number | null;
    recoveryCodeSet: boolean;
  };
  badges: Array<{ id: number; name: string; clearedAt: string | null }>;
  badgeSummary: { earned: number; total: number };
};

export default function StudentProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { update: updateSession } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<"nickname" | "security" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    fetch("/api/account/profile")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "내 정보를 불러오지 못했습니다.");
        setProfile(data);
        setNickname(data.user.displayName ?? data.user.username);
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "내 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose, saving]);

  if (!open) return null;

  async function save(payload: Record<string, string>, kind: "nickname" | "security") {
    setSaving(kind);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "정보를 변경하지 못했습니다.");
      if (kind === "nickname") {
        setProfile((current) => current ? { ...current, user: { ...current.user, displayName: nickname.trim() } } : current);
        await updateSession({ name: nickname.trim() });
        setMessage("닉네임을 변경했습니다.");
      } else {
        setProfile((current) => current ? {
          ...current,
          user: { ...current.user, recoveryCodeSet: current.user.recoveryCodeSet || Boolean(recoveryCode) },
        } : current);
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
        setRecoveryCode("");
        setShowRecoveryCode(false);
        setMessage("보안 정보를 안전하게 변경했습니다.");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "정보를 변경하지 못했습니다.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSecuritySubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!newPassword && !recoveryCode) {
      setError("새 비밀번호 또는 복구번호를 입력해 주세요.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    await save({ currentPassword, newPassword, recoveryCode }, "security");
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 12px", border: "1.5px solid #E4DDF3", borderRadius: 11,
    background: "#FCFBFF", color: "#39324F", outline: "none", fontFamily: "inherit", fontSize: 13.5,
  };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: 6, color: "#766D91", fontSize: 12, fontWeight: 700 };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="내 정보" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose();
    }} style={{ position: "fixed", inset: 0, zIndex: 200, display: "grid", placeItems: "center", padding: 18, background: "rgba(42,34,70,.42)", backdropFilter: "blur(5px)" }}>
      <div style={{ width: "min(760px, 100%)", maxHeight: "min(780px, 92vh)", overflow: "auto", borderRadius: 24, background: "#fff", boxShadow: "0 24px 70px rgba(50,35,100,.24)", border: "1px solid #EEE8F8" }}>
        <div style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", background: "rgba(255,255,255,.94)", borderBottom: "1px solid #EEE9F6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#3D2E8A", fontSize: 18, fontWeight: 900 }}>
            <UserRound size={21} color="#7B5CF0" /> 내 정보
          </div>
          <button type="button" onClick={onClose} disabled={Boolean(saving)} aria-label="닫기" style={{ width: 34, height: 34, display: "grid", placeItems: "center", border: 0, borderRadius: 10, background: "#F4F0FA", color: "#81789B", cursor: saving ? "wait" : "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ padding: 20 }}>
          {loading && <div style={{ padding: 50, textAlign: "center", color: "#8B83A8" }}>내 정보를 불러오는 중...</div>}
          {error && <div role="alert" style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "#FFF0F4", color: "#D93668", fontSize: 13, fontWeight: 700 }}>{error}</div>}
          {message && <div style={{ marginBottom: 14, padding: "10px 12px", borderRadius: 10, background: "#ECFBF6", color: "#168A68", fontSize: 13, fontWeight: 700 }}>{message}</div>}

          {profile && !loading && (
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, .9fr) minmax(0, 1.1fr)", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <section style={{ padding: 16, borderRadius: 16, background: "linear-gradient(145deg,#F5F0FF,#FFF4F8)", border: "1px solid #EAE2F7" }}>
                  <div style={{ color: "#8B83A8", fontSize: 11.5, fontWeight: 700 }}>학생 계정</div>
                  <div style={{ marginTop: 4, color: "#3D2E8A", fontSize: 22, fontWeight: 900 }}>{profile.user.displayName || profile.user.username}</div>
                  <div style={{ marginTop: 7, color: "#736A8D", fontSize: 12.5 }}>아이디 · {profile.user.username}</div>
                  <div style={{ marginTop: 3, color: "#736A8D", fontSize: 12.5 }}>
                    {profile.user.grade && profile.user.classNumber ? `${profile.user.grade}학년 ${profile.user.classNumber}반 ` : ""}
                    {profile.user.seatNumber ? `${profile.user.seatNumber}번` : ""}
                  </div>
                </section>

                <section style={{ padding: 16, borderRadius: 16, border: "1px solid #EAE5F2" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#4B416A", fontWeight: 850 }}><Award size={17} color="#F2A21B" /> 현재 배지</div>
                  <div style={{ marginTop: 8, fontSize: 25, color: "#7B5CF0", fontWeight: 900 }}>{profile.badgeSummary.earned}<span style={{ color: "#AAA2BD", fontSize: 13 }}> / {profile.badgeSummary.total}개</span></div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                    {profile.badges.length ? profile.badges.slice(-8).reverse().map((badge) => (
                      <span key={badge.id} style={{ padding: "6px 8px", borderRadius: 8, background: "#F5F1FD", color: "#6956B5", fontSize: 11.5, fontWeight: 700 }}>{badge.name}</span>
                    )) : <span style={{ color: "#9B93AE", fontSize: 12 }}>아직 획득한 배지가 없습니다.</span>}
                  </div>
                </section>

                <section style={{ padding: 16, borderRadius: 16, border: "1px solid #EAE5F2" }}>
                  <label style={labelStyle}>닉네임</label>
                  <div style={{ display: "flex", gap: 7 }}>
                    <input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={20} style={inputStyle} />
                    <button type="button" disabled={Boolean(saving) || !nickname.trim()} onClick={() => void save({ displayName: nickname }, "nickname")} style={{ flex: "none", padding: "0 13px", border: 0, borderRadius: 10, background: "#7B5CF0", color: "#fff", fontWeight: 800, cursor: saving ? "wait" : "pointer" }}>{saving === "nickname" ? "저장 중" : "저장"}</button>
                  </div>
                </section>
              </div>

              <form onSubmit={handleSecuritySubmit} style={{ padding: 17, borderRadius: 16, border: "1px solid #EAE5F2" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#4B416A", fontWeight: 850 }}><KeyRound size={17} color="#7B5CF0" /> 비밀번호와 복구번호</div>
                <p style={{ margin: "7px 0 14px", color: "#8B83A8", fontSize: 11.5, lineHeight: 1.5 }}>보안 정보 변경에는 현재 비밀번호가 필요합니다. 복구번호는 친구에게 알려주지 마세요.</p>
                <label style={labelStyle}>현재 비밀번호</label>
                <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} style={{ ...inputStyle, marginBottom: 11 }} required />
                <label style={labelStyle}>새 비밀번호 <span style={{ fontWeight: 500 }}>(변경할 때만)</span></label>
                <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={128} placeholder="8자 이상" style={{ ...inputStyle, marginBottom: 9 }} />
                <input type="password" autoComplete="new-password" value={newPasswordConfirm} onChange={(event) => setNewPasswordConfirm(event.target.value)} placeholder="새 비밀번호 확인" style={{ ...inputStyle, marginBottom: 14 }} />
                <label style={labelStyle}>6자리 복구번호 <span style={{ color: profile.user.recoveryCodeSet ? "#18A67A" : "#D97706" }}>{profile.user.recoveryCodeSet ? "· 설정됨" : "· 설정 필요"}</span></label>
                <div style={{ position: "relative" }}>
                  <input type={showRecoveryCode ? "text" : "password"} inputMode="numeric" autoComplete="off" value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value.replace(/\D/g, "").slice(0, 6))} pattern="\d{6}" placeholder="숫자 6자리" style={{ ...inputStyle, paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowRecoveryCode((visible) => !visible)} aria-label={showRecoveryCode ? "복구번호 숨기기" : "복구번호 보기"} aria-pressed={showRecoveryCode} style={{ position: "absolute", top: "50%", right: 7, transform: "translateY(-50%)", width: 34, height: 30, display: "grid", placeItems: "center", border: 0, borderRadius: 8, background: "transparent", color: "#81789B", cursor: "pointer" }}>
                    {showRecoveryCode ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "start", marginTop: 10, padding: 10, borderRadius: 10, background: "#FFF8E8", color: "#8B6425", fontSize: 11, lineHeight: 1.45 }}><ShieldCheck size={15} style={{ flex: "none" }} /> 닉네임이나 휴대폰 뒤 4자리는 다른 학생이 알 수 있어 비밀번호 복구에 사용하지 않습니다.</div>
                <button type="submit" disabled={Boolean(saving)} style={{ width: "100%", marginTop: 13, padding: 11, border: 0, borderRadius: 11, background: "linear-gradient(180deg,#8B6CFF,#7B5CF0)", color: "#fff", fontWeight: 850, cursor: saving ? "wait" : "pointer" }}>{saving === "security" ? "변경 중..." : "보안 정보 변경"}</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
