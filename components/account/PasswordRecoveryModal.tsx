"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, X } from "lucide-react";

export default function PasswordRecoveryModal({
  open,
  initialSchoolCode,
  initialUsername,
  onClose,
}: {
  open: boolean;
  initialSchoolCode: string;
  initialUsername: string;
  onClose: () => void;
}) {
  const [schoolCode, setSchoolCode] = useState("");
  const [username, setUsername] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!open) return null;
  const effectiveSchoolCode = schoolCode || initialSchoolCode;
  const effectiveUsername = username || initialUsername;

  function handleClose() {
    setSchoolCode("");
    setUsername("");
    setRecoveryCode("");
    setShowRecoveryCode(false);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setDone(false);
    onClose();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schoolCode: effectiveSchoolCode, username: effectiveUsername, recoveryCode, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "비밀번호를 변경하지 못했습니다.");
      setDone(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "비밀번호를 변경하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const fieldStyle: React.CSSProperties = { width: "100%", padding: "12px 13px", border: "1.5px solid #E5DDF4", borderRadius: 11, background: "#FCFBFF", outline: "none", fontFamily: "inherit", color: "#39324F", fontSize: 14 };
  const labelStyle: React.CSSProperties = { display: "block", margin: "11px 0 6px", color: "#766D91", fontSize: 12, fontWeight: 700 };

  return (
    <div role="dialog" aria-modal="true" aria-label="비밀번호 찾기" style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", padding: 18, background: "rgba(42,34,70,.42)", backdropFilter: "blur(5px)" }}>
      <div style={{ width: "min(420px, 100%)", padding: 22, borderRadius: 22, background: "#fff", border: "1px solid #EEE8F8", boxShadow: "0 24px 70px rgba(50,35,100,.24)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#3D2E8A", fontSize: 18, fontWeight: 900 }}><KeyRound size={20} color="#7B5CF0" /> 비밀번호 찾기</div>
          <button type="button" onClick={handleClose} disabled={loading} aria-label="닫기" style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: 0, borderRadius: 9, background: "#F4F0FA", color: "#81789B", cursor: "pointer" }}><X size={17} /></button>
        </div>

        {done ? (
          <div style={{ paddingTop: 20 }}>
            <div style={{ padding: 14, borderRadius: 12, background: "#ECFBF6", color: "#168A68", fontSize: 13.5, fontWeight: 700 }}>비밀번호를 변경했습니다. 새 비밀번호로 로그인하세요.</div>
            <button type="button" onClick={handleClose} style={{ width: "100%", marginTop: 14, padding: 12, border: 0, borderRadius: 11, background: "#7B5CF0", color: "#fff", fontWeight: 800, cursor: "pointer" }}>로그인으로 돌아가기</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p style={{ margin: "9px 0 4px", color: "#8B83A8", fontSize: 12, lineHeight: 1.5 }}>내 정보에서 미리 설정한 6자리 복구번호가 필요합니다. 설정하지 않았거나 잊었다면 선생님께 임시 비밀번호를 요청하세요.</p>
            {error && <div role="alert" style={{ marginTop: 10, padding: "9px 11px", borderRadius: 9, background: "#FFF0F4", color: "#D93668", fontSize: 12.5, fontWeight: 700 }}>{error}</div>}
            <label style={labelStyle}>학교명</label>
            <input value={effectiveSchoolCode} onChange={(event) => setSchoolCode(event.target.value)} style={fieldStyle} required />
            <label style={labelStyle}>학번</label>
            <input value={effectiveUsername} onChange={(event) => setUsername(event.target.value)} style={fieldStyle} required />
            <label style={labelStyle}>6자리 복구번호</label>
            <div style={{ position: "relative" }}>
              <input type={showRecoveryCode ? "text" : "password"} inputMode="numeric" autoComplete="one-time-code" value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value.replace(/\D/g, "").slice(0, 6))} pattern="\d{6}" style={{ ...fieldStyle, paddingRight: 48 }} required />
              <button type="button" onClick={() => setShowRecoveryCode((visible) => !visible)} aria-label={showRecoveryCode ? "복구번호 숨기기" : "복구번호 보기"} aria-pressed={showRecoveryCode} style={{ position: "absolute", top: "50%", right: 7, transform: "translateY(-50%)", width: 34, height: 30, display: "grid", placeItems: "center", border: 0, borderRadius: 8, background: "transparent", color: "#81789B", cursor: "pointer" }}>
                {showRecoveryCode ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <label style={labelStyle}>새 비밀번호</label>
            <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={128} placeholder="8자 이상" style={fieldStyle} required />
            <label style={labelStyle}>새 비밀번호 확인</label>
            <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} maxLength={128} style={fieldStyle} required />
            <button type="submit" disabled={loading} style={{ width: "100%", marginTop: 16, padding: 12, border: 0, borderRadius: 11, background: loading ? "#A78BFA" : "#7B5CF0", color: "#fff", fontWeight: 850, cursor: loading ? "wait" : "pointer" }}>{loading ? "확인 중..." : "비밀번호 변경"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
