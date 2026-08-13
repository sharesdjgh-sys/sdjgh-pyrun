"use client";

import { useMemo, useState } from "react";
import {
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
  onRoleChange: (userId: number, role: UserRole) => void;
  onDelete: (user: ManagedUser) => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  student: "학생",
  teacher: "교사",
  admin: "관리자",
};

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
                      onChange={(event) => onRoleChange(user.id, event.target.value as UserRole)}
                      disabled={updatingUserId !== null || isSelf}
                      aria-label={`${displayName} 역할 변경`}
                    >
                      {USER_ROLES.map((nextRole) => (
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
    </section>
  );
}
