"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookCopy, Check, CheckCircle2, Circle, Code2, LoaderCircle, Map, PencilLine, Play, Plus, Save, School, Sparkles, Trash2, X } from "lucide-react";
import CodeEditor from "@/components/editor/CodeEditor";
import OutputPanel from "@/components/editor/OutputPanel";
import { usePyodide } from "@/hooks/usePyodide";
import styles from "./TeacherCurriculumManager.module.css";

type CurriculumSummary = {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  ownerTeacherId: number | null;
  canEdit: boolean;
  assignments: Array<{ grade: number; classNumber: number }>;
};

type Unit = {
  id: number;
  activityType: "python" | "mechdog";
  nameKo: string;
  nameEn: string;
  groupName: string;
  level: number;
  orderIndex: number;
  description: string | null;
  exampleCode: string | null;
  practiceCode: string | null;
};

type UnitLevelFilter = 1 | 2 | 3 | "mechdog";

type UnitForm = {
  activityType: "python" | "mechdog";
  nameKo: string;
  nameEn: string;
  groupName: string;
  level: number;
  orderIndex: number;
  description: string;
  exampleCode: string;
  practiceCode: string;
};

type AssignableClass = {
  grade: number;
  classNumber: number;
};

const emptyUnit: UnitForm = {
  activityType: "python",
  nameKo: "",
  nameEn: "",
  groupName: "기타",
  level: 1,
  orderIndex: 0,
  description: "",
  exampleCode: "",
  practiceCode: "",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1.5px solid #E0D9F5",
  borderRadius: 10,
  fontFamily: "inherit",
  fontSize: 12.5,
  lineHeight: 1.45,
  color: "#3D2E8A",
  background: "#fff",
};

