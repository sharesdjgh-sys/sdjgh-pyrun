"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, Minus, Plus, School, Trash2, Upload } from "lucide-react";

type SchoolBranding = {
  id: number;
  name: string;
  logoUrl: string | null;
  logoScale: number;
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #EFEAF8",
  borderRadius: 20,
  background: "#fff",
  boxShadow: "0 8px 24px rgba(90,63,214,.06)",
};

export default function SchoolBrandingManager() {
  const [school, setSchool] = useState<SchoolBranding | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<"save" | "delete" | "scale-down" | "scale-up" | null>(null);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/school-branding", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "학교 정보를 불러오지 못했습니다.");
        setSchool(data.school);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "학교 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function chooseFile(file?: File) {
    setMessage("");
    if (!file) return;
    if (!(["image/png", "image/jpeg", "image/webp"].includes(file.type))) {
      setMessage("PNG, JPG 또는 WebP 이미지 파일을 선택해 주세요.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage("로고 이미지는 2MB 이하만 등록할 수 있습니다.");
      return;
    }
    setSelectedFile(file);
  }

  async function saveLogo() {
    if (!selectedFile || saving) return;
    setSaving(true);
    setPendingAction("save");
    setMessage("");
    const form = new FormData();
    form.append("logo", selectedFile);

    try {
      const response = await fetch("/api/school-branding", { method: "PUT", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "로고를 등록하지 못했습니다.");
      setSchool(data.school);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage("학교 로고를 등록했습니다. 학습 페이지 상단에 바로 반영됩니다.");
      window.dispatchEvent(new CustomEvent("school-branding-updated", { detail: data.school }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로고를 등록하지 못했습니다.");
    } finally {
      setPendingAction(null);
      setSaving(false);
    }
  }

  async function deleteLogo() {
    if (!school?.logoUrl || saving || !confirm("등록된 학교 로고를 삭제할까요?")) return;
    setSaving(true);
    setPendingAction("delete");
    setMessage("");
    try {
      const response = await fetch("/api/school-branding", { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "로고를 삭제하지 못했습니다.");
      setSchool(data.school);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage("학교 로고를 삭제했습니다.");
      window.dispatchEvent(new CustomEvent("school-branding-updated", { detail: data.school }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로고를 삭제하지 못했습니다.");
    } finally {
      setPendingAction(null);
      setSaving(false);
    }
  }

  async function updateLogoScale(logoScale: number) {
    if (!school || saving || logoScale < 70 || logoScale > 140) return;
    setSaving(true);
    setPendingAction(logoScale < school.logoScale ? "scale-down" : "scale-up");
    setMessage("");
    try {
      const response = await fetch("/api/school-branding", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logoScale }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "로고 크기를 변경하지 못했습니다.");
      setSchool(data.school);
      setMessage(`학교 로고 크기를 ${data.school.logoScale}%로 설정했습니다.`);
      window.dispatchEvent(new CustomEvent("school-branding-updated", { detail: data.school }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "로고 크기를 변경하지 못했습니다.");
    } finally {
      setPendingAction(null);
      setSaving(false);
    }
  }

  const visibleLogo = previewUrl ?? school?.logoUrl ?? null;
  const previewScale = Math.min(140, Math.max(70, school?.logoScale ?? 100)) / 100;

  return (
    <div style={{ flex: 1, minWidth: 0, display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(300px, .85fr)", gap: 18, alignItems: "start" }}>
      <section style={{ ...cardStyle, padding: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, color: "#3D2E8A", fontSize: 18, fontWeight: 900 }}>
          <ImageIcon size={20} color="#7B5CF0" /> 학교 로고 설정
        </div>
        <p style={{ margin: "8px 0 22px", color: "#7F7798", fontSize: 13, lineHeight: 1.65 }}>
          우리 학교의 로고를 등록하면 이 학교로 로그인한 학생과 선생님의 학습 페이지 상단에 표시됩니다.
        </p>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading || saving}
          style={{ width: "100%", minHeight: 155, display: "grid", placeItems: "center", padding: 24, border: "2px dashed #C9BFEE", borderRadius: 16, background: "#FCFAFF", color: "#6F5BB1", cursor: loading || saving ? "wait" : "pointer", fontFamily: "inherit" }}
        >
          <span style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <span style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 13, background: "#EFEAFD" }}><Upload size={21} /></span>
            <strong style={{ fontSize: 14 }}>이미지를 선택하거나 새 로고로 교체</strong>
            <span style={{ color: "#9A93B5", fontSize: 12 }}>PNG, JPG, WebP · 최대 2MB · 투명 배경 PNG 권장</span>
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => chooseFile(event.target.files?.[0])} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={() => void saveLogo()} disabled={!selectedFile || saving} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "11px 18px", border: 0, borderRadius: 11, background: !selectedFile || saving ? "#C6BEDA" : "#7B5CF0", color: "#fff", cursor: !selectedFile || saving ? "not-allowed" : "pointer", fontFamily: "inherit", fontWeight: 800 }}>
            {pendingAction === "save" ? <span className="button-loading-spinner" style={{ width: 14, height: 14, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} /> : <Upload size={15} />} {pendingAction === "save" ? "저장 중..." : "이 로고 저장"}
          </button>
          {selectedFile && <span style={{ overflow: "hidden", color: "#6F668C", fontSize: 12.5, textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedFile.name}</span>}
        </div>
        {message && <div role="status" style={{ marginTop: 16, padding: "11px 13px", borderRadius: 10, background: "#F4F0FE", color: "#5B4B99", fontSize: 12.5, fontWeight: 700 }}>{message}</div>}
      </section>

      <section style={{ ...cardStyle, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #F0ECF7" }}>
          <div style={{ color: "#3D2E8A", fontSize: 14, fontWeight: 850 }}>상단 표시 미리보기</div>
          <div style={{ marginTop: 3, color: "#9A93B5", fontSize: 11.5 }}>{loading ? "학교 정보 불러오는 중..." : school?.name}</div>
        </div>
        <div style={{ minHeight: 180, display: "grid", placeItems: "center", padding: 26, background: "linear-gradient(145deg,#FBFAFE,#F4F0FA)" }}>
          {visibleLogo ? (
            <Image src={visibleLogo} alt={`${school?.name ?? "학교"} 로고 미리보기`} width={600} height={180} unoptimized style={{ width: Math.round(142 * previewScale), height: Math.round(34 * previewScale), objectFit: "contain", transition: "width .2s ease, height .2s ease" }} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, color: "#A49CB8", textAlign: "center" }}>
              <School size={38} strokeWidth={1.5} />
              <span style={{ fontSize: 12.5 }}>아직 등록된 로고가 없습니다.</span>
            </div>
          )}
        </div>
        {school?.logoUrl && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 18px", borderTop: "1px solid #F0ECF7" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }} aria-label="학교 로고 표시 크기">
              <span style={{ marginRight: 2, color: "#7D748C", fontSize: 11.5, fontWeight: 750 }}>표시 크기</span>
              <button type="button" onClick={() => void updateLogoScale(school.logoScale - 10)} disabled={saving || school.logoScale <= 70} aria-label="로고 작게" title="로고 작게" style={{ width: 30, height: 30, display: "grid", placeItems: "center", border: "1px solid #DED7E9", borderRadius: 8, background: "#fff", color: "#675B77", cursor: saving || school.logoScale <= 70 ? "not-allowed" : "pointer" }}>
                {pendingAction === "scale-down" ? <span className="button-loading-spinner" style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} /> : <Minus size={14} />}
              </button>
              <strong style={{ minWidth: 42, color: "#4F435E", fontSize: 12, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{school.logoScale}%</strong>
              <button type="button" onClick={() => void updateLogoScale(school.logoScale + 10)} disabled={saving || school.logoScale >= 140} aria-label="로고 크게" title="로고 크게" style={{ width: 30, height: 30, display: "grid", placeItems: "center", border: "1px solid #DED7E9", borderRadius: 8, background: "#fff", color: "#675B77", cursor: saving || school.logoScale >= 140 ? "not-allowed" : "pointer" }}>
                {pendingAction === "scale-up" ? <span className="button-loading-spinner" style={{ width: 12, height: 12, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} /> : <Plus size={14} />}
              </button>
            </div>
            <button type="button" onClick={() => void deleteLogo()} disabled={saving} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 11px", border: "1px solid #F3CDDA", borderRadius: 9, background: "#FFF7FA", color: "#BD456B", cursor: saving ? "wait" : "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 750 }}>
              {pendingAction === "delete" ? <span className="button-loading-spinner" style={{ width: 13, height: 13, border: "2px solid currentColor", borderTopColor: "transparent", borderRadius: "50%" }} /> : <Trash2 size={14} />} {pendingAction === "delete" ? "삭제 중..." : "등록 로고 삭제"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
