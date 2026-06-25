"use client";

import { useState } from "react";

interface Concept {
  id: number;
  nameKo: string;
  nameEn: string;
  orderIndex: number;
  description: string | null;
  exampleCode: string | null;
  practiceCode: string | null;
}

interface AdminClientProps {
  concepts: Concept[];
}

interface EditData {
  description: string;
  exampleCode: string;
  practiceCode: string;
}

export default function AdminClient({ concepts: initialConcepts }: AdminClientProps) {
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

  const UNIT_GROUPS = [
    { label: "자료형", emoji: "📦", ids: [1, 2, 7, 8, 9, 10] },
    { label: "연산자", emoji: "🔢", ids: [3, 4, 5, 6] },
    { label: "제어문", emoji: "🔀", ids: [11, 12, 13] },
    { label: "함수/클래스", emoji: "⚙️", ids: [14, 15, 16] },
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

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 20,
          padding: "20px 28px 28px",
          maxWidth: 1200,
          width: "100%",
          margin: "0 auto",
          boxSizing: "border-box",
        }}
      >
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
          <div style={{ padding: "8px 8px 12px" }}>
            {UNIT_GROUPS.map((group) => (
              <div key={group.label} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "#C8C0DE",
                    letterSpacing: 0.5,
                    padding: "6px 8px 3px",
                    textTransform: "uppercase" as const,
                  }}
                >
                  {group.emoji} {group.label}
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
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
