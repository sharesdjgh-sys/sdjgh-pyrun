"use client";

import { useEffect, useRef, useState } from "react";
import { School, Trash2, Upload, Users } from "lucide-react";

interface TeacherSummary {
  id: number;
  username: string;
  displayName: string | null;
  role: string;
}

interface Assignment {
  id: number;
  teacherUserId: number;
  grade: number;
  classNumber: number;
}

interface ClassRosterManagerProps {
  users: TeacherSummary[];
}

const fieldStyle = {
  padding: "9px 11px",
  border: "1.5px solid #E0D9F5",
  borderRadius: 10,
  background: "#fff",
  color: "#4B416A",
  fontFamily: "inherit",
  fontSize: 13,
  outline: "none",
};

export default function ClassRosterManager({ users }: ClassRosterManagerProps) {
  const teachers = users.filter((user) => user.role === "teacher");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherUserId, setTeacherUserId] = useState<number>(teachers[0]?.id ?? 0);
  const [grade, setGrade] = useState(1);
  const [classNumber, setClassNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/teacher-classes")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error ?? "담당 학급 정보를 불러오지 못했습니다.");
        setAssignments(data.assignments ?? []);
      })
      .catch((error) => setAssignmentMessage(error instanceof Error ? error.message : "담당 학급 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!teachers.some((teacher) => teacher.id === teacherUserId)) {
      setTeacherUserId(teachers[0]?.id ?? 0);
    }
  }, [teacherUserId, teachers]);

  async function addAssignment() {
    if (!teacherUserId || saving) return;
    setSaving(true);
    setAssignmentMessage("");
    try {
      const res = await fetch("/api/admin/teacher-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherUserId, grade, classNumber }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "담당 학급 배정에 실패했습니다.");
      setAssignments((current) => [...current, data.assignment]);
      setAssignmentMessage("담당 학급을 배정했습니다.");
    } catch (error) {
      setAssignmentMessage(error instanceof Error ? error.message : "담당 학급 배정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function removeAssignment(assignmentId: number) {
    if (saving) return;
    setSaving(true);
    setAssignmentMessage("");
    try {
      const res = await fetch("/api/admin/teacher-classes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "담당 학급 해제에 실패했습니다.");
      setAssignments((current) => current.filter((item) => item.id !== assignmentId));
      setAssignmentMessage("담당 학급 배정을 해제했습니다.");
    } catch (error) {
      setAssignmentMessage(error instanceof Error ? error.message : "담당 학급 해제에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function importStudents(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || importing) return;
    setImporting(true);
    setImportMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/students/import", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "학생 계정 등록에 실패했습니다.");
      setImportMessage(`총 ${data.total}명 처리 완료 · 신규 ${data.created}명 · 정보 갱신 ${data.updated}명`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "학생 계정 등록에 실패했습니다.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
      <section style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, padding: 24, boxShadow: "0 8px 24px rgba(90,63,214,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 16, fontWeight: 800, color: "#3D2E8A" }}>
          <Upload size={19} color="#7B5CF0" /> 학생 계정 일괄 등록
        </div>
        <p style={{ margin: "7px 0 16px", fontSize: 13, lineHeight: 1.6, color: "#8B83A8" }}>
          학교에서 제공한 학번을 로그인 아이디로 사용합니다. 기존 학번을 다시 올리면 비밀번호는 유지되고 학급 정보만 갱신됩니다.
        </p>
        <div style={{ padding: 13, borderRadius: 11, background: "#F8F5FF", color: "#62577F", fontSize: 12, lineHeight: 1.7 }}>
          <strong>CSV 열:</strong> 학번, 이름, 초기비밀번호<br />
          <strong>예시:</strong> 10501, 김파이, python1234<br />
          <span style={{ color: "#8B83A8" }}>10501은 1학년 5반 1번으로 자동 저장됩니다.</span>
        </div>
        <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={importStudents} style={{ display: "none" }} />
        <button onClick={() => fileInputRef.current?.click()} disabled={importing} style={{ marginTop: 16, width: "100%", padding: 11, border: 0, borderRadius: 11, background: importing ? "#B8B0CB" : "linear-gradient(135deg,#9B7FFF,#7B5CF0)", color: "#fff", cursor: importing ? "wait" : "pointer", fontFamily: "inherit", fontWeight: 800 }}>
          {importing ? "학생 계정 등록 중..." : "CSV 파일 선택"}
        </button>
        {importMessage && <div style={{ marginTop: 12, color: importMessage.includes("완료") ? "#168A68" : "#D93668", fontSize: 12.5, fontWeight: 700 }}>{importMessage}</div>}
      </section>

      <section style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, padding: 24, boxShadow: "0 8px 24px rgba(90,63,214,.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 16, fontWeight: 800, color: "#3D2E8A" }}>
          <School size={19} color="#18A67A" /> 교사 담당 학급 배정
        </div>
        <p style={{ margin: "7px 0 16px", fontSize: 13, lineHeight: 1.6, color: "#8B83A8" }}>교사는 여기에서 배정된 학년·반의 학생만 조회하고 관리할 수 있습니다.</p>

        {teachers.length === 0 ? (
          <div style={{ padding: 18, borderRadius: 11, background: "#FFF8E8", color: "#9A6A13", fontSize: 13 }}>먼저 회원 관리에서 교사 등급 계정을 만들어주세요.</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 75px 75px", gap: 7 }}>
              <select value={teacherUserId} onChange={(event) => setTeacherUserId(Number(event.target.value))} style={fieldStyle}>
                {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.displayName || teacher.username} (@{teacher.username})</option>)}
              </select>
              <input type="number" min={1} max={12} value={grade} onChange={(event) => setGrade(Number(event.target.value))} aria-label="학년" style={fieldStyle} />
              <input type="number" min={1} max={99} value={classNumber} onChange={(event) => setClassNumber(Number(event.target.value))} aria-label="반" style={fieldStyle} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 75px 75px", gap: 7, marginTop: 3, color: "#AAA2BF", fontSize: 10.5, textAlign: "center" }}>
              <span /> <span>학년</span> <span>반</span>
            </div>
            <button onClick={() => void addAssignment()} disabled={saving} style={{ marginTop: 10, width: "100%", padding: 10, border: 0, borderRadius: 10, background: "#18A67A", color: "#fff", cursor: saving ? "wait" : "pointer", fontFamily: "inherit", fontWeight: 800 }}>담당 학급 추가</button>
          </>
        )}

        {assignmentMessage && <div style={{ marginTop: 11, color: assignmentMessage.includes("실패") || assignmentMessage.includes("없") || assignmentMessage.includes("이미") ? "#D93668" : "#168A68", fontSize: 12.5, fontWeight: 700 }}>{assignmentMessage}</div>}

        <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 6, color: "#62577F", fontSize: 12.5, fontWeight: 800 }}><Users size={15} /> 현재 배정</div>
        {loading ? (
          <div style={{ padding: "14px 0", color: "#9A93B5", fontSize: 12.5 }}>불러오는 중...</div>
        ) : assignments.length === 0 ? (
          <div style={{ padding: "14px 0", color: "#9A93B5", fontSize: 12.5 }}>배정된 담당 학급이 없습니다.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 9 }}>
            {assignments.map((assignment) => {
              const teacher = users.find((user) => user.id === assignment.teacherUserId);
              return (
                <div key={assignment.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 11px", borderRadius: 10, background: "#F6F3FC" }}>
                  <div style={{ minWidth: 0, fontSize: 12.5, color: "#4B416A" }}><strong>{assignment.grade}학년 {assignment.classNumber}반</strong> · {teacher?.displayName || teacher?.username || "삭제된 교사"}</div>
                  <button onClick={() => void removeAssignment(assignment.id)} disabled={saving} title="배정 해제" style={{ flex: "none", padding: 5, border: 0, background: "transparent", color: "#D93668", cursor: saving ? "wait" : "pointer" }}><Trash2 size={14} /></button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
