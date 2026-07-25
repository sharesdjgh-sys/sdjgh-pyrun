"use client";

import { useState, useRef, useEffect } from "react";
import { UNIT_GROUPS_LV1, UNIT_GROUPS_LV2, UNIT_GROUPS_LV3 } from "@/lib/curriculum";
import { USER_ROLES, isAdministratorRole, type UserRole } from "@/lib/roles";
import { Bot, Layers, Calculator, GitBranch, Braces, ShieldAlert, Upload, Trash2, FileSpreadsheet, BarChart2, TrendingUp, Filter, Cpu, Users } from "lucide-react";
import StudentProgressManager from "./StudentProgressManager";
import ClassRosterManager from "./ClassRosterManager";
import TeacherCurriculumManager from "./TeacherCurriculumManager";
import SchoolManager from "./SchoolManager";

const GROUP_ICON_MAP: Record<string, React.ElementType> = {
  Bot, Layers, Calculator, GitBranch, Braces, ShieldAlert, BarChart2, TrendingUp, Filter, Cpu,
};

interface Concept {
  id: number;
  nameKo: string;
  nameEn: string;
  orderIndex: number;
  description: string | null;
  exampleCode: string | null;
  practiceCode: string | null;
  level: number;
}

interface AdminClientProps {
  concepts: Concept[];
  users: UserSummary[];
  currentRole?: string;
  currentUserId: number;
}

interface UserSummary {
  id: number;
  username: string;
  role: string;
  displayName: string | null;
  schoolId: number;
  schoolName: string;
}

interface EditData {
  description: string;
  exampleCode: string;
  practiceCode: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: "학생",
  teacher: "교사",
  admin: "관리자",
};

