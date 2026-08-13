"use client";

import { useCallback, useEffect, useState } from "react";
import { BookCopy, Circle, Code2, LoaderCircle, Map, PencilLine, Play, Plus, Save, School, Sparkles, Trash2 } from "lucide-react";
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
  nameKo: string;
  nameEn: string;
  groupName: string;
  level: number;
  orderIndex: number;
  description: string | null;
  exampleCode: string | null;
  practiceCode: string | null;
};

const emptyUnit = {
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
  const [curricula, setCurricula] = useState<CurriculumSummary[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState(emptyUnit);
  const [unitLevelFilter, setUnitLevelFilter] = useState(1);
  const [activeCodeTab, setActiveCodeTab] = useState<"example" | "practice">("example");
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [runningCode, setRunningCode] = useState(false);
  const [runOutput, setRunOutput] = useState("");
  const [runError, setRunError] = useState("");
  const [hasRunCode, setHasRunCode] = useState(false);
  const [newName, setNewName] = useState("");
  const [cloneFromId, setCloneFromId] = useState<number | "">("");
  const [assignGrade, setAssignGrade] = useState(1);
  const [assignClass, setAssignClass] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedCurriculum = curricula.find((item) => item.id === selectedCurriculumId);
  const selectedUnit = units.find((item) => item.id === selectedUnitId);
  const visibleUnits = units.filter((item) => item.level === unitLevelFilter);
  const activeCode = activeCodeTab === "example" ? unitForm.exampleCode : unitForm.practiceCode;
  const { loading: pyLoading, error: pyError, lv3Loading, initLv3, executeCode } = usePyodide();

  const loadCurricula = useCallback(async () => {
    const response = await fetch("/api/admin/curricula");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "커리큘럼을 불러오지 못했습니다.");
    setCurricula(data.curricula ?? []);
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
    setUnits(data.units ?? []);
    setSelectedUnitId((current) => data.units?.some((item: Unit) => item.id === current) ? current : data.units?.[0]?.id ?? null);
  }, []);

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
    setUnitLevelFilter(selectedUnit.level);
    setUnitForm({
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
    if (!newName.trim() || busy) return;
    setBusy(true);
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
      setBusy(false);
    }
  }

  async function addUnit() {
    if (!selectedCurriculumId || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/units`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameKo: "새 단원",
          nameEn: "new_unit",
          groupName: "새 단원",
          level: 1,
          description: "단원 설명을 입력하세요.",
          exampleCode: "# 예제 코드를 입력하세요.",
          practiceCode: "# 문제를 입력하세요.",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "단원 추가에 실패했습니다.");
      await loadUnits(selectedCurriculumId);
      setSelectedUnitId(data.unit.id);
      setMessage("새 단원을 추가했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "추가 오류");
    } finally {
      setBusy(false);
    }
  }

  async function saveUnit() {
    if (!selectedCurriculumId || !selectedUnitId || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/units/${selectedUnitId}`, {
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
      setBusy(false);
    }
  }

  async function deleteUnit() {
    if (!selectedCurriculumId || !selectedUnitId || busy || !confirm("이 단원을 삭제할까요? 기존 학생 기록은 보존됩니다.")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/units/${selectedUnitId}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "단원 삭제에 실패했습니다.");
      setSelectedUnitId(null);
      await loadUnits(selectedCurriculumId);
      setMessage("단원을 삭제했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "삭제 오류");
    } finally {
      setBusy(false);
    }
  }

  async function assignCurriculum() {
    if (!selectedCurriculumId || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/curricula/${selectedCurriculumId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: assignGrade, classNumber: assignClass }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "학급 배정에 실패했습니다.");
      await loadCurricula();
      setMessage(`${assignGrade}학년 ${assignClass}반에 배정했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "배정 오류");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.managerLayout}>
      <aside style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, padding: 16, alignSelf: "start" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#3D2E8A", marginBottom: 12 }}>내 커리큘럼</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {curricula.map((item) => (
            <button
              key={item.id}
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
          <button onClick={createCurriculum} disabled={busy || !newName.trim()} style={{ width: "100%", padding: 10, border: "none", borderRadius: 10, background: "#18C99A", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
            <BookCopy size={14} style={{ verticalAlign: "middle", marginRight: 5 }} /> 만들기
          </button>
        </div>
      </aside>

      <main style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>
        {message && <div style={{ padding: "10px 14px", borderRadius: 12, background: "#F4F0FE", color: "#5B4B99", fontWeight: 700, fontSize: 13 }}>{message}</div>}
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
              <input type="number" min={1} max={12} value={assignGrade} onChange={(e) => setAssignGrade(Number(e.target.value))} style={{ ...inputStyle, width: 72 }} aria-label="학년" />
              <span>학년</span>
              <input type="number" min={1} max={99} value={assignClass} onChange={(e) => setAssignClass(Number(e.target.value))} style={{ ...inputStyle, width: 72 }} aria-label="반" />
              <span>반</span>
              <button onClick={assignCurriculum} disabled={busy} style={{ padding: "10px 14px", border: "none", borderRadius: 10, background: "#7B5CF0", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                <School size={14} style={{ verticalAlign: "middle", marginRight: 5 }} /> 학급 배정
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
                    <Plus size={14} /> 단원 추가
                  </button>
                </div>

                <div className={styles.levelTabs} role="tablist" aria-label="편집할 레벨 선택">
                  {([1, 2, 3] as const).map((level) => {
                    const count = units.filter((unit) => unit.level === level).length;
                    return (
                      <button
                        key={level}
                        type="button"
                        role="tab"
                        aria-selected={unitLevelFilter === level}
                        data-level={level}
                        className={unitLevelFilter === level ? styles.levelTabActive : ""}
                        onClick={() => {
                          setUnitLevelFilter(level);
                          const firstUnit = units.find((unit) => unit.level === level);
                          if (firstUnit) setSelectedUnitId(firstUnit.id);
                        }}
                      >
                        <strong>Lv.{level}</strong>
                        <span>{count}개</span>
                      </button>
                    );
                  })}
                </div>

                <div className={styles.unitList}>
                  {visibleUnits.length === 0 ? (
                    <div className={styles.emptyLevel}>
                      <Sparkles size={20} />
                      <strong>아직 단원이 없습니다</strong>
                      <span>단원을 추가한 뒤 레벨을 설정해 주세요.</span>
                    </div>
                  ) : visibleUnits.map((unit, index) => {
                    const active = selectedUnitId === unit.id;
                    return (
                      <button
                        key={unit.id}
                        type="button"
                        aria-pressed={active}
                        data-level={unit.level}
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
                      <p>학생 대시보드에 표시될 단원 정보와 코드를 편집합니다.</p>
                    </div>
                    <span data-level={unitForm.level}>Lv.{unitForm.level}</span>
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
                    <label>
                      <span>레벨</span>
                      <input style={inputStyle} type="number" min={1} max={3} value={unitForm.level} onChange={(e) => setUnitForm({ ...unitForm, level: Number(e.target.value) })} />
                    </label>
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
                        <button
                          type="button"
                          role="tab"
                          aria-selected={activeCodeTab === "practice"}
                          className={activeCodeTab === "practice" ? styles.codeTabActive : ""}
                          onClick={() => setActiveCodeTab("practice")}
                        >
                          <Code2 size={13} /> 문제 코드
                        </button>
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
                      <Save size={14} style={{ verticalAlign: "middle", marginRight: 5 }} /> 저장
                    </button>
                    <button onClick={deleteUnit} disabled={busy} className={styles.deleteButton}>
                      <Trash2 size={14} style={{ verticalAlign: "middle", marginRight: 5 }} /> 삭제
                    </button>
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
