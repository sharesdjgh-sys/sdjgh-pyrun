"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { curriculumLevelOrders, groupCurriculumUnits, type LearningUnitMeta } from "@/lib/curriculum-model";
import {
  effectiveConceptAccessIdsForOrders,
  isConceptUnlockedInOrders,
} from "@/lib/progress";
import { Check, Clock3, LoaderCircle, Lock, LockOpen, PlayCircle, RotateCcw, Search, Users, X } from "lucide-react";

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

const levelButtonStyles = {
  1: { color: "#087F8C", light: "#22B8B1", tint: "#E2F8F6", border: "#B8E9E4" },
  2: { color: "#704FDF", light: "#9B7CF7", tint: "#EEE9FF", border: "#D8CDFA" },
  3: { color: "#AD6209", light: "#E79A28", tint: "#FFF1D5", border: "#F3D49D" },
} as const;

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
  const [selectedClassKey, setSelectedClassKey] = useState("all");
  const [bulkClassKey, setBulkClassKey] = useState("");
  const [bulkLevel, setBulkLevel] = useState<1 | 2 | 3>(1);
  const [bulkConceptId, setBulkConceptId] = useState<number | "">("");
  const [bulkUnlocking, setBulkUnlocking] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkMessageIsError, setBulkMessageIsError] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentQuery, setStudentQuery] = useState("");
  const [progressFilter, setProgressFilter] = useState<"all" | "notStarted" | "inProgress" | "completed">("all");
  const [studentSort, setStudentSort] = useState<"classSeat" | "name" | "progress" | "recent">("classSeat");
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [unlockingConceptId, setUnlockingConceptId] = useState<number | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

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
      const nextClassKeys = [...new Set([
        ...nextAssignedClasses.map((item) => `${item.grade}:${item.classNumber}`),
        ...nextStudents
          .filter((student) => student.grade !== null && student.classNumber !== null)
          .map((student) => `${student.grade}:${student.classNumber}`),
      ])].sort((a, b) => {
        const [aGrade, aClass] = a.split(":").map(Number);
        const [bGrade, bClass] = b.split(":").map(Number);
        return aGrade - bGrade || aClass - bClass;
      });
      setBulkClassKey((current) => nextClassKeys.includes(current) ? current : nextClassKeys[0] ?? "");
      setSelectedClassKey((current) => current || "all");
      setSelectedStudentId((current) => current && nextStudents.some((student) => student.id === current)
        ? current
        : nextStudents[0]?.id ?? null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "학생 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  useEffect(() => {
    setTemporaryPassword("");
  }, [selectedStudentId]);

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
  function selectClass(classKey: string) {
    setSelectedClassKey(classKey);
    const firstStudent = students.find((student) => (
      classKey === "all"
        ? true
        : classKey === "unassigned"
        ? student.grade === null || student.classNumber === null
        : `${student.grade}:${student.classNumber}` === classKey
    ));
    setSelectedStudentId(firstStudent?.id ?? null);
    setMessage("");
  }

  const selectedStudent = students.find((student) => student.id === selectedStudentId) ?? null;
  const curriculumForStudent = useCallback((student: StudentStatus | null) => {
    if (!student) return curricula.find((item) => item.isDefault) ?? null;
    return curricula.find((item) => item.assignments.some((assignment) =>
      assignment.grade === student.grade && assignment.classNumber === student.classNumber
    )) ?? curricula.find((item) => item.isDefault) ?? null;
  }, [curricula]);
  const progressForStudent = useCallback((student: StudentStatus) => {
    const unitIds = new Set(curriculumForStudent(student)?.units.map((unit) => unit.id) ?? []);
    const completed = student.clearedConceptIds.filter((id) => unitIds.has(id)).length;
    return {
      completed,
      total: unitIds.size,
      percent: unitIds.size > 0 ? Math.round((completed / unitIds.size) * 100) : 0,
    };
  }, [curriculumForStudent]);
  const filteredStudents = useMemo(() => {
    const normalizedQuery = studentQuery.trim().toLocaleLowerCase("ko");
    return students
      .filter((student) => (
        selectedClassKey === "all"
          ? true
          : selectedClassKey === "unassigned"
          ? student.grade === null || student.classNumber === null
          : `${student.grade}:${student.classNumber}` === selectedClassKey
      ))
      .filter((student) => {
        if (!normalizedQuery) return true;
        const classLabel = student.grade !== null && student.classNumber !== null
          ? `${student.grade}학년 ${student.classNumber}반 ${student.seatNumber ?? ""}번`
          : "학급 미배정";
        return `${student.displayName ?? ""} ${student.username} ${student.studentNumber ?? ""} ${classLabel}`
          .toLocaleLowerCase("ko")
          .includes(normalizedQuery);
      })
      .filter((student) => {
        if (progressFilter === "all") return true;
        const progress = progressForStudent(student);
        if (progressFilter === "notStarted") return progress.completed === 0;
        if (progressFilter === "completed") return progress.total > 0 && progress.completed >= progress.total;
        return progress.completed > 0 && progress.completed < progress.total;
      })
      .sort((a, b) => {
        if (studentSort === "name") {
          return (a.displayName || a.username).localeCompare(b.displayName || b.username, "ko");
        }
        if (studentSort === "progress") {
          return progressForStudent(b).percent - progressForStudent(a).percent ||
            (a.displayName || a.username).localeCompare(b.displayName || b.username, "ko");
        }
        if (studentSort === "recent") {
          return (b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0) -
            (a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0);
        }
        return (a.grade ?? Number.MAX_SAFE_INTEGER) - (b.grade ?? Number.MAX_SAFE_INTEGER) ||
          (a.classNumber ?? Number.MAX_SAFE_INTEGER) - (b.classNumber ?? Number.MAX_SAFE_INTEGER) ||
          (a.seatNumber ?? Number.MAX_SAFE_INTEGER) - (b.seatNumber ?? Number.MAX_SAFE_INTEGER) ||
          (a.displayName || a.username).localeCompare(b.displayName || b.username, "ko");
      });
  }, [progressFilter, progressForStudent, selectedClassKey, studentQuery, studentSort, students]);
  const hasActiveStudentFilters = selectedClassKey !== "all" || studentQuery.trim() !== "" || progressFilter !== "all" || studentSort !== "classSeat";

  const bulkClassStudents = useMemo(() => {
    const [grade, classNumber] = bulkClassKey.split(":").map(Number);
    if (!grade || !classNumber) return [];
    return students.filter((student) => student.grade === grade && student.classNumber === classNumber);
  }, [bulkClassKey, students]);
  const bulkCurriculum = useMemo(() => {
    const [grade, classNumber] = bulkClassKey.split(":").map(Number);
    if (!grade || !classNumber) return null;
    return curricula.find((item) => item.assignments.some((assignment) =>
      assignment.grade === grade && assignment.classNumber === classNumber
    )) ?? curricula.find((item) => item.isDefault) ?? null;
  }, [bulkClassKey, curricula]);
  const bulkUnits = useMemo(() => (bulkCurriculum?.units ?? [])
    .filter((unit) => unit.level === bulkLevel && unit.sourceConceptId !== 0)
    .sort((a, b) => a.orderIndex - b.orderIndex), [bulkCurriculum, bulkLevel]);

  useEffect(() => {
    setBulkConceptId((current) => bulkUnits.some((unit) => unit.id === current)
      ? current
      : bulkUnits[0]?.id ?? "");
  }, [bulkUnits]);

  useEffect(() => {
    if (filteredStudents.length === 0) {
      setSelectedStudentId(null);
      return;
    }
    if (!filteredStudents.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(filteredStudents[0].id);
      setMessage("");
    }
  }, [filteredStudents, selectedStudentId]);

  function resetStudentFilters() {
    setSelectedClassKey("all");
    setStudentQuery("");
    setProgressFilter("all");
    setStudentSort("classSeat");
  }
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

  async function unlockClassConcept() {
    if (!bulkClassKey || !bulkConceptId || bulkUnlocking) return;
    const [grade, classNumber] = bulkClassKey.split(":").map(Number);
    const concept = bulkUnits.find((unit) => unit.id === bulkConceptId);
    if (!grade || !classNumber || !concept) return;
    if (!confirm(`${grade}학년 ${classNumber}반 전체에 '${concept.nameKo}' 단원을 잠금 해제할까요? 배지는 지급되지 않습니다.`)) return;

    setBulkUnlocking(true);
    setBulkMessage("");
    setBulkMessageIsError(false);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unlockClassConcept",
          grade,
          classNumber,
          conceptId: bulkConceptId,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "학급 일괄 잠금 해제에 실패했습니다.");

      setStudents((current) => current.map((student) => (
        student.grade === grade && student.classNumber === classNumber &&
        !student.clearedConceptIds.includes(Number(bulkConceptId))
          ? {
              ...student,
              manuallyUnlockedConceptIds: [...new Set([
                ...student.manuallyUnlockedConceptIds,
                Number(bulkConceptId),
              ])],
            }
          : student
      )));
      setBulkMessage(
        `${grade}학년 ${classNumber}반 ${data.studentCount ?? bulkClassStudents.length}명에게 '${concept.nameKo}' 단원을 적용했습니다. 새로 잠금 해제된 학생은 ${data.unlockedCount ?? 0}명입니다.`
      );
    } catch (unlockError) {
      setBulkMessageIsError(true);
      setBulkMessage(unlockError instanceof Error ? unlockError.message : "학급 일괄 잠금 해제에 실패했습니다.");
    } finally {
      setBulkUnlocking(false);
    }
  }

  async function resetStudentPassword() {
    if (!selectedStudent || resettingPassword) return;
    if (temporaryPassword.length < 8) {
      setMessage("임시 비밀번호는 8자 이상으로 입력해 주세요.");
      return;
    }
    setResettingPassword(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resetPassword", studentId: selectedStudent.id, temporaryPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "임시 비밀번호를 발급하지 못했습니다.");
      setMessage(`${selectedStudent.displayName || selectedStudent.username} 학생의 임시 비밀번호를 변경했습니다. 학생에게 안전하게 전달해 주세요.`);
      setTemporaryPassword("");
    } catch (resetError) {
      setMessage(resetError instanceof Error ? resetError.message : "임시 비밀번호를 발급하지 못했습니다.");
    } finally {
      setResettingPassword(false);
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
          <div style={{ marginTop: 5, fontSize: 13, color: "#8B83A8" }}>학생별 학습 현황을 확인하고 개인 또는 학급 전체에 필요한 단원을 열어줄 수 있습니다.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <button onClick={() => void loadStudents()} title="새로고침" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid #DCD3F3", borderRadius: 10, background: "#fff", color: "#7B5CF0", cursor: "pointer", fontWeight: 700 }}>
            <RotateCcw size={14} /> 새로고침
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div style={{ padding: 50, textAlign: "center", background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, color: "#9A93B5" }}>담당 학급에 등록된 학생 계정이 없습니다.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2" style={{ alignItems: "stretch", marginBottom: 12 }}>
          <section style={{ display: "flex", height: "100%", flexDirection: "column", padding: 15, border: "1px solid #E9E3F3", borderRadius: 15, background: "#fff", boxShadow: "0 6px 18px rgba(90,63,214,.04)" }} aria-labelledby="student-filter-title">
            <div style={{ marginBottom: 11 }}>
              <div id="student-filter-title" style={{ display: "flex", alignItems: "center", gap: 6, color: "#4B416A", fontSize: 13.5, fontWeight: 850 }}>
                <Search size={15} /> 학생 검색 및 필터
              </div>
              <div style={{ marginTop: 3, color: "#8B83A8", fontSize: 11.5 }}>이름과 학급, 학습 상태를 기준으로 학생을 찾아보세요.</div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="sm:col-span-2" style={{ position: "relative", minWidth: 0 }}>
                <span style={{ position: "absolute", left: 11, top: "50%", display: "grid", placeItems: "center", color: "#9187A8", transform: "translateY(-50%)", pointerEvents: "none" }}><Search size={15} /></span>
                <input
                  type="search"
                  value={studentQuery}
                  onChange={(event) => setStudentQuery(event.target.value)}
                  placeholder="이름·학번·아이디 검색"
                  aria-label="학생 검색"
                  style={{ width: "100%", boxSizing: "border-box", padding: "9px 34px 9px 34px", border: "1px solid #DCD3F3", borderRadius: 10, background: "#FCFBFE", color: "#4B416A", fontFamily: "inherit", fontSize: 12.5, outline: "none" }}
                />
                {studentQuery && (
                  <button type="button" onClick={() => setStudentQuery("")} aria-label="검색어 지우기" style={{ position: "absolute", right: 8, top: "50%", display: "grid", width: 23, height: 23, placeItems: "center", padding: 0, border: 0, borderRadius: 7, background: "#F0ECF7", color: "#817793", cursor: "pointer", transform: "translateY(-50%)" }}>
                    <X size={13} />
                  </button>
                )}
              </label>

              <select value={selectedClassKey} onChange={(event) => selectClass(event.target.value)} aria-label="학급 필터" style={{ padding: "8px 10px", border: "1px solid #DCD3F3", borderRadius: 10, background: "#fff", color: "#5C5180", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>
                <option value="all">전체 학급 ({students.length}명)</option>
                {classOptions.map((classKey) => {
                  const count = students.filter((student) => classKey === "unassigned" ? student.grade === null || student.classNumber === null : `${student.grade}:${student.classNumber}` === classKey).length;
                  const label = classKey === "unassigned" ? "학급 미배정" : `${classKey.split(":")[0]}학년 ${classKey.split(":")[1]}반`;
                  return <option key={classKey} value={classKey}>{label} ({count}명)</option>;
                })}
              </select>

              <select value={progressFilter} onChange={(event) => setProgressFilter(event.target.value as typeof progressFilter)} aria-label="학습 상태 필터" style={{ padding: "8px 10px", border: "1px solid #DCD3F3", borderRadius: 10, background: "#fff", color: "#5C5180", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>
                <option value="all">모든 학습 상태</option>
                <option value="notStarted">학습 시작 전</option>
                <option value="inProgress">학습 진행 중</option>
                <option value="completed">전체 완료</option>
              </select>

              <select value={studentSort} onChange={(event) => setStudentSort(event.target.value as typeof studentSort)} aria-label="학생 정렬" style={{ padding: "8px 10px", border: "1px solid #DCD3F3", borderRadius: 10, background: "#fff", color: "#5C5180", fontFamily: "inherit", fontSize: 12, fontWeight: 700 }}>
                <option value="classSeat">학년·반·번호순</option>
                <option value="name">이름순</option>
                <option value="progress">진도 높은순</option>
                <option value="recent">최근 활동순</option>
              </select>

              <button type="button" onClick={resetStudentFilters} disabled={!hasActiveStudentFilters} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 10px", border: "1px solid #E0D9EC", borderRadius: 10, background: hasActiveStudentFilters ? "#F4F0FA" : "#FAF9FC", color: hasActiveStudentFilters ? "#6C579F" : "#AAA3B5", cursor: hasActiveStudentFilters ? "pointer" : "default", fontFamily: "inherit", fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap" }}>
                <RotateCcw size={13} /> 초기화
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 9, padding: "0 2px", color: "#8B83A8", fontSize: 11.5 }}>
              <span>담당 범위 내 학생만 검색됩니다.</span>
              <strong style={{ color: "#6C4BEF" }}>전체 {students.length}명 중 {filteredStudents.length}명</strong>
            </div>
          </section>

          <section style={{ display: "flex", height: "100%", flexDirection: "column", padding: 15, border: "1px solid #D8CDF7", borderRadius: 15, background: "linear-gradient(135deg,#FCFAFF,#F5F1FF)", boxShadow: "0 6px 18px rgba(90,63,214,.05)" }} aria-labelledby="class-unlock-title">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 11 }}>
              <div>
                <div id="class-unlock-title" style={{ display: "flex", alignItems: "center", gap: 6, color: "#4B378F", fontSize: 13.5, fontWeight: 850 }}>
                  <LockOpen size={15} /> 학급 일괄 잠금 해제
                </div>
                <div style={{ marginTop: 3, color: "#8B83A8", fontSize: 11.5 }}>선택한 반 전체에 단원만 열어주며 완료 배지는 지급하지 않습니다.</div>
              </div>
              {bulkClassKey && <strong style={{ color: "#6C4BEF", fontSize: 11.5 }}>{bulkClassStudents.length}명 대상</strong>}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={bulkClassKey}
                onChange={(event) => {
                  setBulkClassKey(event.target.value);
                  setBulkMessage("");
                }}
                disabled={bulkUnlocking}
                aria-label="일괄 잠금 해제 대상 학급"
                style={{ padding: "9px 10px", border: "1px solid #D5C9F4", borderRadius: 10, background: "#fff", color: "#514574", fontFamily: "inherit", fontSize: 12, fontWeight: 750 }}
              >
                {classOptions.filter((classKey) => classKey !== "unassigned").map((classKey) => {
                  const [grade, classNumber] = classKey.split(":");
                  const count = students.filter((student) => `${student.grade}:${student.classNumber}` === classKey).length;
                  return <option key={classKey} value={classKey}>{grade}학년 {classNumber}반 ({count}명)</option>;
                })}
              </select>

              <select
                value={bulkLevel}
                onChange={(event) => {
                  setBulkLevel(Number(event.target.value) as 1 | 2 | 3);
                  setBulkMessage("");
                }}
                disabled={bulkUnlocking}
                aria-label="일괄 잠금 해제 레벨"
                style={{ padding: "9px 10px", border: "1px solid #D5C9F4", borderRadius: 10, background: "#fff", color: "#514574", fontFamily: "inherit", fontSize: 12, fontWeight: 750 }}
              >
                <option value={1}>Lv.1</option>
                <option value={2}>Lv.2</option>
                <option value={3}>Lv.3</option>
              </select>

              <select
                className="sm:col-span-2"
                value={bulkConceptId}
                onChange={(event) => {
                  setBulkConceptId(event.target.value ? Number(event.target.value) : "");
                  setBulkMessage("");
                }}
                disabled={bulkUnlocking || bulkUnits.length === 0}
                aria-label="일괄 잠금 해제 단원"
                style={{ padding: "9px 10px", border: "1px solid #D5C9F4", borderRadius: 10, background: "#fff", color: "#514574", fontFamily: "inherit", fontSize: 12, fontWeight: 750 }}
              >
                {bulkUnits.length === 0
                  ? <option value="">이 레벨에는 단원이 없습니다</option>
                  : bulkUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.groupName} · {unit.nameKo}</option>)}
              </select>

              <button
                className="sm:col-span-2"
                type="button"
                onClick={() => void unlockClassConcept()}
                disabled={bulkUnlocking || !bulkClassKey || !bulkConceptId || bulkClassStudents.length === 0}
                aria-busy={bulkUnlocking}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 38, padding: "8px 13px", border: 0, borderRadius: 10, background: "#6C4BEF", color: "#fff", cursor: bulkUnlocking ? "wait" : "pointer", fontFamily: "inherit", fontSize: 11.5, fontWeight: 850, whiteSpace: "nowrap" }}
              >
                {bulkUnlocking ? <><LoaderCircle className="animate-spin" size={14} /> 적용 중...</> : <><LockOpen size={14} /> 반 전체 잠금 해제</>}
              </button>
            </div>

            {bulkMessage && (
              <div role={bulkMessageIsError ? "alert" : "status"} aria-live="polite" style={{ marginTop: 10, padding: "8px 10px", borderRadius: 9, background: bulkMessageIsError ? "#FFF0F3" : "#EAF9F4", color: bulkMessageIsError ? "#D93668" : "#168A68", fontSize: 11.5, fontWeight: 750 }}>
                {bulkMessage}
              </div>
            )}
          </section>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[310px_minmax(0,1fr)]" style={{ alignItems: "start" }}>
          <aside aria-label="학생 목록" style={{ height: 650, minHeight: 540, overflowY: "auto", background: "#fff", border: "1px solid #E4DCF1", borderRadius: 18, padding: "0 10px 10px", boxShadow: "0 8px 24px rgba(90,63,214,.07)" }}>
            <div style={{ position: "sticky", top: 0, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, margin: "0 -2px 8px", padding: "13px 4px 10px", borderBottom: "1px solid #EEE8F6", background: "rgba(255,255,255,.96)", backdropFilter: "blur(8px)" }}>
              <strong style={{ color: "#493D69", fontSize: 12.5 }}>학생 목록</strong>
              <span style={{ padding: "3px 7px", borderRadius: 99, background: "#F0EBFC", color: "#6C4BEF", fontSize: 10.5, fontWeight: 850 }}>{filteredStudents.length}명</span>
            </div>
            {filteredStudents.length === 0 ? (
              <div style={{ padding: "38px 12px", textAlign: "center", color: "#9A93B5", fontSize: 12.5, lineHeight: 1.6 }}>
                조건에 맞는 학생이 없습니다.<br />검색어나 필터를 변경해 주세요.
              </div>
            ) : filteredStudents.map((student, index) => {
              const active = student.id === selectedStudentId;
              const studentProgress = progressForStudent(student);
              return (
                <button key={student.id} aria-pressed={active} onClick={() => { setSelectedStudentId(student.id); setMessage(""); }} style={{ display: "grid", gridTemplateColumns: "38px minmax(0,1fr)", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "11px 12px", marginBottom: 8, border: active ? "1.5px solid #A992EE" : "1px solid #E9E3F2", borderRadius: 13, background: active ? "linear-gradient(135deg,#F3EFFE,#FAF8FF)" : "#FCFBFE", boxShadow: active ? "0 5px 14px rgba(108,75,239,.12)" : "0 2px 7px rgba(72,53,110,.04)", cursor: "pointer", fontFamily: "inherit" }}>
                  <span aria-hidden="true" style={{ display: "grid", width: 38, height: 38, placeItems: "center", borderRadius: 12, background: active ? "#6C4BEF" : "#EEE9F8", color: active ? "#fff" : "#746A91", fontSize: 12, fontWeight: 900 }}>
                    {student.seatNumber ?? index + 1}
                  </span>
                  <span style={{ display: "block", minWidth: 0 }}>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 7 }}>
                      <strong style={{ overflow: "hidden", color: active ? "#5E3FD2" : "#443B63", fontSize: 13.5, fontWeight: 850, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.displayName || student.username}</strong>
                      <small style={{ flex: "none", color: active ? "#6C4BEF" : "#8C82A3", fontSize: 9.5, fontWeight: 800 }}>{studentProgress.percent}%</small>
                    </span>
                    <span style={{ display: "block", overflow: "hidden", marginTop: 2, color: "#938BA7", fontSize: 10.5, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{student.grade && student.classNumber ? `${student.grade}학년 ${student.classNumber}반 · ` : ""}{student.seatNumber ? `${student.seatNumber}번` : `학번 ${student.studentNumber || student.username}`}</span>
                    <span style={{ display: "block", marginTop: 7, height: 5, borderRadius: 99, background: "#E9E3F3", overflow: "hidden" }}>
                      <span style={{ display: "block", width: `${studentProgress.percent}%`, height: "100%", background: "linear-gradient(90deg,#8C6AF0,#18C99A)" }} />
                    </span>
                    <span style={{ display: "block", marginTop: 4, color: "#756C8E", fontSize: 10 }}>{studentProgress.completed}/{studentProgress.total}개 단원 완료</span>
                  </span>
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
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    <input
                      type="password"
                      value={temporaryPassword}
                      onChange={(event) => setTemporaryPassword(event.target.value)}
                      minLength={8}
                      maxLength={128}
                      placeholder="임시 비밀번호 8자 이상"
                      style={{ width: 180, padding: "7px 9px", border: "1px solid #DCD3F3", borderRadius: 8, color: "#4B416A", fontFamily: "inherit", fontSize: 11.5 }}
                    />
                    <button type="button" onClick={() => void resetStudentPassword()} disabled={resettingPassword || temporaryPassword.length < 8} style={{ padding: "7px 10px", border: "1px solid #CFC2F5", borderRadius: 8, background: "#F3EFFE", color: "#6C4BEF", cursor: resettingPassword ? "wait" : "pointer", fontSize: 11, fontWeight: 800 }}>
                      {resettingPassword ? "변경 중" : "임시 비밀번호 발급"}
                    </button>
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
                {([1, 2, 3] as const).map((levelNumber) => {
                  const selected = level === levelNumber;
                  const palette = levelButtonStyles[levelNumber];
                  return (
                    <button
                      type="button"
                      key={levelNumber}
                      onClick={() => setLevel(levelNumber)}
                      aria-pressed={selected}
                      style={{
                        minWidth: 68,
                        padding: "8px 15px",
                        border: `1px solid ${selected ? palette.color : palette.border}`,
                        borderRadius: 9,
                        background: selected
                          ? `linear-gradient(145deg, ${palette.light}, ${palette.color})`
                          : palette.tint,
                        color: selected ? "#fff" : palette.color,
                        cursor: "pointer",
                        fontWeight: 850,
                        boxShadow: selected ? `0 4px 10px ${palette.color}33` : "none",
                        transform: selected ? "translateY(-1px)" : "none",
                        transition: "background 140ms ease, color 140ms ease, box-shadow 140ms ease, transform 140ms ease",
                      }}
                    >
                      Lv.{levelNumber}
                    </button>
                  );
                })}
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
        </>
      )}
    </div>
  );
}