export default function AdminClient({
  concepts: initialConcepts,
  users: initialUsers,
  currentRole,
  currentUserId,
}: AdminClientProps) {
  const [concepts, setConcepts] = useState<Concept[]>(initialConcepts);
  const [selectedId, setSelectedId] = useState<number>(initialConcepts[0]?.id ?? 1);
  const [editData, setEditData] = useState<EditData>(() => {
    const first = initialConcepts[0];
    return {
      description: first?.description ?? "",
      exampleCode: first?.exampleCode ?? "",
      practiceCode: first?.practiceCode ?? "",
    };
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [levelFilter, setLevelFilter] = useState<1 | 2 | 3>(1);

  const isAdministrator = isAdministratorRole(currentRole);
  type AdminTab = "my-curricula" | "curriculum" | "data" | "students" | "classes" | "users" | "schools";
  const [adminTab, setAdminTab] = useState<AdminTab>("my-curricula");
  const [csvFiles, setCsvFiles] = useState<Array<{filename: string; url: string}>>([]);
  const [csvUploading, setCsvUploading] = useState(false);
  const [csvMessage, setCsvMessage] = useState("");
  const [users, setUsers] = useState<UserSummary[]>(initialUsers);
  const [userMessage, setUserMessage] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSchoolId = users.find((user) => user.id === currentUserId)?.schoolId;

  useEffect(() => {
    fetch("/api/data/list")
      .then((r) => r.json())
      .then(({ files }) => setCsvFiles(files ?? [] as Array<{filename: string; url: string}>))
      .catch(() => {});
  }, []);

  async function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvUploading(true);
    setCsvMessage("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/admin/data", { method: "POST", body: form });
      const data = await res.json();
      if (res.ok) {
        setCsvMessage(`✓ '${data.filename}' 업로드 완료`);
        setCsvFiles((prev) => [
          ...prev.filter((f) => f.filename !== data.filename),
          { filename: data.filename, url: data.url },
        ]);
      } else {
        setCsvMessage(`✗ ${data.error}`);
      }
    } catch {
      setCsvMessage("✗ 네트워크 오류");
    } finally {
      setCsvUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleCsvDelete(file: {filename: string; url: string}) {
    if (!confirm(`'${file.filename}'을(를) 삭제할까요?`)) return;
    const res = await fetch("/api/admin/data", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.filename }),
    });
    if (res.ok) {
      setCsvFiles((prev) => prev.filter((f) => f.filename !== file.filename));
      setCsvMessage(`✓ '${file.filename}' 삭제 완료`);
    }
  }

  async function handleUserRoleChange(userId: number, role: UserRole) {
    if (updatingUserId !== null) return;
    setUpdatingUserId(userId);
    setUserMessage("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUserMessage(data.error ?? "회원 등급 변경에 실패했습니다.");
        return;
      }

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...data.user } : user)));
      setUserMessage("회원 등급을 변경했습니다.");
    } catch {
      setUserMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  async function handleUserDelete(user: UserSummary) {
    if (updatingUserId !== null) return;
    if (user.id === currentUserId) {
      setUserMessage("현재 로그인한 관리자 계정은 삭제할 수 없습니다.");
      return;
    }
    if (!confirm(`'${user.username}' 계정과 학습 기록을 모두 삭제할까요?`)) return;

    setUpdatingUserId(user.id);
    setUserMessage("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUserMessage(data.error ?? "회원 삭제에 실패했습니다.");
        return;
      }

      setUsers((prev) => prev.filter((item) => item.id !== user.id));
      setUserMessage(`'${user.username}' 계정을 삭제했습니다.`);
    } catch {
      setUserMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setUpdatingUserId(null);
    }
  }

  function handleSelectConcept(concept: Concept) {
    setSelectedId(concept.id);
    setEditData({
      description: concept.description ?? "",
      exampleCode: concept.exampleCode ?? "",
      practiceCode: concept.practiceCode ?? "",
    });
    setSaved(false);
    setSaveError("");
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    setSaved(false);
    setSaveError("");

    try {
      const res = await fetch(`/api/admin/concepts/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        setConcepts((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? {
                  ...c,
                  description: editData.description,
                  exampleCode: editData.exampleCode,
                  practiceCode: editData.practiceCode,
                }
              : c
          )
        );
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error ?? "저장에 실패했습니다.");
      }
    } catch {
      setSaveError("네트워크 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }

  const selectedConcept = concepts.find((c) => c.id === selectedId);
  const filteredGroups = levelFilter === 1 ? UNIT_GROUPS_LV1 : levelFilter === 2 ? UNIT_GROUPS_LV2 : UNIT_GROUPS_LV3;
  const adminTabs: Array<[AdminTab, string]> = [
    ["my-curricula", "내 커리큘럼"],
    ["data", "데이터 파일 관리"],
    ["students", "학생 수업 관리"],
    ...(isAdministrator ? ([["classes", "학급·계정 관리"]] as Array<[AdminTab, string]>) : []),
    ...(isAdministrator ? ([["users", "회원 관리"]] as Array<[AdminTab, string]>) : []),
    ...(isAdministrator ? ([["schools", "학교 관리"]] as Array<[AdminTab, string]>) : []),
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #EFEAF8",
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 2px 12px rgba(90,63,214,.06)",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(135deg,#9B7FFF,#7B5CF0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          🛠️
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#3D2E8A" }}>커리큘럼 관리</div>
          <div style={{ fontSize: 12, color: "#A39CC0" }}>선생님 전용 개념 편집 페이지</div>
        </div>
        <a
          href="/learn"
          style={{
            marginLeft: "auto",
            fontSize: 13,
            color: "#7B5CF0",
            fontWeight: 600,
            textDecoration: "none",
            padding: "7px 14px",
            border: "1.5px solid #C9BFEE",
            borderRadius: 10,
            background: "#F6F2FE",
            transition: "background .13s",
          }}
        >
          ← 학습 페이지로
        </a>
      </header>

      {/* Tab selector */}
      <div style={{ display: "flex", gap: 4, padding: "12px 28px 0", maxWidth: 1200, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
        {adminTabs.map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setAdminTab(tab)}
            style={{
              padding: "9px 18px",
              border: "none",
              borderRadius: "12px 12px 0 0",
              background: adminTab === tab ? "#fff" : "transparent",
              color: adminTab === tab ? "#7B5CF0" : "#9A93B5",
              fontWeight: adminTab === tab ? 700 : 500,
              fontSize: 13.5,
              cursor: "pointer",
              fontFamily: "inherit",
              borderBottom: adminTab === tab ? "2px solid #7B5CF0" : "2px solid transparent",
              transition: "all .13s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 20,
          padding: "12px 28px 28px",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
        {adminTab === "my-curricula" ? (
          <TeacherCurriculumManager />
        ) : adminTab === "data" ? (
          /* ── 데이터 파일 관리 탭 ── */
          <div style={{ flex: 1, background: "#fff", borderRadius: 20, border: "1px solid #EFEAF8", boxShadow: "0 8px 24px rgba(90,63,214,.06)", padding: "28px 32px" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#3D2E8A", marginBottom: 6 }}>📊 데이터 파일 관리</div>
            <div style={{ fontSize: 13, color: "#8B83A8", marginBottom: 24 }}>
              학생들이 <code style={{ background: "#F4EFFC", color: "#7B5CF0", padding: "1px 6px", borderRadius: 5 }}>load_data(&#39;파일명&#39;)</code>으로 불러올 CSV 파일을 업로드하세요.
            </div>

            {/* 업로드 영역 */}
            <div
              style={{ border: "2px dashed #C9BFEE", borderRadius: 16, padding: "28px 24px", textAlign: "center", marginBottom: 24, background: "#FDFAFF", cursor: "pointer" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={32} color="#C9BFEE" style={{ marginBottom: 10 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#7B5CF0", marginBottom: 4 }}>CSV 파일 클릭하여 업로드</div>
              <div style={{ fontSize: 12, color: "#B0A8CC" }}>.csv 파일만 가능합니다</div>
              <input ref={fileInputRef} type="file" accept=".csv" style={{ display: "none" }} onChange={handleCsvUpload} />
            </div>

            {csvUploading && <div style={{ fontSize: 13, color: "#7B5CF0", marginBottom: 12 }}>업로드 중...</div>}
            {csvMessage && (
              <div style={{ fontSize: 13, color: csvMessage.startsWith("✓") ? "#18C99A" : "#E23E70", marginBottom: 16, fontWeight: 600 }}>
                {csvMessage}
              </div>
            )}

            {/* 파일 목록 */}
            <div style={{ fontSize: 13, fontWeight: 700, color: "#544D70", marginBottom: 10 }}>업로드된 파일 ({csvFiles.length}개)</div>
            {csvFiles.length === 0 ? (
              <div style={{ fontSize: 13, color: "#B0A8CC", padding: "16px 0" }}>아직 업로드된 파일이 없습니다.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {csvFiles.map((file) => (
                  <div
                    key={file.filename}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#F8F5FF", borderRadius: 12, border: "1px solid #EFEAF8" }}
                  >
                    <FileSpreadsheet size={18} color="#7B5CF0" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#3D2E8A" }}>{file.filename}</div>
                      <div style={{ fontSize: 11.5, color: "#9A93B5" }}>
                        사용법: <code style={{ color: "#7B5CF0" }}>load_data(&#39;{file.filename.replace(".csv", "")}&#39;)</code>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCsvDelete(file)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", color: "#D93668", padding: 6, borderRadius: 8, display: "flex", alignItems: "center" }}
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : adminTab === "students" ? (
          <StudentProgressManager />
        ) : adminTab === "classes" ? (
          <ClassRosterManager users={users.filter((user) => user.schoolId === currentSchoolId)} />
        ) : adminTab === "schools" ? (
          <SchoolManager />
        ) : adminTab === "users" ? (
          <div style={{ flex: 1, background: "#fff", borderRadius: 20, border: "1px solid #EFEAF8", boxShadow: "0 8px 24px rgba(90,63,214,.06)", padding: "28px 32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <Users size={20} color="#7B5CF0" />
              <div style={{ fontSize: 16, fontWeight: 800, color: "#3D2E8A" }}>회원 관리</div>
            </div>
            <div style={{ fontSize: 13, color: "#8B83A8", marginBottom: 20 }}>
              회원 등급을 학생, 교사, 관리자로 변경할 수 있습니다.
            </div>

            {userMessage && (
              <div style={{ fontSize: 13, color: userMessage.includes("실패") || userMessage.includes("오류") || userMessage.includes("해제") ? "#D93668" : "#18A67A", marginBottom: 14, fontWeight: 700 }}>
                {userMessage}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {users.map((user) => {
                const role = USER_ROLES.includes(user.role as UserRole) ? (user.role as UserRole) : "student";
                const isSelf = user.id === currentUserId;
                return (
                  <div
                    key={user.id}
                    style={{ display: "grid", gridTemplateColumns: "minmax(180px, 1fr) 130px 340px", alignItems: "center", gap: 14, padding: "14px 16px", background: "#F8F5FF", border: "1px solid #EFEAF8", borderRadius: 12 }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#3D2E8A" }}>{user.displayName || user.username}</div>
                      <div style={{ fontSize: 12, color: "#9A93B5" }}>@{user.username}{isSelf ? " · 현재 계정" : ""}</div>
                      <div style={{ marginTop: 2, fontSize: 11.5, color: "#7B5CF0", fontWeight: 700 }}>{user.schoolName}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#7B5CF0" }}>{ROLE_LABELS[role]}</div>
                    <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                      {USER_ROLES.map((nextRole) => (
                        <button
                          key={nextRole}
                          onClick={() => handleUserRoleChange(user.id, nextRole)}
                          disabled={updatingUserId !== null || (isSelf && nextRole !== "admin")}
                          style={{
                            padding: "7px 11px",
                            border: role === nextRole ? "1.5px solid #7B5CF0" : "1.5px solid #E0D9F5",
                            borderRadius: 10,
                            background: role === nextRole ? "#F2ECFD" : "#fff",
                            color: role === nextRole ? "#7B5CF0" : "#6F668C",
                            fontFamily: "inherit",
                            fontSize: 12.5,
                            fontWeight: 800,
                            cursor: updatingUserId !== null || (isSelf && nextRole !== "admin") ? "not-allowed" : "pointer",
                            opacity: updatingUserId === user.id ? 0.6 : 1,
                          }}
                        >
                          {ROLE_LABELS[nextRole]}
                        </button>
                      ))}
                      <button
                        onClick={() => handleUserDelete(user)}
                        disabled={updatingUserId !== null || isSelf}
                        style={{
                          padding: "7px 11px",
                          border: "1.5px solid #DC3F54",
                          borderRadius: 10,
                          background: "linear-gradient(180deg, #FF6B7A, #E84C5F)",
                          color: "#fff",
                          fontFamily: "inherit",
                          fontSize: 12.5,
                          fontWeight: 800,
                          cursor: updatingUserId !== null || isSelf ? "not-allowed" : "pointer",
                          opacity: updatingUserId === user.id ? 0.6 : 1,
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
        /* ── 커리큘럼 편집 탭 ── */
        <>
        {/* Sidebar */}
        <div
          style={{
            width: 210,
            flex: "none",
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #EFEAF8",
            boxShadow: "0 8px 24px rgba(90,63,214,.06)",
            overflow: "hidden",
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              padding: "13px 14px 10px",
              borderBottom: "1px solid #F2EDF9",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#B0A8CC",
              letterSpacing: 0.5,
              textTransform: "uppercase" as const,
            }}
          >
            개념 목록
          </div>
          {/* Level toggle */}
          <div style={{ display: "flex", gap: 4, padding: "8px 8px 4px" }}>
            {([1, 2, 3] as const).map((lv) => (
              <button
                key={lv}
                onClick={() => setLevelFilter(lv)}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  background: levelFilter === lv ? "linear-gradient(135deg,#9B7FFF,#7B5CF0)" : "#F3EFFE",
                  color: levelFilter === lv ? "#fff" : "#9B7FFF",
                  transition: "all .13s",
                }}
              >
                Lv.{lv}
              </button>
            ))}
          </div>
          <div style={{ padding: "8px 8px 12px" }}>
            {filteredGroups.map((group) => (
              <div key={group.label} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: group.color,
                    letterSpacing: 0.5,
                    padding: "6px 8px 3px",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {(() => { const Icon = GROUP_ICON_MAP[group.icon]; return Icon ? <Icon size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : null; })()}
                  {group.label}
                </div>
                {group.ids.map((id) => {
                  const concept = concepts.find((c) => c.id === id);
                  if (!concept) return null;
                  const selected = id === selectedId;
                  return (
                    <button
                      key={id}
                      onClick={() => handleSelectConcept(concept)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "block",
                        padding: "7px 10px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: selected ? 700 : 500,
                        background: selected
                          ? "linear-gradient(135deg,#9B7FFF,#7B5CF0)"
                          : "transparent",
                        color: selected ? "#fff" : "#7A6FA0",
                        marginBottom: 1,
                        transition: "all .13s",
                        boxShadow: selected ? "0 3px 8px rgba(123,92,240,.22)" : "none",
                      }}
                    >
                      {concept.nameKo}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Editor panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {selectedConcept ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #EFEAF8",
                boxShadow: "0 8px 24px rgba(90,63,214,.06)",
                overflow: "hidden",
              }}
            >
              {/* Card header */}
              <div
                style={{
                  padding: "18px 24px 16px",
                  borderBottom: "1px solid #F2EDF9",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 800, color: "#3D2E8A" }}>
                  {selectedConcept.nameKo}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#9B7FFF",
                    background: "#F2ECFD",
                    padding: "3px 10px",
                    borderRadius: 99,
                  }}
                >
                  {selectedConcept.nameEn}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "#C4BDD8",
                    marginLeft: 4,
                  }}
                >
                  ID: {selectedConcept.id}
                </span>
              </div>

              {/* Form fields */}
              <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Description */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#5C5480",
                      marginBottom: 8,
                    }}
                  >
                    학생에게 보이는 설명
                    <span style={{ fontWeight: 400, color: "#A39CC0", marginLeft: 6 }}>
                      (최대 500자)
                    </span>
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    maxLength={500}
                    rows={3}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      border: "1.5px solid #E0D9F5",
                      borderRadius: 12,
                      fontSize: 14,
                      color: "#3D2E8A",
                      lineHeight: 1.6,
                      resize: "vertical",
                      fontFamily: "inherit",
                      outline: "none",
                      transition: "border-color .13s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#7B5CF0")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#E0D9F5")}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: "#C4BDD8",
                      marginTop: 4,
                    }}
                  >
                    {editData.description.length} / 500
                  </div>
                </div>

                {/* Example code */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#5C5480",
                      marginBottom: 8,
                    }}
                  >
                    예제 코드
                    <span style={{ fontWeight: 400, color: "#A39CC0", marginLeft: 6 }}>
                      (최대 20,000자)
                    </span>
                  </label>
                  <textarea
                    value={editData.exampleCode}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, exampleCode: e.target.value }))
                    }
                    maxLength={20000}
                    rows={12}
                    spellCheck={false}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      border: "1.5px solid #E0D9F5",
                      borderRadius: 12,
                      fontSize: 13,
                      color: "#1E1F36",
                      lineHeight: 1.6,
                      resize: "vertical",
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                      background: "#FAFAFA",
                      outline: "none",
                      transition: "border-color .13s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#7B5CF0")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#E0D9F5")}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: "#C4BDD8",
                      marginTop: 4,
                    }}
                  >
                    {editData.exampleCode.length.toLocaleString()} / 20,000
                  </div>
                </div>

                {/* Practice code */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#5C5480",
                      marginBottom: 8,
                    }}
                  >
                    문제 코드
                    <span style={{ fontWeight: 400, color: "#A39CC0", marginLeft: 6 }}>
                      (최대 20,000자)
                    </span>
                  </label>
                  <textarea
                    value={editData.practiceCode}
                    onChange={(e) =>
                      setEditData((prev) => ({ ...prev, practiceCode: e.target.value }))
                    }
                    maxLength={20000}
                    rows={12}
                    spellCheck={false}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      border: "1.5px solid #E0D9F5",
                      borderRadius: 12,
                      fontSize: 13,
                      color: "#1E1F36",
                      lineHeight: 1.6,
                      resize: "vertical",
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                      background: "#FAFAFA",
                      outline: "none",
                      transition: "border-color .13s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#7B5CF0")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#E0D9F5")}
                  />
                  <div
                    style={{
                      textAlign: "right",
                      fontSize: 11,
                      color: "#C4BDD8",
                      marginTop: 4,
                    }}
                  >
                    {editData.practiceCode.length.toLocaleString()} / 20,000
                  </div>
                </div>

                {/* Save button + feedback */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: "12px 28px",
                      border: "none",
                      borderRadius: 13,
                      background: saving
                        ? "#B0A8CC"
                        : "linear-gradient(135deg,#9B7FFF,#7B5CF0)",
                      color: "#fff",
                      fontFamily: "inherit",
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: saving ? "not-allowed" : "pointer",
                      boxShadow: saving ? "none" : "0 5px 14px rgba(123,92,240,.28)",
                      transition: "all .13s",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {saving ? (
                      <>
                        <span
                          style={{
                            width: 15,
                            height: 15,
                            border: "2.5px solid #fff",
                            borderTopColor: "transparent",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 0.8s linear infinite",
                          }}
                        />
                        저장 중...
                      </>
                    ) : (
                      "저장하기"
                    )}
                  </button>

                  {saved && (
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#18C99A",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      ✓ 저장되었습니다
                    </span>
                  )}

                  {saveError && (
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#D93668",
                      }}
                    >
                      오류: {saveError}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                border: "1px solid #EFEAF8",
                padding: "40px",
                textAlign: "center",
                color: "#A39CC0",
                fontSize: 15,
              }}
            >
              왼쪽에서 개념을 선택하세요.
            </div>
          )}
        </div>
        </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