export default function TeacherCurriculumManager() {
  const actionLockRef = useRef(false);
  const [curricula, setCurricula] = useState<CurriculumSummary[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState(emptyUnit);
  const [unitLevelFilter, setUnitLevelFilter] = useState<UnitLevelFilter>(1);
  const [activeCodeTab, setActiveCodeTab] = useState<"example" | "practice">("example");
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [runningCode, setRunningCode] = useState(false);
  const [runOutput, setRunOutput] = useState("");
  const [runError, setRunError] = useState("");
  const [hasRunCode, setHasRunCode] = useState(false);
  const [newName, setNewName] = useState("");
  const [cloneFromId, setCloneFromId] = useState<number | "">("");
  const [assignableClasses, setAssignableClasses] = useState<AssignableClass[]>([]);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedAssignmentKeys, setSelectedAssignmentKeys] = useState<string[]>([]);
  const [assignmentModalError, setAssignmentModalError] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingAction, setPendingAction] = useState<"create" | "assign" | "add-unit" | "save-unit" | "delete-unit" | "delete-level" | null>(null);

  const selectedCurriculum = curricula.find((item) => item.id === selectedCurriculumId);
  const selectedUnit = units.find((item) =>
    item.id === selectedUnitId && (unitLevelFilter === "mechdog"
      ? item.activityType === "mechdog"
      : item.activityType === "python" && item.level === unitLevelFilter)
  );
  const assignmentGroups = assignableClasses.reduce<Record<number, AssignableClass[]>>((groups, item) => {
    (groups[item.grade] ??= []).push(item);
    return groups;
  }, {});
  const visibleUnits = units.filter((item) => unitLevelFilter === "mechdog"
    ? item.activityType === "mechdog"
    : item.activityType === "python" && item.level === unitLevelFilter);
  const activeCode = activeCodeTab === "example" ? unitForm.exampleCode : unitForm.practiceCode;
  const { loading: pyLoading, error: pyError, lv3Loading, initLv3, executeCode } = usePyodide();

  const loadCurricula = useCallback(async () => {
    const response = await fetch("/api/admin/curricula");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "커리큘럼을 불러오지 못했습니다.");
    setCurricula(data.curricula ?? []);
    const nextAssignableClasses: AssignableClass[] = data.assignableClasses ?? [];
    setAssignableClasses(nextAssignableClasses);
    setCloneFromId((current) => current || data.curricula?.find((item: CurriculumSummary) => item.isDefault)?.id || "");
    setSelectedCurriculumId((current) => {
      if (current && data.curricula?.some((item: CurriculumSummary) => item.id === current && item.canEdit)) return current;
      return data.curricula?.find((item: CurriculumSummary) => item.canEdit)?.id ?? null;
    });
  }, []);

  const loadUnits = useCallback(async (curriculumId: number) => {
    const response = await fetch(`/api/admin/curricula/${curriculumId}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "단원을 불러오지 못했습니다.");
    const nextUnits: Unit[] = [
      ...(data.units ?? []).map((item: Omit<Unit, "activityType">) => ({ ...item, activityType: "python" as const })),
      ...(data.mechdogUnits ?? []).map((item: Omit<Unit, "activityType" | "level" | "practiceCode">) => ({
        ...item,
        activityType: "mechdog" as const,
        level: 1,
        practiceCode: null,
      })),
    ];
    setUnits(nextUnits);
    setSelectedUnitId((current) => nextUnits.some((item) =>
      item.id === current && (unitLevelFilter === "mechdog"
        ? item.activityType === "mechdog"
        : item.activityType === "python" && item.level === unitLevelFilter)
    ) ? current : nextUnits.find((item) => unitLevelFilter === "mechdog"
      ? item.activityType === "mechdog"
      : item.activityType === "python" && item.level === unitLevelFilter)?.id ?? null);
  }, [unitLevelFilter]);

  useEffect(() => {
    loadCurricula().catch((error) => setMessage(error instanceof Error ? error.message : "조회 오류"));
  }, [loadCurricula]);

  useEffect(() => {
    if (!selectedCurriculumId) {
      setUnits([]);
      return;
    }
    loadUnits(selectedCurriculumId).catch((error) => setMessage(error instanceof Error ? error.message : "조회 오류"));
  }, [selectedCurriculumId, loadUnits]);

  useEffect(() => {
    if (!selectedUnit) {
      setUnitForm(emptyUnit);
      return;
    }
    if (selectedUnit.activityType === "mechdog") setActiveCodeTab("example");
    setUnitLevelFilter(selectedUnit.activityType === "mechdog" ? "mechdog" : selectedUnit.level as 1 | 2 | 3);
    setUnitForm({
      activityType: selectedUnit.activityType,
      nameKo: selectedUnit.nameKo,
      nameEn: selectedUnit.nameEn,
      groupName: selectedUnit.groupName,
      level: selectedUnit.level,
      orderIndex: selectedUnit.orderIndex,
      description: selectedUnit.description ?? "",
      exampleCode: selectedUnit.exampleCode ?? "",
      practiceCode: selectedUnit.practiceCode ?? "",
    });
  }, [selectedUnit]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!assignmentModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !actionLockRef.current) setAssignmentModalOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [assignmentModalOpen]);

  useEffect(() => {
    setHasRunCode(false);
    setRunOutput("");
    setRunError("");
    setCursorPosition({ line: 1, column: 1 });
  }, [selectedUnitId, activeCodeTab]);

  function updateActiveCode(value: string) {
    setUnitForm((current) => ({
      ...current,
      [activeCodeTab === "example" ? "exampleCode" : "practiceCode"]: value,
    }));
    setHasRunCode(false);
    setRunOutput("");
    setRunError("");
  }

  async function runActiveCode() {
    if (runningCode || pyLoading || !activeCode.trim()) return;
    setRunningCode(true);
    setHasRunCode(true);
    setRunOutput("");
    setRunError("");

    try {
      if (unitForm.level === 3) await initLv3();
      const result = await executeCode(activeCode, unitForm.level === 3 ? "lv3" : undefined);
      setRunOutput(result.stdout);
      setRunError(result.stderr);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : "코드를 실행하지 못했습니다.");
    } finally {
      setRunningCode(false);
    }
  }

  async function createCurriculum() {
    if (!newName.trim() || busy || actionLockRef.current) return;
    actionLockRef.current = true;
    setBusy(true);
    setPendingAction("create");
    setMessage("");
    try {
      const response = await fetch("/api/admin/curricula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, cloneFromId: cloneFromId || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "커리큘럼 생성에 실패했습니다.");
      setNewName("");
      await loadCurricula();
      setSelectedCurriculumId(data.curriculum.id);
      setMessage("커리큘럼을 만들었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "생성 오류");
    } finally {
      actionLockRef.current = false;
      setPendingAction(null);
      setBusy(false);
    }
  }

  async function addUnit() {
    if (!selectedCurriculumId || busy) return;
    setBusy(true);
    setPendingAction("add-unit");
    try {
      const isMechdog = unitLevelFilter === "mechdog";
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/${isMechdog ? "mechdog-units" : "units"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameKo: isMechdog ? "새 Mechdog 단원" : `새 Lv.${unitLevelFilter} 단원`,
          nameEn: isMechdog ? "" : `new_unit_${Date.now()}`,
          groupName: isMechdog ? "Mechdog 실습" : "새 단원",
          level: isMechdog ? 1 : unitLevelFilter,
          description: "단원 설명을 입력하세요.",
          exampleCode: isMechdog ? "from HW_MechDog import MechDog\n\nmechdog = MechDog()\n" : "# 예제 코드를 입력하세요.",
          practiceCode: isMechdog ? "" : "# 문제를 입력하세요.",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "단원 추가에 실패했습니다.");
      await loadUnits(selectedCurriculumId);
      setSelectedUnitId(data.unit.id);
      setMessage(isMechdog ? "새 Mechdog 단원을 추가했습니다." : `Lv.${unitLevelFilter}에 새 단원을 추가했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "추가 오류");
    } finally {
      setPendingAction(null);
      setBusy(false);
    }
  }

  async function saveUnit() {
    if (!selectedCurriculumId || !selectedUnitId || busy) return;
    setBusy(true);
    setPendingAction("save-unit");
    try {
      const path = selectedUnit?.activityType === "mechdog" ? "mechdog-units" : "units";
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/${path}/${selectedUnitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "단원 저장에 실패했습니다.");
      await loadUnits(selectedCurriculumId);
      setMessage("단원을 저장했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장 오류");
    } finally {
      setPendingAction(null);
      setBusy(false);
    }
  }

  async function deleteUnit() {
    if (!selectedCurriculumId || !selectedUnitId || busy || !confirm("이 단원을 삭제할까요? 기존 학생 기록은 보존됩니다.")) return;
    setBusy(true);
    setPendingAction("delete-unit");
    try {
      const path = selectedUnit?.activityType === "mechdog" ? "mechdog-units" : "units";
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/${path}/${selectedUnitId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "단원 삭제에 실패했습니다.");
      setSelectedUnitId(null);
      await loadUnits(selectedCurriculumId);
      setMessage("단원을 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "삭제 오류");
    } finally {
      setPendingAction(null);
      setBusy(false);
    }
  }

  async function deleteCurrentLevel() {
    if (!selectedCurriculumId || visibleUnits.length === 0 || busy) return;
    const label = unitLevelFilter === "mechdog" ? "Mechdog" : `Lv.${unitLevelFilter}`;
    if (!confirm(`${label}의 단원 ${visibleUnits.length}개를 모두 삭제할까요? 기존 학생 기록은 보존됩니다.`)) return;

    setBusy(true);
    setPendingAction("delete-level");
    try {
      const path = unitLevelFilter === "mechdog"
        ? "mechdog-units"
        : `units?level=${unitLevelFilter}`;
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/${path}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? `${label} 전체 삭제에 실패했습니다.`);
      setSelectedUnitId(null);
      await loadUnits(selectedCurriculumId);
      setMessage(`${label} 단원 ${data.deletedCount ?? visibleUnits.length}개를 삭제했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "레벨 전체 삭제 오류");
    } finally {
      setPendingAction(null);
      setBusy(false);
    }
  }

  function openAssignmentModal() {
    if (!selectedCurriculum) return;
    const assignableKeys = new Set(assignableClasses.map((item) => `${item.grade}:${item.classNumber}`));
    setSelectedAssignmentKeys(selectedCurriculum.assignments
      .map((item) => `${item.grade}:${item.classNumber}`)
      .filter((key) => assignableKeys.has(key)));
    setAssignmentModalError("");
    setAssignmentModalOpen(true);
  }

  function toggleAssignment(key: string) {
    setSelectedAssignmentKeys((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]);
  }

  function toggleGradeAssignments(classes: AssignableClass[]) {
    const keys = classes.map((item) => `${item.grade}:${item.classNumber}`);
    const allSelected = keys.every((key) => selectedAssignmentKeys.includes(key));
    setSelectedAssignmentKeys((current) => allSelected
      ? current.filter((key) => !keys.includes(key))
      : Array.from(new Set([...current, ...keys])));
  }

  async function saveCurriculumAssignments() {
    if (!selectedCurriculumId || busy || actionLockRef.current) return;
    actionLockRef.current = true;
    setBusy(true);
    setPendingAction("assign");
    setAssignmentModalError("");
    setToast("");
    try {
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/assign`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classes: selectedAssignmentKeys.map((key) => {
            const [grade, classNumber] = key.split(":").map(Number);
            return { grade, classNumber };
          }),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "학급 배정 저장에 실패했습니다.");
      await loadCurricula();
      setAssignmentModalOpen(false);
      setToast("학급 배정을 저장했습니다.");
    } catch (error) {
      setAssignmentModalError(error instanceof Error ? error.message : "학급 배정 저장 오류");
    } finally {
      actionLockRef.current = false;
      setPendingAction(null);
      setBusy(false);
    }
  }

  return (
    <div className={styles.managerLayout}>
      {toast && (
        <div className={styles.successToast} role="status" aria-live="polite">
          <CheckCircle2 size={17} />
          {toast}
        </div>
      )}
      <aside style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, padding: 16, alignSelf: "start" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#3D2E8A", marginBottom: 12 }}>내 커리큘럼</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {curricula.map((item) => (
            <button
              key={item.id}
              aria-pressed={selectedCurriculumId === item.id}
              disabled={!item.canEdit}
              onClick={() => item.canEdit && setSelectedCurriculumId(item.id)}
              style={{
                textAlign: "left",
                padding: "10px 11px",
                border: "none",
                borderRadius: 10,
                background: selectedCurriculumId === item.id ? "#7B5CF0" : item.isDefault ? "#F4F0FE" : "#FAF9FD",
                color: selectedCurriculumId === item.id ? "#fff" : item.canEdit ? "#544D70" : "#9A93B5",
                cursor: item.canEdit ? "pointer" : "default",
                fontWeight: 700,
                fontFamily: "inherit",
                fontSize: 12.5,
                lineHeight: 1.35,
              }}
              title={!item.canEdit ? "복제해서 편집할 수 있는 기본 템플릿입니다." : undefined}
            >
              {item.name}{item.isDefault ? " · 기본" : ""}
            </button>
          ))}
        </div>

        <div style={{ borderTop: "1px solid #EFEAF8", marginTop: 16, paddingTop: 16 }}>
          <input style={{ ...inputStyle, marginBottom: 8 }} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="새 커리큘럼 이름" />
          <select style={{ ...inputStyle, marginBottom: 8 }} value={cloneFromId} onChange={(e) => setCloneFromId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">빈 커리큘럼</option>
            {curricula.map((item) => <option key={item.id} value={item.id}>{item.name} 복제</option>)}
          </select>
          <button
            onClick={createCurriculum}
            disabled={busy || !newName.trim()}
            aria-busy={pendingAction === "create"}
            className={styles.actionButton}
            style={{ width: "100%", padding: 10, border: "none", borderRadius: 10, background: "#18C99A", color: "#fff", fontWeight: 800 }}
          >
            {pendingAction === "create"
              ? <><LoaderCircle size={14} className={styles.spin} /> 만드는 중...</>
              : <><BookCopy size={14} /> 내 커리큘럼 만들기</>}
          </button>
        </div>
      </aside>

      <main style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {message && <div role="status" aria-live="polite" style={{ padding: "10px 14px", borderRadius: 12, background: "#F4F0FE", color: "#5B4B99", fontWeight: 700, fontSize: 13 }}>{message}</div>}
        {!selectedCurriculum ? (
          <div style={{ background: "#fff", borderRadius: 20, padding: 30, color: "#8B83A8" }}>기본 커리큘럼을 복제하거나 새 커리큘럼을 만드세요.</div>
        ) : (
          <>
            <section style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, padding: 18, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.35, color: "#3D2E8A" }}>{selectedCurriculum.name}</div>
                <div style={{ fontSize: 12.5, color: "#8B83A8", marginTop: 3 }}>{units.length}개 단원 · 삭제한 단원의 학생 기록은 유지됩니다.</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 7 }}>
                  {selectedCurriculum.assignments.length > 0
                    ? selectedCurriculum.assignments.map((assignment) => (
                        <span key={`${assignment.grade}:${assignment.classNumber}`} style={{ padding: "3px 7px", borderRadius: 99, background: "#F1ECFD", color: "#6C4BEF", fontSize: 11, fontWeight: 700 }}>
                          {assignment.grade}학년 {assignment.classNumber}반
                        </span>
                      ))
                    : <span style={{ color: "#A39CC0", fontSize: 11.5 }}>아직 배정된 학급이 없습니다.</span>}
                </div>
              </div>
              <button
                type="button"
                onClick={openAssignmentModal}
                disabled={busy}
                className={styles.actionButton}
                style={{ padding: "10px 14px", border: "none", borderRadius: 10, background: "#7B5CF0", color: "#fff", fontWeight: 800 }}
              >
                <School size={14} /> 학급 배정 관리
              </button>
            </section>

            <div className={styles.workspaceGrid}>
              <section className={styles.unitMapCard} aria-labelledby="curriculum-map-title">
                <div className={styles.unitMapHeading}>
                  <div>
                    <div className={styles.sectionKicker}><Map size={14} /> CURRICULUM MAP</div>
                    <h3 id="curriculum-map-title">단원 구성</h3>
                  </div>
                  <button type="button" onClick={addUnit} disabled={busy} className={styles.addUnitButton}>
                    {pendingAction === "add-unit" ? <><LoaderCircle size={14} className={styles.spin} /> 추가 중...</> : <><Plus size={14} /> {unitLevelFilter === "mechdog" ? "Mechdog 단원 추가" : `Lv.${unitLevelFilter} 단원 추가`}</>}
                  </button>
                </div>

                <div className={styles.levelTabs} role="tablist" aria-label="편집할 레벨 선택">
                  {([1, 2, 3, "mechdog"] as const).map((level) => {
                    const count = units.filter((unit) => level === "mechdog"
                      ? unit.activityType === "mechdog"
                      : unit.activityType === "python" && unit.level === level).length;
                    return (
                      <button
                        key={level}
                        type="button"
                        role="tab"
                        aria-selected={unitLevelFilter === level}
                        data-level={level === "mechdog" ? undefined : level}
                        data-activity={level === "mechdog" ? "mechdog" : "python"}
                        className={unitLevelFilter === level ? styles.levelTabActive : ""}
                        onClick={() => {
                          setUnitLevelFilter(level);
                          const firstUnit = units.find((unit) => level === "mechdog"
                            ? unit.activityType === "mechdog"
                            : unit.activityType === "python" && unit.level === level);
                          setSelectedUnitId(firstUnit?.id ?? null);
                        }}
                      >
                        <strong>{level === "mechdog" ? "Mechdog" : `Lv.${level}`}</strong>
                        <span>{count}개</span>
                      </button>
                    );
                  })}
                </div>

                {visibleUnits.length > 0 && (
                  <div className={styles.levelActions}>
                    <button type="button" onClick={deleteCurrentLevel} disabled={busy} aria-busy={pendingAction === "delete-level"}>
                      {pendingAction === "delete-level"
                        ? <><LoaderCircle size={13} className={styles.spin} /> 전체 삭제 중...</>
                        : <><Trash2 size={13} /> {unitLevelFilter === "mechdog" ? "Mechdog 전체 삭제" : `Lv.${unitLevelFilter} 전체 삭제`}</>}
                    </button>
                  </div>
                )}

                <div className={styles.unitList}>
                  {visibleUnits.length === 0 ? (
                    <div className={styles.emptyLevel}>
                      <Sparkles size={20} />
                      <strong>아직 단원이 없습니다</strong>
                      <span>{unitLevelFilter === "mechdog" ? "Mechdog 단원을 추가해 주세요." : `Lv.${unitLevelFilter} 단원을 추가해 주세요.`}</span>
                    </div>
                  ) : visibleUnits.map((unit, index) => {
                    const active = selectedUnitId === unit.id;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        aria-pressed={active}
                        data-level={unit.activityType === "mechdog" ? undefined : unit.level}
                        data-activity={unit.activityType}
                        className={`${styles.unitRow} ${active ? styles.unitRowActive : ""}`}
                        onClick={() => setSelectedUnitId(unit.id)}
                      >
                        <span className={styles.unitNode} aria-hidden="true">
                          {active ? <PencilLine size={15} /> : <Circle size={14} />}
                          {index < visibleUnits.length - 1 && <i />}
                        </span>
                        <span className={styles.unitCopy}>
                          <strong>{unit.nameKo}</strong>
                          <small>{unit.groupName} · {unit.nameEn}</small>
                        </span>
                        <em>{active ? "편집 중" : `${unit.orderIndex + 1}번째`}</em>
                      </button>
                    );
                  })}
                </div>
              </section>

              {selectedUnit && (
                <section className={styles.editorCard} aria-labelledby="unit-editor-title">
                  <div className={styles.editorHeading}>
                    <div>
                      <div className={styles.sectionKicker}><PencilLine size={14} /> UNIT EDITOR</div>
                      <h3 id="unit-editor-title">{selectedUnit.nameKo}</h3>
                      <p>{unitForm.activityType === "mechdog" ? "학생 Mechdog 시뮬레이션에 표시될 단원과 코드를 편집합니다." : "학생 대시보드에 표시될 단원 정보와 코드를 편집합니다."}</p>
                    </div>
                    <span data-level={unitForm.activityType === "mechdog" ? undefined : unitForm.level} data-activity={unitForm.activityType}>
                      {unitForm.activityType === "mechdog" ? "Mechdog" : `Lv.${unitForm.level}`}
                    </span>
                  </div>

                  <div className={styles.basicFields}>
                    <label>
                      <span>한글 단원명</span>
                      <input style={inputStyle} value={unitForm.nameKo} onChange={(e) => setUnitForm({ ...unitForm, nameKo: e.target.value })} placeholder="한글 단원명" />
                    </label>
                    <label>
                      <span>영문 단원명</span>
                      <input style={inputStyle} value={unitForm.nameEn} onChange={(e) => setUnitForm({ ...unitForm, nameEn: e.target.value })} placeholder="영문 단원명" />
                    </label>
                    <label>
                      <span>그룹</span>
                      <input style={inputStyle} value={unitForm.groupName} onChange={(e) => setUnitForm({ ...unitForm, groupName: e.target.value })} placeholder="그룹명" />
                    </label>
                    {unitForm.activityType === "python" && (
                      <label>
                        <span>레벨</span>
                        <select style={inputStyle} value={unitForm.level} onChange={(e) => setUnitForm({ ...unitForm, level: Number(e.target.value) })}>
                          <option value={1}>Lv.1</option>
                          <option value={2}>Lv.2</option>
                          <option value={3}>Lv.3</option>
                        </select>
                      </label>
                    )}
                    <label>
                      <span>표시 순서</span>
                      <input style={inputStyle} type="number" min={0} value={unitForm.orderIndex} onChange={(e) => setUnitForm({ ...unitForm, orderIndex: Number(e.target.value) })} />
                    </label>
                  </div>

                  <label className={styles.descriptionField}>
                    <span>학생 안내</span>
                    <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} placeholder="학생에게 보일 설명" />
                  </label>

                  <div className={styles.codeWorkbench}>
                    <div className={styles.codeTitlebar}>
                      <div className={styles.windowDots} aria-hidden="true">
                        <i /><i /><i />
                      </div>
                      <div className={styles.codeTabs} role="tablist" aria-label="코드 종류 선택">
                        <button
                          type="button"
                          role="tab"
                          aria-selected={activeCodeTab === "example"}
                          className={activeCodeTab === "example" ? styles.codeTabActive : ""}
                          onClick={() => setActiveCodeTab("example")}
                        >
                          <Code2 size={13} /> 예제 코드
                        </button>
                        {unitForm.activityType === "python" && (
                          <button
                            type="button"
                            role="tab"
                            aria-selected={activeCodeTab === "practice"}
                            className={activeCodeTab === "practice" ? styles.codeTabActive : ""}
                            onClick={() => setActiveCodeTab("practice")}
                          >
                            <Code2 size={13} /> 문제 코드
                          </button>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.runCodeButton}
                        onClick={() => void runActiveCode()}
                        disabled={runningCode || pyLoading || lv3Loading || !activeCode.trim()}
                        title={pyError ?? `${activeCodeTab === "example" ? "예제" : "문제"} 코드를 실행합니다.`}
                      >
                        {runningCode || lv3Loading ? <LoaderCircle size={14} className={styles.spin} /> : <Play size={14} fill="currentColor" />}
                        {pyLoading ? "Python 준비 중" : runningCode || lv3Loading ? "실행 중" : "코드 실행"}
                      </button>
                    </div>

                    <div className={styles.codeEditorBody}>
                      <CodeEditor
                        value={activeCode}
                        onChange={updateActiveCode}
                        onCursorChange={setCursorPosition}
                        fontSize="9pt"
                      />
                    </div>

                    <div className={styles.codeStatusbar} aria-label="코드 편집기 상태">
                      <span><i /> Python 3</span>
                      <span>{activeCode.split(/\r?\n/).length} lines</span>
                      <span>{activeCodeTab === "example" ? "예제 코드" : "문제 코드"}</span>
                      <span className={styles.cursorStatus}>Ln {cursorPosition.line}, Col {cursorPosition.column}</span>
                      <span>Spaces: 4</span>
                      <span>UTF-8</span>
                    </div>
                  </div>

                  {(hasRunCode || pyError) && (
                    <div className={styles.executionResult}>
                      <div className={styles.executionHeading}>
                        <span><Play size={12} fill="currentColor" /> 실행 결과</span>
                        <small>{activeCodeTab === "example" ? "예제 코드" : "문제 코드"} 기준</small>
                      </div>
                      <OutputPanel output={runOutput} error={runError || pyError || ""} hasRun={hasRunCode || Boolean(pyError)} />
                    </div>
                  )}

                  <div className={styles.editorActions}>
                    <button onClick={saveUnit} disabled={busy} className={styles.saveButton}>
                      {pendingAction === "save-unit" ? <><LoaderCircle size={14} className={styles.spin} /> 저장 중...</> : <><Save size={14} style={{ verticalAlign: "middle", marginRight: 5 }} /> 저장</>}
                    </button>
                    <button onClick={deleteUnit} disabled={busy} className={styles.deleteButton}>
                      {pendingAction === "delete-unit" ? <><LoaderCircle size={14} className={styles.spin} /> 삭제 중...</> : <><Trash2 size={14} style={{ verticalAlign: "middle", marginRight: 5 }} /> 선택 단원 삭제</>}
                    </button>
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </main>

      {assignmentModalOpen && selectedCurriculum && (
        <div className={styles.assignmentModalOverlay} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !busy) setAssignmentModalOpen(false);
        }}>
          <section className={styles.assignmentModal} role="dialog" aria-modal="true" aria-labelledby="assignment-modal-title">
            <header className={styles.assignmentModalHeader}>
              <div>
                <span>CURRICULUM CLASS</span>
                <h3 id="assignment-modal-title">학급 배정</h3>
                <p><strong>{selectedCurriculum.name}</strong> 커리큘럼을 적용할 담당 학급을 선택하세요.</p>
              </div>
              <button type="button" onClick={() => setAssignmentModalOpen(false)} disabled={busy} aria-label="학급 배정 창 닫기">
                <X size={20} />
              </button>
            </header>

            <div className={styles.assignmentModalSummary}>
              <span><School size={15} /> 담당 학급 {assignableClasses.length}개</span>
              <strong>{selectedAssignmentKeys.length}개 선택</strong>
            </div>

            <div className={styles.assignmentModalBody}>
              {assignableClasses.length === 0 ? (
                <div className={styles.assignmentEmpty}>
                  <School size={24} />
                  <strong>배정 가능한 담당 학급이 없습니다.</strong>
                  <span>관리자가 설정에서 담당 학급을 먼저 배정해야 합니다.</span>
                </div>
              ) : Object.entries(assignmentGroups).map(([grade, classes]) => {
                const gradeKeys = classes.map((item) => `${item.grade}:${item.classNumber}`);
                const allSelected = gradeKeys.every((key) => selectedAssignmentKeys.includes(key));
                return (
                  <div className={styles.assignmentGradeGroup} key={grade}>
                    <div className={styles.assignmentGradeHeader}>
                      <strong>{grade}학년</strong>
                      <button type="button" onClick={() => toggleGradeAssignments(classes)} disabled={busy}>
                        {allSelected ? "전체 해제" : "전체 선택"}
                      </button>
                    </div>
                    <div className={styles.assignmentClassGrid}>
                      {classes.map((item) => {
                        const key = `${item.grade}:${item.classNumber}`;
                        const selected = selectedAssignmentKeys.includes(key);
                        return (
                          <button
                            type="button"
                            key={key}
                            className={selected ? styles.assignmentClassSelected : styles.assignmentClassButton}
                            aria-pressed={selected}
                            onClick={() => toggleAssignment(key)}
                            disabled={busy}
                          >
                            <span>{selected ? <Check size={15} /> : null}</span>
                            {item.classNumber}반
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {assignmentModalError && <div className={styles.assignmentModalError} role="alert">{assignmentModalError}</div>}

            <footer className={styles.assignmentModalFooter}>
              <button type="button" onClick={() => setAssignmentModalOpen(false)} disabled={busy}>취소</button>
              <button
                type="button"
                onClick={saveCurriculumAssignments}
                disabled={busy || assignableClasses.length === 0}
                aria-busy={pendingAction === "assign"}
              >
                {pendingAction === "assign"
                  ? <><LoaderCircle size={15} className={styles.spin} /> 저장 중...</>
                  : <><Save size={15} /> 선택한 학급 저장</>}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
