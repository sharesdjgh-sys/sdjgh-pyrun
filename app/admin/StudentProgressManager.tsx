"use client";

import { useEffect, useState } from "react";
import { curriculumLevelOrders, groupCurriculumUnits, type LearningUnitMeta } from "@/lib/curriculum-model";
import {
  effectiveConceptAccessIdsForOrders,
  isConceptUnlockedInOrders,
} from "@/lib/progress";
import { Check, Clock3, Lock, LockOpen, PlayCircle, RotateCcw, Users } from "lucide-react";

interface StudentStatus {
  id: number;
  username: string;
  displayName: string | null;
  studentNumber: string | null;
  grade: number | null;
  classNumber: number | null;
  seatNumber: number | null;
  createdAt: string | null;
  clearedConceptIds: number[];
  practicedConceptIds: number[];
  manuallyUnlockedConceptIds: number[];
  submissionCount: number;
  successfulRunCount: number;
  lastActivityAt: string | null;
}

interface CurriculumDefinition {
  id: number;
  name: string;
  isDefault: boolean;
  assignments: Array<{ grade: number; classNumber: number }>;
  units: LearningUnitMeta[];
}

function formatDate(value: string | null) {
  if (!value) return "아직 활동 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function StudentProgressManager() {
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [curricula, setCurricula] = useState<CurriculumDefinition[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<Array<{ grade: number; classNumber: number }>>([]);
  const [unrestricted, setUnrestricted] = useState(false);
  const [selectedClassKey, setSelectedClassKey] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [unlockingConceptId, setUnlockingConceptId] = useState<number | null>(null);

  async function loadStudents() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "학생 정보를 불러오지 못했습니다.");
      const nextStudents: StudentStatus[] = data.students ?? [];
      const nextAssignedClasses: Array<{ grade: number; classNumber: number }> = data.assignedClasses ?? [];
      setStudents(nextStudents);
      setCurricula(data.curricula ?? []);
      setAssignedClasses(nextAssignedClasses);
      setUnrestricted(Boolean(data.unrestricted));
      const firstClass = nextAssignedClasses[0]
        ?? nextStudents.find((student) => student.grade !== null && student.classNumber !== null);
      const firstClassKey = firstClass && firstClass.grade !== null && firstClass.classNumber !== null
        ? `${firstClass.grade}:${firstClass.classNumber}`
        : "unassigned";
      setSelectedClassKey((current) => current || firstClassKey);
      setSelectedStudentId((current) => current ?? nextStudents.find((student) => (
        firstClassKey === "unassigned"
          ? student.grade === null || student.classNumber === null
          : `${student.grade}:${student.classNumber}` === firstClassKey
      ))?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "학생 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  const studentClassKeys = students
    .filter((student) => student.grade !== null && student.classNumber !== null)
    .map((student) => `${student.grade}:${student.classNumber}`);
  const classOptions = [...new Set([
    ...assignedClasses.map((item) => `${item.grade}:${item.classNumber}`),
    ...studentClassKeys,
  ])].sort((a, b) => {
    const [aGrade, aClass] = a.split(":").map(Number);
    const [bGrade, bClass] = b.split(":").map(Number);
    return aGrade - bGrade || aClass - bClass;
  });
  if (unrestricted && students.some((student) => student.grade === null || student.classNumber === null)) {
    classOptions.push("unassigned");
  }
  const filteredStudents = students.filter((student) => (
    selectedClassKey === "unassigned"
      ? student.grade === null || student.classNumber === null
      : `${student.grade}:${student.classNumber}` === selectedClassKey
  ));

  function selectClass(classKey: string) {
    setSelectedClassKey(classKey);
    const firstStudent = students.find((student) => (
      classKey === "unassigned"
        ? student.grade === null || student.classNumber === null
        : `${student.grade}:${student.classNumber}` === classKey
    ));
    setSelectedStudentId(firstStudent?.id ?? null);
    setMessage("");
  }

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;
  const curriculumForStudent = (student: StudentStatus | null) => {
    if (!student) return curricula.find((item) => item.isDefault) ?? null;
    return curricula.find((item) => item.assignments.some((assignment) =>
      assignment.grade === student.grade && assignment.classNumber === student.classNumber
    )) ?? curricula.find((item) => item.isDefault) ?? null;
  };
  const selectedCurriculum = curriculumForStudent(selectedStudent);
  const curriculumUnits = selectedCurriculum?.units ?? [];
  const curriculumUnitIds = new Set(curriculumUnits.map((unit) => unit.id));
  const conceptOrders = curriculumLevelOrders(curriculumUnits);
  const visibleGroups = groupCurriculumUnits(curriculumUnits, level);
  const clearedIds = new Set(selectedStudent?.clearedConceptIds ?? []);
  const manualUnlockIds = new Set(selectedStudent?.manuallyUnlockedConceptIds ?? []);
  const accessIds = effectiveConceptAccessIdsForOrders(clearedIds, manualUnlockIds, conceptOrders);
  const completedCount = selectedStudent?.clearedConceptIds.filter((id) => curriculumUnitIds.has(id)).length ?? 0;
  const practicedCount = selectedStudent?.practicedConceptIds.filter((id) => curriculumUnitIds.has(id)).length ?? 0;
  const progressPercent = curriculumUnits.length > 0
    ? Math.round((completedCount / curriculumUnits.length) * 100)
    : 0;

  async function unlockConcept(conceptId: number) {
    if (!selectedStudent || unlockingConceptId !== null) return;
    setUnlockingConceptId(conceptId);
    setMessage("");

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent.id, conceptId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "잠금 해제에 실패했습니다.");

      setStudents((current) => current.map((student) => (
        student.id === selectedStudent.id
          ? { ...student, manuallyUnlockedConceptIds: [...new Set([...student.manuallyUnlockedConceptIds, conceptId])] }
          : student
      )));
      const conceptName = curriculumUnits.find((concept) => concept.id === conceptId)?.nameKo ?? "선택한 단원";
      setMessage(`${selectedStudent.displayName || selectedStudent.username} 학생의 '${conceptName}' 단원을 열었습니다.`);
    } catch (unlockError) {
      setMessage(unlockError instanceof Error ? unlockError.message : "잠금 해제에 실패했습니다.");
    } finally {
      setUnlockingConceptId(null);
    }
  }

  if (loading) {
    return <div style={{ flex: 1, padding: 40, textAlign: "center", color: "#8B83A8" }}>학생 수업 정보를 불러오는 중...</div>;
  }

  if (error) {
    return (
      <div style={{ flex: 1, padding: 40, textAlign: "center", color: "#D93668" }}>
        <div style={{ marginBottom: 14 }}>{error}</div>
        <button onClick={() => void loadStudents()} style={{ padding: "9px 16px", border: 0, borderRadius: 10, background: "#7B5CF0", color: "#fff", cursor: "pointer", fontWeight: 700 }}>다시 시도</button>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 800, color: "#3D2E8A" }}>
            <Users size={20} color="#7B5CF0" /> 학생 수업 관리
          </div>
          <div style={{ marginTop: 5, fontSize: 13, color: "#8B83A8" }}>학생별 학습 현황을 확인하고 필요한 단원을 직접 열어줄 수 있습니다.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          {classOptions.length > 0 && (
            <select value={selectedClassKey} onChange={(event) => selectClass(event.target.value)} style={{ padding: "8px 10px", border: "1px solid #DCD3F3", borderRadius: 10, background: "#fff", color: "#5C5180", fontFamily: "inherit", fontWeight: 700 }}>
              {classOptions.map((classKey) => {
                const count = students.filter((student) => classKey === "unassigned" ? student.grade === null || student.classNumber === null : `${student.grade}:${student.classNumber}` === classKey).length;
                const label = classKey === "unassigned" ? "학급 미배정" : `${classKey.split(":")[0]}학년 ${classKey.split(":")[1]}반`;
                return <option key={classKey} value={classKey}>{label} ({count}명)</option>;
              })}
            </select>
          )}
          <button onClick={() => void loadStudents()} title="새로고침" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid #DCD3F3", borderRadius: 10, background: "#fff", color: "#7B5CF0", cursor: "pointer", fontWeight: 700 }}>
            <RotateCcw size={14} /> 새로고침
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div style={{ padding: 50, textAlign: "center", background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, color: "#9A93B5" }}>담당 학급에 등록된 학생 계정이 없습니다.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 16, alignItems: "start" }}>
          <aside style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 18, padding: 10, boxShadow: "0 8px 24px rgba(90,63,214,.05)" }}>
            {filteredStudents.map((student) => {
              const active = student.id === selectedStudentId;
              const studentCurriculum = curriculumForStudent(student);
              const studentUnitIds = new Set(studentCurriculum?.units.map((unit) => unit.id) ?? []);
              const studentTotal = studentUnitIds.size;
              const studentCompleted = student.clearedConceptIds.filter((id) => studentUnitIds.has(id)).length;
              return (
                <button key={student.id} onClick={() => { setSelectedStudentId(student.id); setMessage(""); }} style={{ width: "100%", textAlign: "left", padding: "12px 13px", marginBottom: 5, border: active ? "1px solid #CFC2F5" : "1px solid transparent", borderRadius: 12, background: active ? "#F3EFFE" : "transparent", cursor: "pointer", fontFamily: "inherit" }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: active ? "#6C4BEF" : "#443B63" }}>{student.displayName || student.username}</div>
                  <div style={{ marginTop: 2, fontSize: 11.5, color: "#9A93B5" }}>{student.seatNumber ? `${student.seatNumber}번 · ` : ""}학번 {student.studentNumber || student.username}</div>
                  <div style={{ marginTop: 8, height: 5, borderRadius: 99, background: "#EDE8F8", overflow: "hidden" }}>
                    <div style={{ width: `${studentTotal > 0 ? Math.round((studentCompleted / studentTotal) * 100) : 0}%`, height: "100%", background: "linear-gradient(90deg,#9B7FFF,#18C99A)" }} />
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11, color: "#7A7198" }}>{studentCompleted}/{studentTotal} 완료</div>
                </button>
              );
            })}
          </aside>

          {selectedStudent && (
            <section style={{ minWidth: 0, background: "#fff", border: "1px solid #EFEAF8", borderRadius: 18, padding: 20, boxShadow: "0 8px 24px rgba(90,63,214,.05)" }}>
              <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#3D2E8A" }}>{selectedStudent.displayName || selectedStudent.username}</div>
                  <div style={{ marginTop: 3, fontSize: 12, color: "#9A93B5" }}>
                    {selectedStudent.grade && selectedStudent.classNumber ? `${selectedStudent.grade}학년 ${selectedStudent.classNumber}반 · ` : ""}
                    {selectedStudent.seatNumber ? `${selectedStudent.seatNumber}번 · ` : ""}학번 {selectedStudent.studentNumber || selectedStudent.username}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 11.5, color: "#7B5CF0", fontWeight: 700 }}>
                    {selectedCurriculum?.name ?? "배정된 커리큘럼 없음"}
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#7B5CF0" }}>{progressPercent}%</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 9, margin: "16px 0" }}>
                {[
                  ["완료 단원", `${completedCount}개`, <Check key="check" size={15} />],
                  ["연습 단원", `${practicedCount}개`, <PlayCircle key="play" size={15} />],
                  ["코드 제출", `${selectedStudent.submissionCount}회`, <LockOpen key="submit" size={15} />],
                  ["최근 활동", formatDate(selectedStudent.lastActivityAt), <Clock3 key="clock" size={15} />],
                ].map(([label, value, icon]) => (
                  <div key={String(label)} style={{ padding: "11px 12px", background: "#F8F5FF", borderRadius: 12, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#8B83A8" }}>{icon}{label}</div>
                    <div style={{ marginTop: 5, fontSize: label === "최근 활동" ? 11.5 : 16, fontWeight: 800, color: "#4B416A", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
                  </div>
                ))}
              </div>

              {message && <div style={{ marginBottom: 12, padding: "9px 12px", borderRadius: 10, background: message.includes("실패") ? "#FFF0F3" : "#ECFBF6", color: message.includes("실패") ? "#D93668" : "#168A68", fontSize: 12.5, fontWeight: 700 }}>{message}</div>}

              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {([1, 2, 3] as const).map((levelNumber) => (
                  <button key={levelNumber} onClick={() => setLevel(levelNumber)} style={{ padding: "7px 15px", border: 0, borderRadius: 9, background: level === levelNumber ? "#7B5CF0" : "#F0ECF9", color: level === levelNumber ? "#fff" : "#7A7198", cursor: "pointer", fontWeight: 800 }}>Lv.{levelNumber}</button>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visibleGroups.map((group) => (
                  <div key={group.label}>
                    <div style={{ marginBottom: 5, fontSize: 11.5, fontWeight: 800, color: group.color }}>{group.label}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6 }}>
                      {group.ids.filter((id) =>
                        curriculumUnits.find((unit) => unit.id === id)?.sourceConceptId !== 0
                      ).map((conceptId) => {
                        const concept = curriculumUnits.find((item) => item.id === conceptId);
                        if (!concept) return null;
                        const cleared = clearedIds.has(conceptId);
                        const directlyUnlocked = manualUnlockIds.has(conceptId);
                        const accessible = concept.sourceConceptId === 0 ||
                          isConceptUnlockedInOrders(conceptId, accessIds, conceptOrders);
                        const canUnlock = !cleared && !accessible;

                        return (
                          <div key={conceptId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "9px 10px", border: `1px solid ${cleared ? "#BCECDC" : directlyUnlocked ? "#D5C8F7" : "#EDE8F6"}`, borderRadius: 10, background: cleared ? "#F0FBF7" : directlyUnlocked ? "#F6F2FE" : "#fff" }}>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#4B416A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{concept.nameKo}</div>
                              <div style={{ marginTop: 2, fontSize: 10.5, color: cleared ? "#18A67A" : directlyUnlocked ? "#7B5CF0" : accessible ? "#8B83A8" : "#B2AAC7" }}>
                                {cleared ? "학생 완료 · 뱃지 획득" : directlyUnlocked ? "선생님이 잠금 해제" : accessible ? "현재 학습 가능" : "잠김"}
                              </div>
                            </div>
                            {canUnlock ? (
                              <button onClick={() => void unlockConcept(conceptId)} disabled={unlockingConceptId !== null} style={{ flex: "none", display: "flex", alignItems: "center", gap: 4, padding: "6px 8px", border: "1px solid #CFC2F5", borderRadius: 8, background: "#F3EFFE", color: "#6C4BEF", cursor: unlockingConceptId !== null ? "wait" : "pointer", fontSize: 10.5, fontWeight: 800 }}>
                                <LockOpen size={11} /> {unlockingConceptId === conceptId ? "처리 중" : "잠금 해제"}
                              </button>
                            ) : cleared ? <Check size={16} color="#18A67A" /> : accessible ? <LockOpen size={15} color="#9A8AC7" /> : <Lock size={15} color="#B2AAC7" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
