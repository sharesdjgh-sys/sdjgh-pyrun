"use client";

import { useRef } from "react";
import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Bot,
  Binary, FileText, ListChecks, Parentheses, BookOpen, Layers, Copy, Repeat, RefreshCcw,
  Braces, Network, ShieldAlert, Library, Search, BarChart2, TrendingUp, AlertCircle, Filter, Cpu, Award,
} from "lucide-react";
import { BADGE_METADATA, BADGE_METADATA_LV2, BADGE_METADATA_LV3 } from "@/lib/curriculum";
import { nextConceptId } from "@/lib/progress";
import { COLOR_HEX } from "./colorMap";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Bot,
  Binary, FileText, ListChecks, Parentheses, BookOpen, Layers, Copy, Repeat, RefreshCcw,
  Braces, Network, ShieldAlert, Library, Search, BarChart2, TrendingUp, AlertCircle, Filter, Cpu, Award,
};

const ALL_BADGES = [...BADGE_METADATA, ...BADGE_METADATA_LV2, ...BADGE_METADATA_LV3];

interface BadgeCelebrationProps {
  badgeIds: number[]; // 새로 획득한 뱃지의 conceptId 목록
  feedback?: string; // AI 칭찬 문구
  onClose: () => void;
  onNext?: (conceptId: number) => void; // "다음 단계 공부하기" 클릭 시 다음 개념 ID 전달
}

export default function BadgeCelebration({ badgeIds, feedback, onClose, onNext }: BadgeCelebrationProps) {
  const confettiRef = useRef<{ style: Record<string, string> }[] | null>(null);

  if (!confettiRef.current) {
    const cc = ["#7B5CF0", "#FF5C8A", "#18C99A", "#FFC23C", "#4F8EF7", "#FF7A59"];
    confettiRef.current = Array.from({ length: 70 }, () => {
      const sz = 7 + Math.random() * 9;
      return {
        style: {
          position: "absolute",
          top: (-10 - Math.random() * 20) + "px",
          left: Math.random() * 100 + "%",
          width: sz + "px",
          height: sz + "px",
          background: cc[Math.floor(Math.random() * cc.length)],
          borderRadius: Math.random() > 0.5 ? "50%" : "3px",
          animation: `confettiFall ${(2 + Math.random() * 1.8).toFixed(2)}s ${(Math.random() * 0.6).toFixed(2)}s linear forwards`,
        },
      };
    });
  }

  if (badgeIds.length === 0) return null;

  const badgeMeta = badgeIds
    .map((cid) => ALL_BADGES.find((b) => b.conceptId === cid))
    .filter((b): b is (typeof ALL_BADGES)[number] => Boolean(b));

  const firstBadge = badgeMeta[0];
  const Icon = firstBadge ? (ICON_MAP[firstBadge.iconName] || Terminal) : Terminal;
  const hex = firstBadge ? (COLOR_HEX[firstBadge.colorClass] || "#18C99A") : "#18C99A";

  const nextId = firstBadge ? nextConceptId(firstBadge.conceptId) : null;
  const nextBadge = nextId !== null ? ALL_BADGES.find((b) => b.conceptId === nextId) : undefined;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(44,39,71,.45)", backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      {/* Confetti */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {confettiRef.current.map((c, i) => (
          <div key={i} style={c.style as React.CSSProperties} />
        ))}
      </div>

      <div
        style={{ position: "relative", background: "#fff", borderRadius: 30, padding: "38px 40px", textAlign: "center", boxShadow: "0 30px 70px rgba(44,39,71,.35)", animation: "popIn .4s ease", maxWidth: 340 }}
        onClick={(e) => e.stopPropagation()}
      >
        <svg viewBox="0 0 24 24" width="40" height="40" fill="#FFC23C" stroke="#FFC23C" strokeWidth="1.2" strokeLinejoin="round" style={{ animation: "starSpin 8s linear infinite" }}>
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 21.5 12 17.5 5.5 21.5 7 14.5 2 9.5 9 9" />
        </svg>

        <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 24, marginTop: 8, color: "#2C2747" }}>새 뱃지 획득!</div>
        <div style={{ fontSize: 14, color: "#8B83A8", marginTop: 4, marginBottom: 22 }}>
          {firstBadge ? `${firstBadge.nameKo.replace(" 마스터", "")} 개념을 마스터했어요` : "첫 개념을 성공했어요"}
        </div>

        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ width: 84, height: 84, borderRadius: 24, background: `${hex}1A`, border: `3px solid ${hex}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 24px ${hex}4d`, animation: "floatChip 2.2s ease-in-out infinite" }}>
            <Icon size={38} color={hex} />
          </div>
          {firstBadge && (
            <div style={{ fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 18, color: hex }}>
              {firstBadge.nameKo}
            </div>
          )}
        </div>

        {feedback && (
          <div style={{ marginTop: 18, fontSize: 13.5, lineHeight: 1.6, color: "#544D70", background: "#FCFAFF", border: "1px solid #F0EBFA", borderRadius: 14, padding: "12px 15px", textAlign: "left" }}>
            🤖 {feedback}
          </div>
        )}

        {nextBadge && (
          <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#7B5CF0", background: "#F2ECFD", padding: "7px 14px", borderRadius: 99 }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
            다음 단계 잠금 해제: {nextBadge.nameKo.replace(" 마스터", "")}
          </div>
        )}

        {nextBadge && onNext ? (
          <>
            <button
              onClick={() => onNext(nextBadge.conceptId)}
              style={{ marginTop: 18, width: "100%", padding: 14, border: "none", borderRadius: 16, background: "linear-gradient(180deg,#8B6CFF,#7B5CF0)", color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "0 5px 0 #5B3FD6", transition: "transform .12s" }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #5B3FD6"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 5px 0 #5B3FD6"; }}
            >
              다음 단계 공부하기 →
            </button>
            <button
              onClick={onClose}
              style={{ marginTop: 10, width: "100%", padding: 11, border: "none", borderRadius: 14, background: "transparent", color: "#8B83A8", fontFamily: "inherit", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F6F3FC"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              조금 더 연습하기
            </button>
          </>
        ) : (
          <button
            onClick={onClose}
            style={{ marginTop: 18, width: "100%", padding: 14, border: "none", borderRadius: 16, background: "linear-gradient(180deg,#FFC23C,#F5A623)", color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "0 5px 0 #D98E12", transition: "transform .12s" }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #D98E12"; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 5px 0 #D98E12"; }}
          >
            레벨 완주! 정말 대단해요 🎉
          </button>
        )}
      </div>
    </div>
  );
}
