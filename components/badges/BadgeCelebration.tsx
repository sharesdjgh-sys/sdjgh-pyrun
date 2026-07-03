"use client";

import { useEffect, useRef } from "react";
import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Bot,
  Binary, FileText, ListChecks, Parentheses, BookOpen, Layers, Copy, Repeat, RefreshCcw,
  Braces, Network, ShieldAlert, Library, Search, BarChart2, TrendingUp, AlertCircle, Filter, Cpu, Award,
} from "lucide-react";
import { BADGE_METADATA, BADGE_METADATA_LV2, BADGE_METADATA_LV3 } from "@/lib/curriculum";
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
  onClose: () => void;
}

export default function BadgeCelebration({ badgeIds, onClose }: BadgeCelebrationProps) {
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

  useEffect(() => {
    if (badgeIds.length === 0) return;
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [badgeIds, onClose]);

  if (badgeIds.length === 0) return null;

  const badgeMeta = badgeIds
    .map((cid) => ALL_BADGES.find((b) => b.conceptId === cid))
    .filter((b): b is (typeof ALL_BADGES)[number] => Boolean(b));

  const firstBadge = badgeMeta[0];
  const Icon = firstBadge ? (ICON_MAP[firstBadge.iconName] || Terminal) : Terminal;
  const hex = firstBadge ? (COLOR_HEX[firstBadge.colorClass] || "#18C99A") : "#18C99A";

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

        <button
          onClick={onClose}
          style={{ marginTop: 24, width: "100%", padding: 14, border: "none", borderRadius: 16, background: "linear-gradient(180deg,#8B6CFF,#7B5CF0)", color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 16, cursor: "pointer", boxShadow: "0 5px 0 #5B3FD6", transition: "transform .12s" }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #5B3FD6"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 5px 0 #5B3FD6"; }}
        >
          좋아요!
        </button>
      </div>
    </div>
  );
}
