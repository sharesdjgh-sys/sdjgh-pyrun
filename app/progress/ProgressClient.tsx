"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { COLOR_HEX } from "@/components/badges/colorMap";
import { getBadgeImagePath } from "@/lib/badge-images";
import { getStudentCallName } from "@/lib/student-name";
import { curriculumDisplayOrder } from "@/lib/curriculum-model";
import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Lock, Bot,
  Binary, FileText, ListChecks, Parentheses, BookOpen, Layers, Copy, Repeat, RefreshCcw,
  Braces, Network, ShieldAlert, Library, Search, BarChart2, TrendingUp, AlertCircle, Filter, Cpu, Award,
  Star, CheckCircle2, ChevronRight, Circle, Crown, LockKeyhole, Map, Target, Trophy, Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Bot,
  Binary, FileText, ListChecks, Parentheses, BookOpen, Layers, Copy, Repeat, RefreshCcw,
  Braces, Network, ShieldAlert, Library, Search, BarChart2, TrendingUp, AlertCircle, Filter, Cpu, Award,
};

interface BadgeInfo {
  badgeId: number;
  conceptId: number;
  sourceConceptId: number | null;
  nameKo: string;
  iconName: string;
  colorClass: string;
  conceptNameKo: string;
  level: number;
  groupName: string;
  orderIndex: number;
  earned: boolean;
  clearedAt: string | null;
}
interface FeedbackItem { id: number; aiFeedback: string; isSuccess: boolean; createdAt: string; codeSnippet: string; }

interface ProgressClientProps {
  userName: string;
}

const LEVEL_RANK_NAMES: Record<number, string> = {
  1: "파이썬 탐험가",
  2: "코딩 챌린저",
  3: "데이터 분석가",
};

