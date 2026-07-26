"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { COLOR_HEX } from "@/components/badges/colorMap";
import { getBadgeImagePath } from "@/lib/badge-images";
import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Lock, Bot,
  Binary, FileText, ListChecks, Parentheses, BookOpen, Layers, Copy, Repeat, RefreshCcw,
  Braces, Network, ShieldAlert, Library, Search, BarChart2, TrendingUp, AlertCircle, Filter, Cpu, Award,
  Star,
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
  earned: boolean;
  clearedAt: string | null;
}
interface FeedbackItem { id: number; aiFeedback: string; isSuccess: boolean; createdAt: string; codeSnippet: string; }

export default function ProgressClient() {
  const [earnedConceptIds, setEarnedConceptIds] = useState<Set<number>>(new Set());
  const [practicedConceptIds, setPracticedConceptIds] = useState<Set<number>>(new Set());
  const [visibleBadgeTooltip, setVisibleBadgeTooltip] = useState<number | null>(null);
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [clearedCount, setClearedCount] = useState(0);
  const [practicedCount, setPracticedCount] = useState(0);
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
      setFeedbackHistory(progressData.feedbackHistory || []);
      setProgressPercent(progressData.progressPercent || 0);
      setClearedCount((progressData.clearedConceptIds || []).length);
      setPracticedCount((progressData.practicedConceptIds || []).length);
      setPracticedConceptIds(new Set(progressData.practicedConceptIds || []));
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
      label: `Level ${level}`,
      badges: badges.filter((badge) => badge.level === level),
    }));

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

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "30px 22px 60px", display: "flex", flexDirection: "column", gap: 22 }}>

        {/* Progress card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(140deg,#8B6CFF,#7B5CF0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 14px rgba(123,92,240,.32)", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 18, color: "#2C2747" }}>학습 진행률</div>
              <div style={{ fontSize: 13.5, color: "#8B83A8" }}>문제 해결 {clearedCount}개 / {totalConcepts}개 · 연습 {practicedCount}개</div>
            </div>
            <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 34, color: "#7B5CF0" }}>{progressPercent}%</div>
          </div>
          <div style={{ height: 18, borderRadius: 99, background: "#F0EBFA", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPercent}%`, borderRadius: 99, background: "linear-gradient(90deg,#7B5CF0,#FF8FB8,#FFC23C)", backgroundSize: "240px 100%", animation: "barShimmer 2.2s linear infinite", boxShadow: "0 2px 8px rgba(123,92,240,.4)", transition: "width 0.5s ease" }} />
          </div>
        </div>

        {/* Badges card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 20 }}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFC23C" stroke="#FFC23C" strokeWidth="1.5" strokeLinejoin="round" style={{ animation: "starSpin 14s linear infinite", flexShrink: 0 }}>
              <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 17.5 5.5 21.5 7 14.5 2 9.5 9 9" />
            </svg>
            <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 18, color: "#2C2747", whiteSpace: "nowrap" }}>획득한 뱃지</div>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#7B5CF0", background: "#F2ECFD", padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>{clearedCount} / {totalConcepts}</span>
          </div>
          {badgeLevels.map((level) => {
            const levelEarned = level.badges.filter((b) => earnedConceptIds.has(b.conceptId)).length;
            return (
              <div key={level.label} style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#544D70" }}>{level.label}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#9C92BE", background: "#F6F3FC", padding: "3px 9px", borderRadius: 99 }}>{levelEarned} / {level.badges.length}</span>
                </div>
                <div className="progress-badge-grid">
                  {level.badges.map((badge) => {
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
            );
          })}
        </div>

        {/* Feedback history card */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="#7B5CF0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 18, color: "#2C2747" }}>AI 피드백 기록</div>
          </div>

          {feedbackHistory.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#BDB6D4", fontSize: 14 }}>
              아직 코드를 실행한 기록이 없어요. 학습 화면에서 코드를 실행해보세요.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {feedbackHistory.map((item) => (
                <div key={item.id} style={{ border: "1px solid #F0EBFA", borderRadius: 16, padding: "15px 17px", background: "#FCFBFF" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: item.isSuccess ? "#0FA37C" : "#E23E70", background: item.isSuccess ? "#E3FBF1" : "#FFE8EF", padding: "4px 10px", borderRadius: 99 }}>
                      {item.isSuccess ? "성공" : "오류"}
                    </span>
                    <span style={{ fontSize: 12, color: "#B6AED0" }}>
                      {new Date(item.createdAt).toLocaleDateString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {item.codeSnippet && (
                    <div style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 12.5, color: "#6B6586", background: "#F3EFFB", borderRadius: 9, padding: "8px 11px", marginBottom: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.codeSnippet}{item.codeSnippet.length >= 100 ? "..." : ""}
                    </div>
                  )}
                  <div style={{ fontSize: 13.5, lineHeight: 1.55, color: "#3A3458" }}>{item.aiFeedback}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
