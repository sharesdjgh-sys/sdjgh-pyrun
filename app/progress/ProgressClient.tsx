"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BADGE_METADATA } from "@/lib/curriculum";
import { COLOR_HEX } from "@/components/badges/colorMap";
import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Lock,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package,
};

interface BadgeInfo { badgeId: number; conceptId: number; nameKo: string; iconName: string; colorClass: string; earned: boolean; }
interface FeedbackItem { id: number; aiFeedback: string; isSuccess: boolean; createdAt: string; codeSnippet: string; }

export default function ProgressClient() {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [clearedCount, setClearedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/badges").then((r) => r.json()),
      fetch("/api/progress").then((r) => r.json()),
    ]).then(([badgeData, progressData]) => {
      setBadges(badgeData.earned || []);
      setFeedbackHistory(progressData.feedbackHistory || []);
      setProgressPercent(progressData.progressPercent || 0);
      setClearedCount((progressData.clearedConceptIds || []).length);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3.5px solid #C6A2EC", borderTopColor: "#7B5CF0", borderRadius: "50%" }} />
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#fff", borderRadius: 24, border: "1px solid #EFEAF8",
    boxShadow: "0 12px 30px rgba(90,63,214,.07)", padding: "26px 28px",
  };

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
              <div style={{ fontSize: 13.5, color: "#8B83A8" }}>{clearedCount}개 / 16개 개념 완료</div>
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
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#7B5CF0", background: "#F2ECFD", padding: "4px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>{clearedCount} / 16</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 12 }}>
            {BADGE_METADATA.map((badge, idx) => {
              const cid = idx + 1;
              const earned = badges.some((b) => b.conceptId === cid && b.earned);
              const Icon = ICON_MAP[badge.iconName] || Terminal;
              const hex = COLOR_HEX[badge.colorClass] || "#7B5CF0";
              return (
                <div key={cid} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                  <div style={{ width: "100%", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 18, ...(earned ? { background: "#fff", border: `2.5px solid ${hex}40`, boxShadow: `0 6px 16px ${hex}2e` } : { background: "#F4F1FA", border: "2.5px dashed #E2DCF2" }) }}>
                    {earned ? <Icon size={26} color={hex} /> : <Lock size={20} color="#C9C1DE" />}
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, color: earned ? "#544D70" : "#BDB6D4", textAlign: "center", lineHeight: 1.2 }}>
                    {badge.nameKo}
                  </span>
                </div>
              );
            })}
          </div>
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