export default function ProgressClient({ userName }: ProgressClientProps) {
  const [earnedConceptIds, setEarnedConceptIds] = useState<Set<number>>(new Set());
  const [practicedConceptIds, setPracticedConceptIds] = useState<Set<number>>(new Set());
  const [manuallyUnlockedConceptIds, setManuallyUnlockedConceptIds] = useState<Set<number>>(new Set());
  const [visibleBadgeTooltip, setVisibleBadgeTooltip] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [clearedCount, setClearedCount] = useState(0);
  const [totalConcepts, setTotalConcepts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getJson = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("학습 기록을 불러오지 못했습니다.");
      return response.json();
    };
    Promise.all([getJson("/api/badges"), getJson("/api/progress")]).then(([badgeData, progressData]) => {
      const earned = (badgeData.earned || []) as BadgeInfo[];
      setBadges(earned);
      setEarnedConceptIds(new Set(earned.filter((b) => b.earned).map((b) => b.conceptId)));
      const unfinishedLevel = [...new Set(earned.map((badge) => badge.level))]
        .sort((left, right) => left - right)
        .find((level) => earned.some((badge) => badge.level === level && badge.sourceConceptId !== 0 && !badge.earned));
      setSelectedLevel(unfinishedLevel ?? earned.at(-1)?.level ?? 1);
      setFeedbackHistory(progressData.feedbackHistory || []);
      setProgressPercent(progressData.progressPercent || 0);
      setClearedCount((progressData.clearedConceptIds || []).length);
      setPracticedConceptIds(new Set(progressData.practicedConceptIds || []));
      setManuallyUnlockedConceptIds(new Set(progressData.manuallyUnlockedConceptIds || []));
      setTotalConcepts(progressData.totalConcepts || earned.length);
      setLoading(false);
    }).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : "학습 기록을 불러오지 못했습니다.");
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3.5px solid #C6A2EC", borderTopColor: "#7B5CF0", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return <main className="status-page" role="alert"><p>{error}</p><button onClick={() => location.reload()}>다시 시도</button></main>;
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff", borderRadius: 24, border: "1px solid #EFEAF8",
    boxShadow: "0 12px 30px rgba(90,63,214,.07)", padding: "26px 28px",
  };
  const badgeLevels = [...new Set(badges.map((badge) => badge.level))]
    .sort((a, b) => a - b)
    .map((level) => ({
      level,
      label: `Level ${level}`,
      badges: curriculumDisplayOrder(badges.filter((badge) => badge.level === level)),
    }));
  const currentLevelGroup = badgeLevels.find((group) =>
    group.badges.some((badge) => badge.sourceConceptId !== 0 && !earnedConceptIds.has(badge.conceptId))
  ) ?? badgeLevels.at(-1);
  const currentLevel = currentLevelGroup?.level ?? 1;
  const currentLevelBadges = currentLevelGroup?.badges ?? [];
  const currentLevelEarned = currentLevelBadges.filter((badge) => earnedConceptIds.has(badge.conceptId)).length;
  const currentLevelPracticeOnly = currentLevelBadges.filter((badge) =>
    practicedConceptIds.has(badge.conceptId) && !earnedConceptIds.has(badge.conceptId)
  ).length;
  const levelXp = currentLevelEarned * 100 + currentLevelPracticeOnly * 20;
  const levelMaxXp = Math.max(currentLevelBadges.length * 100, 100);
  const levelXpPercent = Math.min(100, Math.round((levelXp / levelMaxXp) * 100));
  const practiceOnlyCount = badges.filter((badge) =>
    practicedConceptIds.has(badge.conceptId) && !earnedConceptIds.has(badge.conceptId)
  ).length;
  const nextBadge = badgeLevels
    .flatMap((group) => group.badges)
    .find((badge) => badge.sourceConceptId !== 0 && !earnedConceptIds.has(badge.conceptId));
  const nextBadgeImage = getBadgeImagePath(nextBadge?.sourceConceptId);
  const nextBadgePracticed = nextBadge ? practicedConceptIds.has(nextBadge.conceptId) : false;
  const selectedLevelGroup = badgeLevels.find((group) => group.level === selectedLevel) ?? currentLevelGroup;
  const selectedLevelBadges = selectedLevelGroup?.badges ?? [];
  const recentAchievements = badges
    .filter((badge) => badge.earned && badge.clearedAt)
    .sort((left, right) => new Date(right.clearedAt!).getTime() - new Date(left.clearedAt!).getTime())
    .slice(0, 5);
  const playerName = getStudentCallName(userName);
  const currentRankName = LEVEL_RANK_NAMES[currentLevel] ?? `Level ${currentLevel} 탐험가`;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)" }}>
      {/* Header */}
      <div style={{ height: 66, display: "flex", alignItems: "center", padding: "0 22px", background: "rgba(255,255,255,.82)", backdropFilter: "blur(10px)", borderBottom: "1px solid #EDE7F8", position: "sticky", top: 0, zIndex: 5 }}>
        <Link
          href="/learn"
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", border: "1.5px solid #ECE7F8", borderRadius: 99, padding: "9px 16px", fontSize: 14, fontWeight: 700, color: "#544D70", textDecoration: "none", whiteSpace: "nowrap" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#F6F2FE"; (e.currentTarget as HTMLAnchorElement).style.color = "#7B5CF0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#fff"; (e.currentTarget as HTMLAnchorElement).style.color = "#544D70"; }}
        >
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          학습으로 돌아가기
        </Link>
        <div style={{ marginLeft: 18, fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 18, color: "#2C2747", whiteSpace: "nowrap" }}>성장 기록</div>
      </div>

      <main className="progress-game-shell">
        <section className="player-status-card" aria-labelledby="player-status-title">
          <div className="player-profile-row">
            <div className="player-avatar">
              <Image src="/pyrun_studio-favicon.png" alt="" width={76} height={66} priority style={{ objectFit: "contain" }} />
              <span className="player-level-chip">LV.{currentLevel}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="player-eyebrow">PYRUN PLAYER PROFILE</div>
              <h1 id="player-status-title" className="player-name">{playerName}의 코딩 프로필</h1>
              <div className="player-rank"><Crown size={15} fill="#FFD86B" /> Level {currentLevel} · {currentRankName}</div>
            </div>
            <div className="player-total-progress">
              <strong>{progressPercent}%</strong>
              <span>전체 모험 진행률</span>
            </div>
          </div>

          <div className="player-xp-block">
            <div className="player-xp-label">
              <span><Zap size={14} fill="#FFE173" /> LEVEL {currentLevel} XP</span>
              <strong>{levelXp} / {levelMaxXp} XP</strong>
            </div>
            <div className="player-xp-track">
              <div className="player-xp-fill" style={{ width: `${levelXpPercent}%` }} />
            </div>
            <div className="player-xp-help">문제 최초 도전 20 XP · 문제 해결 100 XP · 반복 실행은 중복 반영되지 않아</div>
          </div>

          <div className="player-stat-grid">
            {[
              { label: "완료한 퀘스트", value: clearedCount, icon: CheckCircle2 },
              { label: "연습 중", value: practiceOnlyCount, icon: Target },
              { label: "획득한 뱃지", value: clearedCount, icon: Trophy },
              { label: "남은 퀘스트", value: Math.max(totalConcepts - clearedCount, 0), icon: Map },
            ].map(({ label, value, icon: StatIcon }) => (
              <div className="player-stat" key={label}>
                <StatIcon size={17} />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="progress-dashboard-grid">
          <section className="next-reward-card" aria-labelledby="next-reward-title">
            <div className="progress-section-kicker"><Target size={15} /> NEXT REWARD</div>
            {nextBadge ? (
              <>
                <div className="next-reward-visual">
                  <div className="next-reward-glow" />
                  {nextBadgeImage ? (
                    <Image
                      src={nextBadgeImage}
                      alt={`${nextBadge.nameKo} 뱃지`}
                      width={190}
                      height={190}
                      sizes="190px"
                      style={{ position: "relative", objectFit: "contain", filter: "drop-shadow(0 14px 14px rgba(42,24,102,.2))" }}
                    />
                  ) : (
                    <Award size={74} color="#7B5CF0" />
                  )}
                </div>
                <div className={`next-reward-status ${nextBadgePracticed ? "is-practicing" : ""}`}>
                  {nextBadgePracticed ? "현재 연습 중" : "지금 도전 가능"}
                </div>
                <h2 id="next-reward-title">{nextBadge.nameKo}</h2>
                <p>{nextBadge.conceptNameKo} 문제를 해결하면 이 뱃지를 획득할 수 있어.</p>
                <div className="next-reward-meter">
                  <span style={{ width: nextBadgePracticed ? "55%" : "12%" }} />
                </div>
                <div className="next-reward-hint">
                  {nextBadgePracticed ? "조금만 더! 문제를 해결하면 바로 획득해." : "문제 하나를 해결하고 새로운 뱃지를 획득해보자."}
                </div>
                <Link href="/learn" className="progress-action-button">
                  {nextBadgePracticed ? "계속 도전하기" : "퀘스트 시작하기"}
                  <ChevronRight size={18} />
                </Link>
              </>
            ) : (
              <div className="all-clear-state">
                <Trophy size={72} color="#F0B429" />
                <h2 id="next-reward-title">모든 뱃지를 획득했어!</h2>
                <p>현재 커리큘럼의 모든 퀘스트를 완료했어.</p>
              </div>
            )}
          </section>

          <section style={cardStyle} aria-labelledby="quest-map-title">
            <div className="progress-card-heading">
              <div>
                <div className="progress-section-kicker"><Map size={15} /> QUEST MAP</div>
                <h2 id="quest-map-title">Level {currentLevel} 퀘스트</h2>
              </div>
              <span>{currentLevelEarned} / {currentLevelBadges.length}</span>
            </div>
            <div className="quest-map-list">
              {currentLevelBadges.map((badge, index) => {
                const earned = earnedConceptIds.has(badge.conceptId);
                const practiced = practicedConceptIds.has(badge.conceptId) && !earned;
                const requiredBadges = currentLevelBadges.filter((item) => item.sourceConceptId !== 0);
                const requiredIndex = requiredBadges.findIndex((item) => item.conceptId === badge.conceptId);
                const priorCleared = requiredIndex <= 0 || requiredBadges
                  .slice(0, requiredIndex)
                  .every((item) => earnedConceptIds.has(item.conceptId));
                const available = badge.sourceConceptId === 0 || priorCleared || manuallyUnlockedConceptIds.has(badge.conceptId);
                const status = earned ? "완료" : practiced ? "연습 중" : available ? "다음 도전" : "잠김";
                const StatusIcon = earned ? CheckCircle2 : practiced || available ? Circle : LockKeyhole;
                return (
                  <div className={`quest-map-row ${earned ? "is-cleared" : practiced ? "is-practicing" : available ? "is-available" : "is-locked"}`} key={badge.conceptId}>
                    <div className="quest-map-node">
                      <StatusIcon size={17} />
                      {index < currentLevelBadges.length - 1 && <span />}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong>{badge.conceptNameKo}</strong>
                      <small>{badge.nameKo}</small>
                    </div>
                    <em>{status}</em>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Badges card */}
        <div style={cardStyle}>
          <div className="badge-collection-heading">
            <div>
              <div className="progress-section-kicker" style={{ color: "#A06A00" }}><Trophy size={15} /> BADGE COLLECTION</div>
              <h2>뱃지 컬렉션</h2>
              <p>획득한 뱃지와 앞으로 얻을 보상을 한눈에 확인해봐.</p>
            </div>
            <span>{clearedCount} / {totalConcepts} 수집</span>
          </div>
          <div className="badge-level-tabs" role="tablist" aria-label="뱃지 레벨 선택">
            {badgeLevels.map((group) => {
              const earnedInLevel = group.badges.filter((badge) => earnedConceptIds.has(badge.conceptId)).length;
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedLevel === group.level}
                  data-level={group.level}
                  className={selectedLevel === group.level ? "is-active" : ""}
                  onClick={() => setSelectedLevel(group.level)}
                  key={group.level}
                >
                  <strong>{group.label}</strong>
                  <span>{earnedInLevel}/{group.badges.length}</span>
                </button>
              );
            })}
          </div>
          <div className="progress-badge-grid">
                  {selectedLevelBadges.map((badge) => {
                    const earned = earnedConceptIds.has(badge.conceptId);
                    const practiced = practicedConceptIds.has(badge.conceptId);
                    const Icon = ICON_MAP[badge.iconName] || Terminal;
                    const badgeImagePath = getBadgeImagePath(badge.sourceConceptId);
                    const hex = COLOR_HEX[badge.colorClass] || "#7B5CF0";
                    const earnedDate = badge.clearedAt
                      ? new Date(badge.clearedAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "";
                    return (
                      <div key={badge.conceptId} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <div
                          className={earned ? "progress-badge-earned" : undefined}
                          tabIndex={0}
                          aria-label={earned
                            ? `${badge.nameKo}, ${earnedDate || "획득 완료"}`
                            : `${badge.nameKo}, 획득 조건: ${badge.conceptNameKo} 문제 해결`}
                          onMouseEnter={() => setVisibleBadgeTooltip(badge.conceptId)}
                          onMouseLeave={() => setVisibleBadgeTooltip(null)}
                          onFocus={() => setVisibleBadgeTooltip(badge.conceptId)}
                          onBlur={() => setVisibleBadgeTooltip(null)}
                          style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "1",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: 18,
                            outline: "none",
                            cursor: "help",
                            ...(earned
                              ? {
                                  background: `radial-gradient(circle at 38% 30%,#fff 0%,${hex}12 62%,${hex}22 100%)`,
                                  border: `2.5px solid ${hex}8A`,
                                  boxShadow: `inset 0 0 0 4px #fff, inset 0 0 0 5.5px ${hex}35, 0 7px 17px ${hex}32`,
                                }
                              : {
                                  background: `${hex}0D`,
                                  border: `2px dashed ${hex}45`,
                                  boxShadow: `inset 0 1px 0 rgba(255,255,255,.75)`,
                                }),
                          }}
                        >
                          {badgeImagePath ? (
                            <>
                              <Image
                                src={badgeImagePath}
                                alt=""
                                fill
                                sizes="(max-width: 520px) 45vw, 160px"
                                style={{
                                  zIndex: 1,
                                  objectFit: "contain",
                                  padding: 3,
                                  opacity: earned ? 1 : 0.3,
                                  filter: earned
                                    ? `drop-shadow(0 5px 5px ${hex}2E)`
                                    : "grayscale(.5) saturate(.18)",
                                }}
                              />
                              {earned ? (
                                <span className="progress-badge-shine" aria-hidden="true" />
                              ) : (
                                <span style={{ position: "absolute", zIndex: 2, right: 6, bottom: 6, width: 19, height: 19, display: "grid", placeItems: "center", borderRadius: "50%", background: "#fff", border: `1px solid ${hex}35`, boxShadow: "0 2px 6px rgba(73,60,110,.13)" }}>
                                  <Lock size={10.5} color="#9C92B8" strokeWidth={2.3} />
                                </span>
                              )}
                            </>
                          ) : earned ? (
                            <>
                              <Star
                                size={14}
                                fill="#FFC23C"
                                color="#E9A91D"
                                strokeWidth={1.6}
                                style={{ position: "absolute", top: 7, right: 7, filter: "drop-shadow(0 2px 2px rgba(210,143,9,.22))" }}
                              />
                              <div style={{ width: 48, height: 48, display: "grid", placeItems: "center", borderRadius: "50%", background: `${hex}14`, boxShadow: `inset 0 2px 3px rgba(255,255,255,.9), 0 4px 8px ${hex}24` }}>
                                <Icon size={27} color={hex} strokeWidth={2.15} style={{ filter: `drop-shadow(0 3px 2px ${hex}35)`, transform: "translateY(-1px)" }} />
                              </div>
                              <span className="progress-badge-shine" aria-hidden="true" />
                            </>
                          ) : (
                            <>
                              <Icon size={29} color={hex} strokeWidth={2} style={{ opacity: 0.28, filter: "saturate(.18)" }} />
                              <span style={{ position: "absolute", right: 6, bottom: 6, width: 19, height: 19, display: "grid", placeItems: "center", borderRadius: "50%", background: "#fff", border: `1px solid ${hex}35`, boxShadow: "0 2px 6px rgba(73,60,110,.13)" }}>
                                <Lock size={10.5} color="#9C92B8" strokeWidth={2.3} />
                              </span>
                            </>
                          )}
                          {visibleBadgeTooltip === badge.conceptId && (
                            <div
                              role="tooltip"
                              style={{
                                position: "absolute",
                                left: "50%",
                                bottom: "calc(100% + 10px)",
                                zIndex: 10,
                                width: 178,
                                transform: "translateX(-50%)",
                                padding: "9px 11px",
                                borderRadius: 10,
                                background: "#332B4D",
                                color: "#fff",
                                boxShadow: "0 8px 20px rgba(44,39,71,.22)",
                                fontSize: 11,
                                fontWeight: 600,
                                lineHeight: 1.45,
                                textAlign: "center",
                                pointerEvents: "none",
                              }}
                            >
                              {earned
                                ? `${earnedDate || "획득 완료"}에 획득했어요`
                                : `획득 조건: ${badge.conceptNameKo} 문제를 해결하세요`}
                              <span style={{ position: "absolute", left: "50%", top: "100%", width: 0, height: 0, transform: "translateX(-50%)", borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #332B4D" }} />
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: 10.5, fontWeight: earned ? 800 : 650, color: earned ? "#544D70" : "#8F87A8", textAlign: "center", lineHeight: 1.2 }}>
                          {badge.nameKo}
                        </span>
                        <span style={{ minHeight: 14, marginTop: -3, fontSize: 9.5, fontWeight: 650, color: earned ? hex : practiced ? "#8B6EE9" : "#AAA2BD", textAlign: "center", lineHeight: 1.2 }}>
                          {earned ? earnedDate : practiced ? "연습 중" : "도전 전"}
                        </span>
                      </div>
                    );
                  })}
          </div>
        </div>

        <div className="progress-history-grid">
          <section style={cardStyle} aria-labelledby="recent-achievements-title">
            <div className="progress-card-heading">
              <div>
                <div className="progress-section-kicker" style={{ color: "#A06A00" }}><Trophy size={15} /> RECENT ACHIEVEMENTS</div>
                <h2 id="recent-achievements-title">최근 업적</h2>
              </div>
            </div>
            {recentAchievements.length === 0 ? (
              <div className="progress-empty-state">
                <Trophy size={38} />
                <p>첫 번째 문제를 해결하면<br />여기에 업적이 기록돼.</p>
              </div>
            ) : (
              <div className="achievement-timeline">
                {recentAchievements.map((badge) => {
                  const imagePath = getBadgeImagePath(badge.sourceConceptId);
                  return (
                    <div className="achievement-row" key={badge.conceptId}>
                      <div className="achievement-icon">
                        {imagePath ? <Image src={imagePath} alt="" fill sizes="48px" style={{ objectFit: "contain" }} /> : <Trophy size={22} />}
                      </div>
                      <div>
                        <strong>{badge.nameKo} 획득</strong>
                        <span>{badge.conceptNameKo} 퀘스트를 완료했어</span>
                      </div>
                      <time>{new Date(badge.clearedAt!).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</time>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section style={cardStyle} aria-labelledby="feedback-history-title">
            <div className="progress-card-heading">
              <div>
                <div className="progress-section-kicker"><Zap size={15} /> LEARNING LOG</div>
                <h2 id="feedback-history-title">최근 학습 기록</h2>
              </div>
              <span>최근 {Math.min(feedbackHistory.length, 6)}개</span>
            </div>
            {feedbackHistory.length === 0 ? (
              <div className="progress-empty-state">
                <Zap size={38} />
                <p>아직 실행 기록이 없어.<br />코드를 실행하면 기록이 남아.</p>
              </div>
            ) : (
              <div className="learning-log-list">
                {feedbackHistory.slice(0, 6).map((item) => (
                  <details key={item.id}>
                    <summary>
                      <span className={item.isSuccess ? "is-success" : "is-error"}>{item.isSuccess ? "성공" : "오류"}</span>
                      <strong>{item.codeSnippet || "코드 실행"}</strong>
                      <time>{new Date(item.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}</time>
                    </summary>
                    <div>{item.aiFeedback}</div>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
