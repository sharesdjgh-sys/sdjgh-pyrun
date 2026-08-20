"use client";

import { useRef, useState } from "react";
import { Download, FileSpreadsheet, Upload, UserPlus } from "lucide-react";
import { parseSchoolStudentNumber } from "@/lib/student-number";
import styles from "./StudentCsvImport.module.css";

const EMPTY_STUDENT = { studentNumber: "", name: "", password: "" };

export default function StudentCsvImport() {
  const [student, setStudent] = useState(EMPTY_STUDENT);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createSucceeded, setCreateSucceeded] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const classInfo = parseSchoolStudentNumber(student.studentNumber);

  async function createStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (creating) return;
    setCreating(true);
    setCreateMessage("");
    setCreateSucceeded(false);

    try {
      const res = await fetch("/api/admin/students/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "학생 계정 등록에 실패했습니다.");
      setCreateSucceeded(true);
      setCreateMessage(`${data.student?.displayName ?? student.name} 학생 계정을 등록했습니다.`);
      setStudent(EMPTY_STUDENT);
    } catch (error) {
      setCreateMessage(error instanceof Error ? error.message : "학생 계정 등록에 실패했습니다.");
    } finally {
      setCreating(false);
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
    <section className={styles.shell}>
      <header className={styles.pageHeader}>
        <div>
          <span className={styles.eyebrow}>STUDENT ACCOUNTS</span>
          <h2>학생 계정 등록</h2>
          <p>한 명은 바로 입력하고, 여러 명은 CSV로 한 번에 등록하세요.</p>
        </div>
        <span className={styles.scopeBadge}>현재 학교에만 등록</span>
      </header>

      <div className={styles.grid}>
        <article className={`${styles.card} ${styles.singleCard}`}>
          <div className={styles.cardHeading}>
            <span className={`${styles.iconBox} ${styles.singleIcon}`}><UserPlus size={21} /></span>
            <div>
              <span className={styles.step}>01 · SINGLE</span>
              <h3>학생 한 명 등록</h3>
            </div>
          </div>
          <p className={styles.description}>학번을 입력하면 학년·반·번호를 자동으로 확인합니다.</p>

          <form onSubmit={createStudent} className={styles.form}>
            <label>
              <span>학번</span>
              <input
                value={student.studentNumber}
                onChange={(event) => setStudent((current) => ({ ...current, studentNumber: event.target.value.replace(/\D/g, "").slice(0, 5) }))}
                inputMode="numeric"
                placeholder="예: 10501"
                minLength={5}
                maxLength={5}
                required
              />
            </label>
            <div className={`${styles.classPreview} ${classInfo ? styles.classPreviewValid : ""}`} aria-live="polite">
              {classInfo
                ? `${classInfo.grade}학년 ${classInfo.classNumber}반 ${classInfo.seatNumber}번으로 등록됩니다.`
                : "5자리 학번을 입력하면 학급 정보가 표시됩니다."}
            </div>
            <label>
              <span>학생 이름</span>
              <input value={student.name} onChange={(event) => setStudent((current) => ({ ...current, name: event.target.value }))} placeholder="예: 김하늘" maxLength={100} required />
            </label>
            <label>
              <span>초기 비밀번호</span>
              <input type="password" value={student.password} onChange={(event) => setStudent((current) => ({ ...current, password: event.target.value }))} placeholder="8자 이상" minLength={8} maxLength={128} required />
            </label>
            <button className={`${styles.pressable} ${styles.primaryButton}`} type="submit" disabled={creating || !classInfo}>
              <UserPlus size={17} /> {creating ? "등록 중..." : "학생 계정 등록"}
            </button>
          </form>
          {createMessage && <div role="status" className={`${styles.message} ${createSucceeded ? styles.success : styles.error}`}>{createMessage}</div>}
        </article>

        <article className={`${styles.card} ${styles.bulkCard}`}>
          <div className={styles.cardHeading}>
            <span className={`${styles.iconBox} ${styles.bulkIcon}`}><FileSpreadsheet size={21} /></span>
            <div>
              <span className={styles.step}>02 · BULK</span>
              <h3>CSV 일괄 등록</h3>
            </div>
          </div>
          <p className={styles.description}>여러 학생을 한 번에 추가하거나 기존 학생 정보를 갱신합니다.</p>

          <div className={styles.csvGuide}>
            <span>필수 열</span>
            <strong>학번, 이름, 초기비밀번호</strong>
            <code>10501, 김하늘, student^^</code>
            <small>최대 500명 · 1MB 이하 · UTF-8 CSV</small>
          </div>

          <div className={styles.bulkActions}>
            <a className={`${styles.pressable} ${styles.secondaryButton}`} href="/api/admin/students/import/sample" download="student-accounts-sample.csv">
              <Download size={17} /> 샘플 CSV 다운로드
            </a>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={importStudents} hidden />
            <button className={`${styles.pressable} ${styles.primaryButton}`} type="button" onClick={() => fileInputRef.current?.click()} disabled={importing}>
              <Upload size={17} /> {importing ? "등록 중..." : "CSV 파일 선택"}
            </button>
          </div>
          <p className={styles.bulkNote}>기존 학번을 다시 올리면 비밀번호는 유지되고 이름과 학급 정보만 갱신됩니다.</p>
          {importMessage && <div role="status" className={`${styles.message} ${importMessage.includes("완료") ? styles.success : styles.error}`}>{importMessage}</div>}
        </article>
      </div>
    </section>
  );
}
