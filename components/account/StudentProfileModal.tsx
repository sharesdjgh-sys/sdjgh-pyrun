"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Award, BadgeCheck, CheckCircle2, Eye, EyeOff, LockKeyhole, PencilLine, ShieldCheck, Sparkles, X } from "lucide-react";
import { getBadgeImagePath } from "@/lib/badge-images";
import styles from "./StudentProfileModal.module.css";

type ProfileData = {
  user: {
    displayName: string | null;
    nickname: string | null;
    studentNumber: string | null;
    grade: number | null;
    classNumber: number | null;
    seatNumber: number | null;
    recoveryCodeSet: boolean;
  };
  badges: Array<{ id: number; name: string; sourceConceptId: number | null; clearedAt: string | null }>;
  badgeSummary: { earned: number; total: number };
};

export default function StudentProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { update: updateSession } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<"nickname" | "security" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError("");
    fetch("/api/account/profile")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "내 정보를 불러오지 못했습니다.");
        setProfile(data);
        setNickname(data.user.nickname && data.user.nickname !== data.user.displayName ? data.user.nickname : "코드러너");
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "내 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose, saving]);

  if (!open) return null;

  async function save(payload: Record<string, string>, kind: "nickname" | "security") {
    setSaving(kind);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "정보를 변경하지 못했습니다.");
      if (kind === "nickname") {
        setProfile((current) => current ? { ...current, user: { ...current.user, nickname: nickname.trim() } } : current);
        await updateSession({
          name: nickname.trim(),
          nickname: nickname.trim(),
          displayName: profile?.user.displayName || "학생",
        });
        setMessage("닉네임을 변경했습니다.");
      } else {
        setProfile((current) => current ? {
          ...current,
          user: { ...current.user, recoveryCodeSet: current.user.recoveryCodeSet || Boolean(recoveryCode) },
        } : current);
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
        setRecoveryCode("");
        setShowRecoveryCode(false);
        setMessage("보안 정보를 안전하게 변경했습니다.");
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "정보를 변경하지 못했습니다.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSecuritySubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!newPassword && !recoveryCode) {
      setError("새 비밀번호 또는 복구번호를 입력해 주세요.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    await save({ currentPassword, newPassword, recoveryCode }, "security");
  }

  const earnedPercent = profile?.badgeSummary.total
    ? Math.min(100, Math.round((profile.badgeSummary.earned / profile.badgeSummary.total) * 100))
    : 0;
  const studentName = profile?.user.displayName || "학생";
  const hasCustomNickname = Boolean(profile?.user.nickname && profile.user.nickname !== profile.user.displayName);
  const profileNickname = hasCustomNickname ? profile!.user.nickname! : "코드러너";
  const classLabel = profile?.user.grade && profile.user.classNumber
    ? `${profile.user.grade}학년 ${profile.user.classNumber}반${profile.user.seatNumber ? ` ${profile.user.seatNumber}번` : ""}`
    : "학급 정보 없음";

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="내 정보" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !saving) onClose();
    }} className={styles.backdrop}>
      <div className={styles.modal}>
        <button type="button" onClick={onClose} disabled={Boolean(saving)} aria-label="닫기" className={styles.closeButton}><X size={19} /></button>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingOrb}><Sparkles size={25} /></div>
            <strong>나의 성장 기록을 불러오는 중</strong>
            <span>잠시만 기다려 주세요</span>
          </div>
        )}

        {profile && !loading && (
          <>
            <header className={styles.hero}>
              <span className={styles.heroGlowOne} />
              <span className={styles.heroGlowTwo} />
              <div className={styles.heroProfile}>
                <div className={styles.avatar}>
                  <span>{profileNickname.slice(0, 1)}</span>
                  <i><BadgeCheck size={16} /></i>
                </div>
                <div className={styles.heroCopy}>
                  <div className={styles.eyebrow}><Sparkles size={13} /> PYRUN STUDENT</div>
                  <div className={styles.studentName}>이름 · {studentName}</div>
                  <h2>{profileNickname}</h2>
                  <div className={styles.identityChips}>
                    <span>{classLabel}</span>
                    <span className={profile.user.recoveryCodeSet ? styles.secureChip : styles.warningChip}>
                      {profile.user.recoveryCodeSet ? <CheckCircle2 size={12} /> : <LockKeyhole size={12} />}
                      {profile.user.recoveryCodeSet ? "복구 설정 완료" : "복구 설정 필요"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.progressRing} style={{ background: `conic-gradient(#FFD166 ${earnedPercent * 3.6}deg, rgba(255,255,255,.2) 0deg)` }}>
                <div><strong>{earnedPercent}%</strong><span>배지 달성</span></div>
              </div>
            </header>

            <div className={styles.content}>
              {error && <div role="alert" className={`${styles.notice} ${styles.errorNotice}`}>{error}</div>}
              {message && <div className={`${styles.notice} ${styles.successNotice}`}><CheckCircle2 size={16} />{message}</div>}

              <div className={styles.dashboardGrid}>
                <div className={styles.leftColumn}>
                  <section className={`${styles.card} ${styles.badgeCard}`}>
                    <div className={styles.sectionHeading}>
                      <div className={styles.sectionIcon}><Award size={18} /></div>
                      <div><h3>나의 배지 컬렉션</h3><p>학습하며 모은 최근 배지를 확인해 보세요.</p></div>
                      <div className={styles.badgeCount}><strong>{profile.badgeSummary.earned}</strong><span>/ {profile.badgeSummary.total}</span></div>
                    </div>
                    <div className={styles.progressTrack}><span style={{ width: `${earnedPercent}%` }} /></div>
                    {profile.badges.length ? (
                      <div className={styles.badgeGrid}>
                        {profile.badges.slice(-6).reverse().map((badge) => {
                          const imagePath = getBadgeImagePath(badge.sourceConceptId);
                          return (
                            <div key={badge.id} className={styles.badgeItem} title={badge.name}>
                              <div className={styles.badgeImage}>
                                {imagePath ? <Image src={imagePath} alt="" width={54} height={54} /> : <Award size={25} />}
                              </div>
                              <span>{badge.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className={styles.emptyBadges}><Award size={28} /><strong>첫 배지를 획득해 보세요!</strong><span>학습 단원을 완료하면 이곳에 배지가 나타나요.</span></div>
                    )}
                  </section>

                  <section className={`${styles.card} ${styles.nicknameCard}`}>
                    <div className={styles.sectionHeading}>
                      <div className={`${styles.sectionIcon} ${styles.pinkIcon}`}><PencilLine size={18} /></div>
                      <div><h3>나를 표현하는 닉네임</h3><p>수업 화면에 표시되는 이름이에요.</p></div>
                    </div>
                    <div className={styles.inlineField}>
                      <input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={20} aria-label="닉네임" placeholder="나만의 닉네임을 입력하세요" />
                      <span>{nickname.length}/20</span>
                      <button type="button" disabled={Boolean(saving) || !nickname.trim()} onClick={() => void save({ nickname }, "nickname")}>{saving === "nickname" ? "저장 중" : "닉네임 저장"}</button>
                    </div>
                  </section>
                </div>

                <form onSubmit={handleSecuritySubmit} className={`${styles.card} ${styles.securityCard}`}>
                  <div className={styles.securityHeader}>
                    <div className={`${styles.sectionIcon} ${styles.greenIcon}`}><ShieldCheck size={19} /></div>
                    <div><h3>계정 보안</h3><p>내 계정을 안전하게 지켜요.</p></div>
                    <span className={profile.user.recoveryCodeSet ? styles.statusOn : styles.statusOff}>{profile.user.recoveryCodeSet ? "안전" : "확인 필요"}</span>
                  </div>

                  <div className={styles.formGroup}>
                    <label>현재 비밀번호</label>
                    <input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="현재 비밀번호 입력" required />
                  </div>
                  <div className={styles.formDivider}><span>비밀번호 변경</span></div>
                  <div className={styles.formGroup}>
                    <label>새 비밀번호 <small>변경할 때만</small></label>
                    <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} maxLength={128} placeholder="8자 이상 입력" />
                    <input type="password" autoComplete="new-password" value={newPasswordConfirm} onChange={(event) => setNewPasswordConfirm(event.target.value)} placeholder="새 비밀번호 다시 입력" />
                  </div>
                  <div className={styles.formDivider}><span>비밀번호 복구</span></div>
                  <div className={styles.formGroup}>
                    <label>6자리 복구번호 <small className={profile.user.recoveryCodeSet ? styles.setText : styles.unsetText}>{profile.user.recoveryCodeSet ? "설정됨" : "설정 필요"}</small></label>
                    <div className={styles.secretField}>
                      <input type={showRecoveryCode ? "text" : "password"} inputMode="numeric" autoComplete="off" value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value.replace(/\D/g, "").slice(0, 6))} pattern="\d{6}" placeholder="숫자 6자리" />
                      <button type="button" onClick={() => setShowRecoveryCode((visible) => !visible)} aria-label={showRecoveryCode ? "복구번호 숨기기" : "복구번호 보기"} aria-pressed={showRecoveryCode}>{showRecoveryCode ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                    </div>
                  </div>
                  <div className={styles.securityTip}><LockKeyhole size={15} /><span>복구번호는 친구가 알기 어려운 번호로 정하고 다른 사람에게 알려주지 마세요.</span></div>
                  <button type="submit" disabled={Boolean(saving)} className={styles.primaryButton}><ShieldCheck size={16} />{saving === "security" ? "안전하게 변경 중..." : "보안 정보 저장"}</button>
                </form>
              </div>
            </div>
          </>
        )}

        {!loading && !profile && error && <div role="alert" className={styles.loadError}>{error}</div>}
      </div>
    </div>,
    document.body
  );
}
