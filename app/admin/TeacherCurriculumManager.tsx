"use client";

import { useCallback, useEffect, useState } from "react";
import { BookCopy, Plus, Save, School, Trash2 } from "lucide-react";

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
  color: "#3D2E8A",
  background: "#fff",
};

export default function TeacherCurriculumManager() {
  const [curricula, setCurricula] = useState<CurriculumSummary[]>([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<number | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState(emptyUnit);
  const [newName, setNewName] = useState("");
  const [cloneFromId, setCloneFromId] = useState<number | "">("");
  const [assignGrade, setAssignGrade] = useState(1);
  const [assignClass, setAssignClass] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedCurriculum = curricula.find((item) => item.id === selectedCurriculumId);
  const selectedUnit = units.find((item) => item.id === selectedUnitId);

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
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", gap: 16 }}>
      <aside style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, padding: 16, alignSelf: "start" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#3D2E8A", marginBottom: 12 }}>내 커리큘럼</div>
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
                <div style={{ fontSize: 18, fontWeight: 900, color: "#3D2E8A" }}>{selectedCurriculum.name}</div>
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

            <div style={{ display: "grid", gridTemplateColumns: "220px minmax(0, 1fr)", gap: 12 }}>
              <section style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, padding: 12, alignSelf: "start" }}>
                <button onClick={addUnit} disabled={busy} style={{ width: "100%", padding: 10, border: "1.5px dashed #9B7FFF", borderRadius: 10, background: "#F8F5FF", color: "#7B5CF0", fontWeight: 800, cursor: "pointer", marginBottom: 10 }}>
                  <Plus size={14} style={{ verticalAlign: "middle" }} /> 단원 추가
                </button>
                {units.map((unit) => (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnitId(unit.id)}
                    style={{ width: "100%", textAlign: "left", border: "none", borderRadius: 9, padding: "9px 10px", marginBottom: 4, background: selectedUnitId === unit.id ? "#7B5CF0" : "transparent", color: selectedUnitId === unit.id ? "#fff" : "#655D80", cursor: "pointer" }}
                  >
                    <strong>Lv.{unit.level}</strong> {unit.nameKo}
                  </button>
                ))}
              </section>

              {selectedUnit && (
                <section style={{ background: "#fff", border: "1px solid #EFEAF8", borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 90px 90px", gap: 8 }}>
                    <input style={inputStyle} value={unitForm.nameKo} onChange={(e) => setUnitForm({ ...unitForm, nameKo: e.target.value })} placeholder="한글 단원명" />
                    <input style={inputStyle} value={unitForm.nameEn} onChange={(e) => setUnitForm({ ...unitForm, nameEn: e.target.value })} placeholder="영문 단원명" />
                    <input style={inputStyle} value={unitForm.groupName} onChange={(e) => setUnitForm({ ...unitForm, groupName: e.target.value })} placeholder="그룹명" />
                    <input style={inputStyle} type="number" min={1} max={3} value={unitForm.level} onChange={(e) => setUnitForm({ ...unitForm, level: Number(e.target.value) })} title="레벨" />
                    <input style={inputStyle} type="number" min={0} value={unitForm.orderIndex} onChange={(e) => setUnitForm({ ...unitForm, orderIndex: Number(e.target.value) })} title="순서" />
                  </div>
                  <textarea style={{ ...inputStyle, resize: "vertical" }} rows={3} value={unitForm.description} onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })} placeholder="학생에게 보일 설명" />
                  <textarea style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace" }} rows={10} value={unitForm.exampleCode} onChange={(e) => setUnitForm({ ...unitForm, exampleCode: e.target.value })} placeholder="예제 코드" />
                  <textarea style={{ ...inputStyle, resize: "vertical", fontFamily: "monospace" }} rows={10} value={unitForm.practiceCode} onChange={(e) => setUnitForm({ ...unitForm, practiceCode: e.target.value })} placeholder="문제 코드" />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={saveUnit} disabled={busy} style={{ padding: "11px 18px", border: "none", borderRadius: 10, background: "#18C99A", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
                      <Save size={14} style={{ verticalAlign: "middle", marginRight: 5 }} /> 저장
                    </button>
                    <button onClick={deleteUnit} disabled={busy} style={{ padding: "11px 18px", border: "none", borderRadius: 10, background: "#FFE8EF", color: "#D93668", fontWeight: 800, cursor: "pointer" }}>
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
