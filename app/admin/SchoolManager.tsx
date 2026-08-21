"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, RefreshCw, Users } from "lucide-react";

type SchoolSummary = {
  id: number;
  name: string;
  loginName: string;
  userCount: number;
  curriculumCount: number;
  createdAt?: string | null;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  border: "1.5px solid #E0D9F5",
  borderRadius: 11,
  background: "#FBFAFF",
  color: "#3D2E8A",
  fontFamily: "inherit",
};

export default function SchoolManager() {
  const [schools, setSchools] = useState<SchoolSummary[]>([]);
  const [name, setName] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSchools() {
    setLoading(true);
    const response = await fetch("/api/admin/schools");
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setMessage(data.error ?? "학교 목록을 불러오지 못했습니다.");
      return;
    }
    setSchools(data.schools ?? []);
  }

  useEffect(() => {
    void loadSchools();
  }, []);

  async function createSchool(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, loginName }),
    });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) {
      setMessage(data.error ?? "학교를 등록하지 못했습니다.");
      return;
    }
    setName("");
    setLoginName("");
    setMessage(`'${data.school.name}'을(를) 등록했습니다.`);
    await loadSchools();
  }

  return (
    <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "340px minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
      <section style={{ padding: 22, borderRadius: 20, background: "#fff", border: "1px solid #EFEAF8", boxShadow: "0 8px 24px rgba(90,63,214,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: "#3D2E8A", fontWeight: 900, fontSize: 17 }}>
          <Building2 size={19} color="#7B5CF0" /> 새 학교 등록
        </div>
        <p style={{ margin: "0 0 20px", color: "#8B83A8", fontSize: 12.5, lineHeight: 1.5 }}>
          학교를 등록하면 기본 Python 커리큘럼 41개 단원이 함께 생성됩니다.
        </p>
        <form onSubmit={createSchool}>
          <label style={{ display: "block", marginBottom: 6, color: "#6F668C", fontSize: 12.5, fontWeight: 700 }}>학교 정식 명칭</label>
          <input value={name} onChange={(event) => setName(event.target.value)} style={{ ...inputStyle, marginBottom: 13 }} placeholder="예: 대전대신고등학교" required />
          <label style={{ display: "block", marginBottom: 6, color: "#6F668C", fontSize: 12.5, fontWeight: 700 }}>로그인 학교명</label>
          <input value={loginName} onChange={(event) => setLoginName(event.target.value.toLowerCase())} style={{ ...inputStyle, marginBottom: 16 }} placeholder="예: 대신고" pattern="[가-힣a-z0-9-]{2,40}" required />
          <button disabled={saving} style={{ width: "100%", padding: 11, border: 0, borderRadius: 11, background: "#7B5CF0", color: "#fff", cursor: saving ? "wait" : "pointer", fontWeight: 800 }}>
            <Plus size={15} style={{ verticalAlign: "middle", marginRight: 5 }} />
            {saving ? "등록 중..." : "학교 등록"}
          </button>
        </form>
        {message && <div style={{ marginTop: 14, padding: 10, borderRadius: 10, background: "#F4F0FE", color: "#5B4B99", fontSize: 12.5, fontWeight: 700 }}>{message}</div>}
      </section>

      <section style={{ padding: 22, borderRadius: 20, background: "#fff", border: "1px solid #EFEAF8", boxShadow: "0 8px 24px rgba(90,63,214,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ color: "#3D2E8A", fontWeight: 900, fontSize: 17 }}>등록 학교</div>
            <div style={{ marginTop: 3, color: "#8B83A8", fontSize: 12.5 }}>총 {schools.length}개 학교</div>
          </div>
          <button onClick={() => void loadSchools()} disabled={loading} aria-busy={loading} title="새로고침" style={{ marginLeft: "auto", padding: 8, border: "1px solid #E0D9F5", borderRadius: 9, background: "#fff", color: "#7B5CF0", cursor: loading ? "wait" : "pointer" }}>
            <RefreshCw size={15} className={loading ? "button-loading-spinner" : undefined} />
          </button>
        </div>
        {loading ? (
          <div style={{ padding: 28, textAlign: "center", color: "#9A93B5" }}>학교 목록을 불러오는 중...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {schools.map((school) => (
              <div key={school.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", border: "1px solid #EFEAF8", borderRadius: 13, background: "#FAF9FD" }}>
                <div style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 11, background: "#F0EBFD", color: "#7B5CF0" }}>
                  <Building2 size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: "#3D2E8A", fontWeight: 800, fontSize: 14 }}>{school.name}</div>
                  <div style={{ marginTop: 2, color: "#8B83A8", fontSize: 11.5 }}>로그인 학교명: {school.loginName}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#6F668C", fontSize: 12, fontWeight: 700 }}>
                  <Users size={14} /> {school.userCount}명
                </div>
                <div style={{ color: "#8B83A8", fontSize: 11.5 }}>커리큘럼 {school.curriculumCount}개</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
