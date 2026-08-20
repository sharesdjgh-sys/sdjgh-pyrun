"use client";

import { useMemo, useState } from "react";
import {
  Check,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { USER_ROLES, type UserRole } from "@/lib/roles";
import styles from "./UserManagementPanel.module.css";

export interface ManagedUser {
  id: number;
  username: string;
  role: string;
  displayName: string | null;
  studentNumber: string | null;
  grade: number | null;
  classNumber: number | null;
  seatNumber: number | null;
  schoolId: number;
  schoolName: string;
}

interface UserManagementPanelProps {
  users: ManagedUser[];
  currentUserId: number;
  updatingUserId: number | null;
  message: string;
  onRoleChange: (userId: number, role: UserRole) => Promise<boolean>;
  onDelete: (user: ManagedUser) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: "학생",
  teacher: "교사",
  admin: "관리자",
};
const EDITABLE_USER_ROLES: UserRole[] = ["student", "teacher"];

type SortOption = "recent" | "name" | "school" | "class";

export default function UserManagementPanel({
  users,
  currentUserId,
  updatingUserId,
  message,
  onRoleChange,
  onDelete,
}: UserManagementPanelProps) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [seatFilter, setSeatFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [pendingTeacher, setPendingTeacher] = useState<ManagedUser | null>(null);
  const [selectedTeacherClassKeys, setSelectedTeacherClassKeys] = useState<string[]>([]);
  const [teacherModalSaving, setTeacherModalSaving] = useState(false);
  const [teacherModalError, setTeacherModalError] = useState("");

  const schools = useMemo(
    () => Array.from(new Set(users.map((user) => user.schoolName))).sort((a, b) => a.localeCompare(b, "ko")),
    [users]
  );

  const grades = useMemo(
    () => Array.from(new Set(users.flatMap((user) => user.grade === null ? [] : [user.grade]))).sort((a, b) => a - b),
    [users]
  );

  const classes = useMemo(
    () => Array.from(new Set(users
      .filter((user) => gradeFilter === "all" || String(user.grade) === gradeFilter)
      .flatMap((user) => user.classNumber === null ? [] : [user.classNumber])))
      .sort((a, b) => a - b),
    [gradeFilter, users]
  );

  const seatNumbers = useMemo(
    () => Array.from(new Set(users
      .filter((user) =>
        (gradeFilter === "all" || String(user.grade) === gradeFilter) &&
        (classFilter === "all" || String(user.classNumber) === classFilter)
      )
      .flatMap((user) => user.seatNumber === null ? [] : [user.seatNumber])))
      .sort((a, b) => a - b),
    [classFilter, gradeFilter, users]
  );

  const teacherClassOptions = useMemo(() => {
    if (!pendingTeacher) return [];
    return users
      .filter((user) =>
        user.schoolId === pendingTeacher.schoolId &&
        user.role === "student" &&
        user.grade !== null &&
        user.classNumber !== null
      )
      .map((user) => ({ grade: user.grade as number, classNumber: user.classNumber as number }))
      .filter((item, index, items) => items.findIndex((candidate) =>
        candidate.grade === item.grade && candidate.classNumber === item.classNumber
      ) === index)
      .sort((a, b) => a.grade - b.grade || a.classNumber - b.classNumber);
  }, [pendingTeacher, users]);

  const teacherClassesByGrade = useMemo(() => teacherClassOptions.reduce<Record<number, typeof teacherClassOptions>>((groups, item) => {
    (groups[item.grade] ??= []).push(item);
    return groups;
  }, {}), [teacherClassOptions]);

  const roleCounts = useMemo(
    () =>
      USER_ROLES.reduce<Record<UserRole, number>>(
        (counts, role) => ({ ...counts, [role]: users.filter((user) => user.role === role).length }),
        { student: 0, teacher: 0, admin: 0 }
      ),
    [users]
  );

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ko");
    return users
      .filter((user) => {
        const classLabel = user.grade !== null && user.classNumber !== null
          ? `${user.grade}학년 ${user.classNumber}반 ${user.seatNumber ?? ""}번`
          : "";
        const searchable = `${user.displayName ?? ""} ${user.username} ${user.studentNumber ?? ""} ${user.schoolName} ${classLabel}`.toLocaleLowerCase("ko");
        return (
          (!normalizedQuery || searchable.includes(normalizedQuery)) &&
          (roleFilter === "all" || user.role === roleFilter) &&
          (schoolFilter === "all" || user.schoolName === schoolFilter) &&
          (gradeFilter === "all" || String(user.grade) === gradeFilter) &&
          (classFilter === "all" || String(user.classNumber) === classFilter) &&
          (seatFilter === "all" || String(user.seatNumber) === seatFilter)
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return (a.displayName || a.username).localeCompare(b.displayName || b.username, "ko");
        }
        if (sortBy === "school") {
          return a.schoolName.localeCompare(b.schoolName, "ko") ||
            (a.displayName || a.username).localeCompare(b.displayName || b.username, "ko");
        }
        if (sortBy === "class") {
          return (a.grade ?? Number.MAX_SAFE_INTEGER) - (b.grade ?? Number.MAX_SAFE_INTEGER) ||
            (a.classNumber ?? Number.MAX_SAFE_INTEGER) - (b.classNumber ?? Number.MAX_SAFE_INTEGER) ||
            (a.seatNumber ?? Number.MAX_SAFE_INTEGER) - (b.seatNumber ?? Number.MAX_SAFE_INTEGER);
        }
        return b.id - a.id;
      });
  }, [query, roleFilter, schoolFilter, gradeFilter, classFilter, seatFilter, sortBy, users]);

  const hasActiveFilters = query.trim() !== "" || roleFilter !== "all" || schoolFilter !== "all" || gradeFilter !== "all" || classFilter !== "all" || seatFilter !== "all";
  const messageIsError = /실패|오류|삭제할 수 없/.test(message);

  function resetFilters() {
    setQuery("");
    setRoleFilter("all");
    setSchoolFilter("all");
    setGradeFilter("all");
    setClassFilter("all");
    setSeatFilter("all");
  }

  function handleRoleSelection(user: ManagedUser, currentRole: UserRole, nextRole: UserRole) {
    if (nextRole === currentRole) return;
    if (nextRole === "teacher") {
      setPendingTeacher(user);
      setSelectedTeacherClassKeys([]);
      setTeacherModalError("");
      return;
    }
    void onRoleChange(user.id, nextRole);
  }

  function closeTeacherModal() {
    if (teacherModalSaving) return;
    setPendingTeacher(null);
    setSelectedTeacherClassKeys([]);
    setTeacherModalError("");
  }

  function toggleTeacherClass(key: string) {
    setSelectedTeacherClassKeys((current) => current.includes(key)
      ? current.filter((item) => item !== key)
      : [...current, key]
    );
  }

  function toggleTeacherGrade(grade: number) {
    const keys = (teacherClassesByGrade[grade] ?? []).map((item) => `${item.grade}:${item.classNumber}`);
    const allSelected = keys.every((key) => selectedTeacherClassKeys.includes(key));
    setSelectedTeacherClassKeys((current) => allSelected
      ? current.filter((key) => !keys.includes(key))
      : [...new Set([...current, ...keys])]
    );
  }

  async function confirmTeacherRole() {
    if (!pendingTeacher || teacherModalSaving) return;
    setTeacherModalSaving(true);
    setTeacherModalError("");
    try {
      const currentUser = users.find((user) => user.id === pendingTeacher.id);
      const roleChanged = currentUser?.role === "teacher" || await onRoleChange(pendingTeacher.id, "teacher");
      if (!roleChanged) {
        setTeacherModalError("교사 등급 변경에 실패했습니다.");
        return;
      }

      const response = await fetch("/api/admin/teacher-classes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherUserId: pendingTeacher.id,
          classes: selectedTeacherClassKeys.map((key) => {
            const [grade, classNumber] = key.split(":").map(Number);
            return { grade, classNumber };
          }),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setTeacherModalError(data.error ?? "담당 학급 배정에 실패했습니다.");
        return;
      }
      setPendingTeacher(null);
      setSelectedTeacherClassKeys([]);
      setTeacherModalError("");
    } catch {
      setTeacherModalError("네트워크 오류가 발생했습니다.");
    } finally {
      setTeacherModalSaving(false);
    }
  }

  return (
    <section className={styles.panel} aria-labelledby="user-management-title">
      <div className={styles.headingRow}>
        <div>
          <div className={styles.eyebrow}>ACCOUNT DIRECTORY</div>
          <h2 id="user-management-title" className={styles.title}>
            회원 관리
          </h2>
          <p className={styles.description}>이름, 아이디, 학교로 빠르게 찾고 회원 역할을 관리하세요.</p>
        </div>
        <div className={styles.totalBadge}>
          <Users size={18} aria-hidden="true" />
          <strong>{users.length.toLocaleString()}</strong>명
        </div>
      </div>

      <div className={styles.summaryGrid} aria-label="역할별 회원 수">
        {USER_ROLES.map((role) => (
          <button
            key={role}
            type="button"
            className={`${styles.summaryCard} ${styles[`summary_${role}`]} ${roleFilter === role ? styles.summaryCardActive : ""}`}
            onClick={() => setRoleFilter((current) => (current === role ? "all" : role))}
            aria-pressed={roleFilter === role}
          >
            <span className={`${styles.roleDot} ${styles[role]}`} />
            <span>{ROLE_LABELS[role]}</span>
            <strong>{roleCounts[role].toLocaleString()}</strong>
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <label className={styles.searchBox}>
          <Search size={18} aria-hidden="true" />
          <span className={styles.srOnly}>회원 검색</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이름, 아이디, 학교 검색"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="검색어 지우기">
              <X size={16} />
            </button>
          )}
        </label>

        <div className={styles.filterGroup}>
          <SlidersHorizontal size={17} aria-hidden="true" />
          <label>
            <span className={styles.srOnly}>역할 필터</span>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "all" | UserRole)}>
              <option value="all">모든 역할</option>
              {USER_ROLES.map((role) => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
            </select>
          </label>
          <label>
            <span className={styles.srOnly}>학교 필터</span>
            <select value={schoolFilter} onChange={(event) => setSchoolFilter(event.target.value)}>
              <option value="all">모든 학교</option>
              {schools.map((school) => <option key={school} value={school}>{school}</option>)}
            </select>
          </label>
          <span className={styles.filterDivider} aria-hidden="true" />
          <label>
            <span className={styles.srOnly}>학년 필터</span>
            <select
              value={gradeFilter}
              onChange={(event) => {
                setGradeFilter(event.target.value);
                setClassFilter("all");
                setSeatFilter("all");
              }}
            >
              <option value="all">전체 학년</option>
              {grades.map((grade) => <option key={grade} value={grade}>{grade}학년</option>)}
            </select>
          </label>
          <label>
            <span className={styles.srOnly}>반 필터</span>
            <select
              value={classFilter}
              onChange={(event) => {
                setClassFilter(event.target.value);
                setSeatFilter("all");
              }}
            >
              <option value="all">전체 반</option>
              {classes.map((classNumber) => <option key={classNumber} value={classNumber}>{classNumber}반</option>)}
            </select>
          </label>
          <label>
            <span className={styles.srOnly}>번호 필터</span>
            <select value={seatFilter} onChange={(event) => setSeatFilter(event.target.value)}>
              <option value="all">전체 번호</option>
              {seatNumbers.map((seatNumber) => <option key={seatNumber} value={seatNumber}>{seatNumber}번</option>)}
            </select>
          </label>
          <label>
            <span className={styles.srOnly}>회원 정렬</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
              <option value="recent">최근 등록순</option>
              <option value="name">이름순</option>
              <option value="school">학교순</option>
              <option value="class">학년·반·번호순</option>
            </select>
          </label>
        </div>
      </div>

      <div className={styles.resultRow}>
        <span>전체 {users.length.toLocaleString()}명 중 <strong>{visibleUsers.length.toLocaleString()}명</strong></span>
        {hasActiveFilters && <button type="button" onClick={resetFilters}>필터 초기화</button>}
      </div>

      {message && (
        <div className={`${styles.message} ${messageIsError ? styles.messageError : styles.messageSuccess}`} role="status">
          {message}
        </div>
      )}

      {visibleUsers.length > 0 ? (
        <div className={styles.userGrid}>
          {visibleUsers.map((user) => {
            const role = USER_ROLES.includes(user.role as UserRole) ? (user.role as UserRole) : "student";
            const isSelf = user.id === currentUserId;
            const displayName = user.displayName || user.username;
            return (
              <article key={user.id} className={`${styles.userCard} ${styles[`card_${role}`]}`}>
                <div className={styles.cardTop}>
                  <div className={`${styles.avatar} ${styles[`avatar_${role}`]}`} aria-hidden="true">{displayName.slice(0, 1).toUpperCase()}</div>
                  <div className={styles.identity}>
                    <div className={styles.nameLine}>
                      <strong>{displayName}</strong>
                      {isSelf && <span className={styles.selfBadge}>내 계정</span>}
                    </div>
                    <span className={styles.username}>@{user.username}</span>
                  </div>
                  <span className={`${styles.roleBadge} ${styles[`badge_${role}`]}`}>{ROLE_LABELS[role]}</span>
                </div>

                <div className={styles.memberMeta}>
                  <div className={styles.schoolName}>{user.schoolName}</div>
                  {role === "student" && (
                    user.grade !== null && user.classNumber !== null ? (
                      <div className={styles.classInfo} aria-label={`${user.grade}학년 ${user.classNumber}반 ${user.seatNumber ?? "번호 미배정"}`}>
                        <span><strong>{user.grade}</strong>학년</span>
                        <span><strong>{user.classNumber}</strong>반</span>
                        <span className={user.seatNumber === null ? styles.unassigned : ""}>
                          {user.seatNumber === null ? "번호 미배정" : <><strong>{user.seatNumber}</strong>번</>}
                        </span>
                      </div>
                    ) : (
                      <div className={`${styles.classInfo} ${styles.unassigned}`}>학급 미배정</div>
                    )
                  )}
                </div>

                <div className={styles.cardActions}>
                  <label className={styles.roleSelect}>
                    <span>역할</span>
                    <select
                      value={role}
                      onChange={(event) => handleRoleSelection(user, role, event.target.value as UserRole)}
                      disabled={updatingUserId !== null || isSelf || role === "admin"}
                      aria-label={`${displayName} 역할 변경`}
                    >
                      {(role === "admin" ? (["admin"] as UserRole[]) : EDITABLE_USER_ROLES).map((nextRole) => (
                        <option key={nextRole} value={nextRole}>{ROLE_LABELS[nextRole]}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => onDelete(user)}
                    disabled={updatingUserId !== null || isSelf}
                    aria-label={`${displayName} 회원 삭제`}
                    title={isSelf ? "현재 로그인한 계정은 삭제할 수 없습니다" : "회원 삭제"}
                  >
                    <Trash2 size={16} />
                    삭제
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <UserRound size={28} aria-hidden="true" />
          <strong>조건에 맞는 회원이 없습니다</strong>
          <span>검색어나 필터를 바꿔보세요.</span>
          {hasActiveFilters && <button type="button" onClick={resetFilters}>모든 회원 보기</button>}
        </div>
      )}

      {pendingTeacher && (
        <div className={styles.teacherModalOverlay} onMouseDown={(event) => event.target === event.currentTarget && closeTeacherModal()}>
          <div className={styles.teacherModal} role="dialog" aria-modal="true" aria-labelledby="teacher-assignment-title">
            <div className={styles.teacherModalHeader}>
              <div>
                <div className={styles.eyebrow}>TEACHER SETUP</div>
                <h2 id="teacher-assignment-title">교사 담당 학급 지정</h2>
                <p><strong>{pendingTeacher.displayName || pendingTeacher.username}</strong> 님을 교사로 변경하고 담당 학급을 선택합니다.</p>
              </div>
              <button type="button" onClick={closeTeacherModal} disabled={teacherModalSaving} aria-label="팝업 닫기"><X size={18} /></button>
            </div>

            <div className={styles.teacherSchoolContext}>
              <span>배정 학교</span>
              <strong>{pendingTeacher.schoolName}</strong>
            </div>

            <div className={styles.teacherClassHeading}>
              <div>
                <strong>담당 학급 다중 선택</strong>
                <span>{selectedTeacherClassKeys.length}개 학급 선택됨</span>
              </div>
              {selectedTeacherClassKeys.length > 0 && <button type="button" onClick={() => setSelectedTeacherClassKeys([])}>전체 해제</button>}
            </div>

            {teacherClassOptions.length === 0 ? (
              <div className={styles.teacherClassEmpty}>이 학교에 등록된 학생 학급이 없습니다. 학생 계정을 먼저 등록해주세요.</div>
            ) : (
              <div className={styles.teacherGradeGrid}>
                {Object.entries(teacherClassesByGrade).map(([gradeKey, classes]) => {
                  const grade = Number(gradeKey);
                  const gradeKeys = classes.map((item) => `${item.grade}:${item.classNumber}`);
                  const allSelected = gradeKeys.every((key) => selectedTeacherClassKeys.includes(key));
                  return (
                    <section key={grade} className={styles.teacherGradeCard}>
                      <div>
                        <strong>{grade}학년</strong>
                        <button type="button" onClick={() => toggleTeacherGrade(grade)}>{allSelected ? "전체 해제" : "전체 선택"}</button>
                      </div>
                      <div className={styles.teacherClassGrid}>
                        {classes.map((item) => {
                          const key = `${item.grade}:${item.classNumber}`;
                          const selected = selectedTeacherClassKeys.includes(key);
                          return (
                            <button key={key} type="button" aria-pressed={selected} className={selected ? styles.teacherClassSelected : ""} onClick={() => toggleTeacherClass(key)}>
                              <span>{selected && <Check size={11} strokeWidth={3} />}</span>
                              {item.classNumber}반
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}

            {teacherModalError && <div className={styles.teacherModalError} role="alert">{teacherModalError}</div>}

            <div className={styles.teacherModalFooter}>
              <button type="button" onClick={closeTeacherModal} disabled={teacherModalSaving}>취소</button>
              <button type="button" onClick={() => void confirmTeacherRole()} disabled={teacherModalSaving}>
                {teacherModalSaving
                  ? <><LoaderCircle size={15} /> 처리 중...</>
                  : selectedTeacherClassKeys.length > 0
                    ? `교사로 변경하고 ${selectedTeacherClassKeys.length}개 학급 배정`
                    : "학급 없이 교사로 변경"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
