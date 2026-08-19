"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Eraser, LoaderCircle, School, Trash2, Upload, Users } from "lucide-react";

interface TeacherSummary {
  id: number;
  username: string;
  displayName: string | null;
  role: string;
  grade?: number | null;
  classNumber?: number | null;
  schoolName?: string;
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
  const schoolName = users.find((user) => user.schoolName)?.schoolName ?? "현재 학교";
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [teacherUserId, setTeacherUserId] = useState<number>(teachers[0]?.id ?? 0);
  const [selectedClassKeys, setSelectedClassKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAction, setSavingAction] = useState<"bulk" | number | null>(null);
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [cleaningEmptyClasses, setCleaningEmptyClasses] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const classOptions = useMemo(() => {
    const options = [
      ...users.flatMap((user) => user.role === "student" && user.grade !== null && user.grade !== undefined && user.classNumber !== null && user.classNumber !== undefined
        ? [{ grade: user.grade, classNumber: user.classNumber }]
        : []),
      ...assignments.map(({ grade, classNumber }) => ({ grade, classNumber })),
    ];
    return options
      .filter((item, index, items) => items.findIndex((candidate) => candidate.grade === item.grade && candidate.classNumber === item.classNumber) === index)
      .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
  }, [assignments, users]);
  const classesByGrade = useMemo(() => classOptions.reduce<Record<number, typeof classOptions>>((groups, item) => {
    (groups[item.grade] ??= []).push(item);
    return groups;
  }, {}), [classOptions]);
  const teacherAssignments = assignments.filter((item) => item.teacherUserId === teacherUserId);
  const savedClassKeys = teacherAssignments.map((item) => `${item.grade}:${item.classNumber}`).sort();
  const hasAssignmentChanges = savedClassKeys.join(",") !== [...selectedClassKeys].sort().join(",");
  const assignmentGroups = teachers
    .map((teacher) => ({
      teacher,
      items: assignments
        .filter((item) => item.teacherUserId === teacher.id)
        .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber),
    }))
    .filter((group) => group.items.length > 0);

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

  useEffect(() => {
    setSelectedClassKeys(
      assignments
        .filter((item) => item.teacherUserId === teacherUserId)
        .map((item) => `${item.grade}:${item.classNumber}`)
    );
  }, [assignments, teacherUserId]);

  function toggleClass(key: string) {
    setSelectedClassKeys((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  }

  function toggleGrade(grade: number) {
    const gradeKeys = (classesByGrade[grade] ?? []).map((item) => `${item.grade}:${item.classNumber}`);
    const allSelected = gradeKeys.every((key) => selectedClassKeys.includes(key));
    setSelectedClassKeys((current) => allSelected
      ? current.filter((key) => !gradeKeys.includes(key))
      : [...new Set([...current, ...gradeKeys])]
    );
  }

  async function saveAssignments() {
    if (!teacherUserId || saving || !hasAssignmentChanges) return;
    setSaving(true);
    setSavingAction("bulk");
    setAssignmentMessage("");
    try {
      const res = await fetch("/api/admin/teacher-classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherUserId,
          classes: selectedClassKeys.map((key) => {
            const [grade, classNumber] = key.split(":").map(Number);
            return { grade, classNumber };
          }),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "담당 학급 저장에 실패했습니다.");
      setAssignments((current) => [
        ...current.filter((item) => item.teacherUserId !== teacherUserId),
        ...(data.assignments ?? []),
      ]);
      setAssignmentMessage(`${data.assignments?.length ?? 0}개 학급을 담당 학급으로 저장했습니다.`);
    } catch (error) {
      setAssignmentMessage(error instanceof Error ? error.message : "담당 학급 저장에 실패했습니다.");
    } finally {
      setSavingAction(null);
      setSaving(false);
    }
  }

  async function removeAssignment(assignmentId: number) {
    if (saving) return;
    setSaving(true);
    setSavingAction(assignmentId);
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
      setSavingAction(null);
      setSaving(false);
    }
  }

  async function cleanupEmptyClasses() {
    if (saving || cleaningEmptyClasses) return;
    if (!window.confirm("학생이 한 명도 없는 학급의 교사 담당 배정과 커리큘럼 배정을 모두 정리할까요?")) return;
    setCleaningEmptyClasses(true);
    setAssignmentMessage("");
    try {
      const res = await fetch("/api/admin/classes/cleanup", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "빈 학급 정리에 실패했습니다.");
      const removedKeys = new Set<string>((data.removedClasses ?? []).map(
        (item: { grade: number; classNumber: number }) => `${item.grade}:${item.classNumber}`
      ));
      setAssignments((current) => current.filter((item) => !removedKeys.has(`${item.grade}:${item.classNumber}`)));
      setAssignmentMessage(removedKeys.size > 0
        ? `학생이 없는 학급 ${removedKeys.size}개와 연결된 배정 정보를 정리했습니다.`
        : "정리할 빈 학급이 없습니다.");
    } catch (error) {
      setAssignmentMessage(error instanceof Error ? error.message : "빈 학급 정리에 실패했습니다.");
    } finally {
      setCleaningEmptyClasses(false);
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
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 18, alignItems: "start" }}>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 16, fontWeight: 800, color: "#3D2E8A" }}>
            <School size={19} color="#18A67A" /> 교사 담당 학급 배정
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", gap: 7 }}>
            <span style={{ maxWidth: 190, overflow: "hidden", padding: "5px 9px", border: "1px solid #CDEDE4", borderRadius: 99, background: "#F0FFF9", color: "#11785B", fontSize: 10.5, fontWeight: 850, textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={schoolName}>
              {schoolName}
            </span>
            <button
              type="button"
              onClick={cleanupEmptyClasses}
              disabled={saving || cleaningEmptyClasses}
              style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 9px", border: "1px solid #E5DDF2", borderRadius: 9, background: "#FAF8FD", color: "#6D6283", cursor: saving || cleaningEmptyClasses ? "wait" : "pointer", fontFamily: "inherit", fontSize: 10.5, fontWeight: 800 }}
            >
              {cleaningEmptyClasses ? <LoaderCircle size={13} className="animate-spin" /> : <Eraser size={13} />}
              {cleaningEmptyClasses ? "정리 중..." : "빈 학급 정리"}
            </button>
          </div>
        </div>
        <p style={{ margin: "7px 0 10px", fontSize: 13, lineHeight: 1.6, color: "#8B83A8" }}>교사는 여기에서 배정된 학년·반의 학생만 조회하고 관리할 수 있습니다.</p>
        <div style={{ marginBottom: 16, padding: "9px 11px", borderRadius: 10, background: "#F7F4FD", color: "#62577F", fontSize: 11.5, lineHeight: 1.45 }}>
          배정 대상 학교: <strong style={{ color: "#3D2E8A" }}>{schoolName}</strong>
          <span style={{ display: "block", marginTop: 2, color: "#9A93B5", fontSize: 10.5 }}>학급은 이 학교 안에서만 구분되며 다른 학교의 동일 학년·반과 섞이지 않습니다.</span>
        </div>

        {teachers.length === 0 ? (
          <div style={{ padding: 18, borderRadius: 11, background: "#FFF8E8", color: "#9A6A13", fontSize: 13 }}>먼저 회원 관리에서 교사 등급 계정을 만들어주세요.</div>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
              <div style={{ padding: 12, border: "1px solid #EAE4F5", borderRadius: 14, background: "#FAF9FD" }}>
                <div style={{ marginBottom: 9, color: "#4B416A", fontSize: 12.5, fontWeight: 850 }}>교사 선택</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {teachers.map((teacher) => {
                    const selected = teacher.id === teacherUserId;
                    const count = assignments.filter((item) => item.teacherUserId === teacher.id).length;
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setTeacherUserId(teacher.id)}
                        disabled={saving}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", padding: "9px 10px", border: selected ? "1px solid #8F75E8" : "1px solid transparent", borderRadius: 10, background: selected ? "#F0EBFF" : "#fff", color: selected ? "#543BA8" : "#5E5575", cursor: saving ? "wait" : "pointer", fontFamily: "inherit", textAlign: "left" }}
                      >
                        <span style={{ minWidth: 0 }}>
                          <strong style={{ display: "block", overflow: "hidden", fontSize: 11.5, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teacher.displayName || teacher.username}</strong>
                          <small style={{ display: "block", marginTop: 1, color: "#9A93B5", fontSize: 9.5 }}>@{teacher.username}</small>
                        </span>
                        <span style={{ flex: "none", padding: "3px 6px", borderRadius: 99, background: selected ? "#7B5CF0" : "#F0ECF7", color: selected ? "#fff" : "#7E7495", fontSize: 9.5, fontWeight: 850 }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ minWidth: 0, padding: 14, border: "1px solid #E1F0EA", borderRadius: 14, background: "linear-gradient(145deg,#FBFFFD,#F7FCFA)" }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ color: "#4B416A", fontSize: 12.5, fontWeight: 850 }}>담당 학급 다중 선택</div>
                <div style={{ marginTop: 2, color: "#9A93B5", fontSize: 11 }}>{selectedClassKeys.length}개 학급 선택됨</div>
              </div>
              {selectedClassKeys.length > 0 && (
                <button type="button" onClick={() => setSelectedClassKeys([])} disabled={saving} style={{ padding: "5px 8px", border: 0, borderRadius: 8, background: "#F3EFFB", color: "#746A91", cursor: "pointer", fontFamily: "inherit", fontSize: 10.5, fontWeight: 750 }}>
                  전체 해제
                </button>
              )}
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(classesByGrade).length === 0 ? (
                <div style={{ padding: "15px 13px", border: "1px dashed #DCD3F3", borderRadius: 11, background: "#FBFAFE", color: "#8B83A8", fontSize: 12, lineHeight: 1.55 }}>
                  학생 계정을 먼저 등록하면 학년·반 목록이 자동으로 표시됩니다.
                </div>
              ) : Object.entries(classesByGrade).map(([gradeKey, classes]) => {
                const grade = Number(gradeKey);
                const gradeKeys = classes.map((item) => `${item.grade}:${item.classNumber}`);
                const allSelected = gradeKeys.every((key) => selectedClassKeys.includes(key));
                return (
                  <div key={grade} style={{ padding: 10, border: "1px solid #EAE4F7", borderRadius: 12, background: "#FBFAFE" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <strong style={{ color: "#544A73", fontSize: 12 }}>{grade}학년</strong>
                      <button type="button" onClick={() => toggleGrade(grade)} disabled={saving} style={{ padding: "3px 7px", border: 0, borderRadius: 7, background: allSelected ? "#E9FFF8" : "#F0ECFA", color: allSelected ? "#12805F" : "#6E6096", cursor: "pointer", fontFamily: "inherit", fontSize: 10, fontWeight: 800 }}>
                        {allSelected ? "학년 전체 해제" : "학년 전체 선택"}
                      </button>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {classes.map((item) => {
                        const key = `${item.grade}:${item.classNumber}`;
                        const selected = selectedClassKeys.includes(key);
                        return (
                          <button key={key} type="button" aria-pressed={selected} onClick={() => toggleClass(key)} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 5, minWidth: 54, padding: "7px 9px", border: selected ? "1px solid #18A67A" : "1px solid #DED7EC", borderRadius: 9, background: selected ? "#E9FFF8" : "#fff", color: selected ? "#11785B" : "#746A91", cursor: "pointer", fontFamily: "inherit", fontSize: 11.5, fontWeight: 800 }}>
                            <span style={{ display: "grid", placeItems: "center", width: 15, height: 15, borderRadius: 4, background: selected ? "#18A67A" : "#EEEAF5", color: "#fff" }}>{selected && <Check size={11} strokeWidth={3} />}</span>
                            {item.classNumber}반
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={() => void saveAssignments()} disabled={saving || !hasAssignmentChanges} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 12, width: "100%", padding: 11, border: 0, borderRadius: 10, background: hasAssignmentChanges ? "#18A67A" : "#D9D4E3", color: "#fff", cursor: saving ? "wait" : hasAssignmentChanges ? "pointer" : "not-allowed", fontFamily: "inherit", fontWeight: 800 }}>
              {savingAction === "bulk" ? <><LoaderCircle size={15} style={{ animation: "spin .8s linear infinite" }} /> 저장 중...</> : <>선택한 담당 학급 저장</>}
            </button>
              </div>
            </div>
          </>
        )}

        {assignmentMessage && <div style={{ marginTop: 11, color: assignmentMessage.includes("실패") || assignmentMessage.includes("없") || assignmentMessage.includes("이미") ? "#D93668" : "#168A68", fontSize: 12.5, fontWeight: 700 }}>{assignmentMessage}</div>}

        <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid #EFEAF8", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#4B416A", fontSize: 13, fontWeight: 850 }}><Users size={16} /> 현재 배정 현황</div>
          <span style={{ padding: "3px 8px", borderRadius: 99, background: "#F1ECFD", color: "#6C4BEF", fontSize: 10.5, fontWeight: 800 }}>{assignmentGroups.length}명 · {assignments.length}개 학급</span>
        </div>
        {loading ? (
          <div style={{ padding: "14px 0", color: "#9A93B5", fontSize: 12.5 }}>불러오는 중...</div>
        ) : assignments.length === 0 ? (
          <div style={{ marginTop: 10, padding: 16, borderRadius: 11, background: "#F8F6FC", color: "#9A93B5", fontSize: 12.5, textAlign: "center" }}>배정된 담당 학급이 없습니다.</div>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {assignmentGroups.map(({ teacher, items }) => (
              <div key={teacher.id} style={{ padding: 12, border: teacher.id === teacherUserId ? "1px solid #CFC2F4" : "1px solid #EAE4F5", borderRadius: 12, background: teacher.id === teacherUserId ? "#FAF8FF" : "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", overflow: "hidden", color: "#453A68", fontSize: 12.5, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{teacher.displayName || teacher.username}</strong>
                    <span style={{ color: "#9A93B5", fontSize: 10.5 }}>@{teacher.username}</span>
                  </div>
                  <span style={{ flex: "none", color: "#766A96", fontSize: 10.5, fontWeight: 800 }}>{items.length}개 학급</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}>
                  {items.map((assignment) => (
                    <span key={assignment.id} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 6px 5px 9px", borderRadius: 99, background: "#F0ECFA", color: "#5D4E8B", fontSize: 10.5, fontWeight: 800 }}>
                      {assignment.grade}학년 {assignment.classNumber}반
                      <button onClick={() => void removeAssignment(assignment.id)} disabled={saving} title="배정 해제" aria-label={`${teacher.displayName || teacher.username}의 ${assignment.grade}학년 ${assignment.classNumber}반 배정 해제`} style={{ display: "grid", placeItems: "center", width: 20, height: 20, padding: 0, border: 0, borderRadius: "50%", background: "rgba(217,54,104,.08)", color: "#D93668", cursor: saving ? "wait" : "pointer" }}>
                        {savingAction === assignment.id ? <LoaderCircle size={11} style={{ animation: "spin .8s linear infinite" }} /> : <Trash2 size={11} />}
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
