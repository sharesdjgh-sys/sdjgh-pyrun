"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Bot,
  Binary, FileText, ListChecks, Parentheses, BookOpen, Layers, Copy, Repeat, RefreshCcw,
  Braces, Network, ShieldAlert, Library, Search, BarChart2, TrendingUp, AlertCircle, Filter, Cpu, Award,
  ChevronRight, LockOpen, Sparkles, X,
} from "lucide-react";
import type { LearningUnitMeta } from "@/lib/curriculum-model";
import { nextConceptIdInOrders } from "@/lib/progress";
import { COLOR_HEX } from "./colorMap";
import { getBadgeImagePath } from "@/lib/badge-images";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Bot,
  Binary, FileText, ListChecks, Parentheses, BookOpen, Layers, Copy, Repeat, RefreshCcw,
  Braces, Network, ShieldAlert, Library, Search, BarChart2, TrendingUp, AlertCircle, Filter, Cpu, Award,
};

interface BadgeCelebrationProps {
  badgeIds: number[]; // 새로 획득한 뱃지의 conceptId 목록
  badges: LearningUnitMeta[];
  conceptOrders: number[][];
  feedback?: string; // AI 칭찬 문구
  onClose: () => void;
  onNext?: (conceptId: number) => void; // "다음 단계 공부하기" 클릭 시 다음 개념 ID 전달
}

export default function BadgeCelebration({
  badgeIds,
  badges,
  conceptOrders,
  feedback,
  onClose,
  onNext,
}: BadgeCelebrationProps) {
  const confettiRef = useRef<{ style: Record<string, string> }[] | null>(null);
  const sparkleRef = useRef<{ style: Record<string, string> }[] | null>(null);
  const [advancing, setAdvancing] = useState(false);

  if (!confettiRef.current) {
    const cc = ["#FFE58A", "#FFC23C", "#A98BFF", "#FF77AC", "#62E7C1", "#7FB2FF"];
    confettiRef.current = Array.from({ length: 84 }, () => {
      const sz = 4 + Math.random() * 8;
      return {
        style: {
          position: "absolute",
          top: (-20 - Math.random() * 30) + "px",
          left: Math.random() * 100 + "%",
          width: sz + "px",
          height: (sz * (Math.random() > 0.55 ? 1 : 0.42)) + "px",
          background: cc[Math.floor(Math.random() * cc.length)],
          borderRadius: Math.random() > 0.7 ? "50%" : "2px",
          boxShadow: "0 0 8px rgba(255,255,255,.35)",
          animation: `confettiFall ${(2.8 + Math.random() * 2.2).toFixed(2)}s ${(Math.random() * 0.9).toFixed(2)}s cubic-bezier(.2,.55,.35,1) forwards`,
        },
      };
    });
  }

  if (!sparkleRef.current) {
    sparkleRef.current = Array.from({ length: 30 }, () => {
      const size = 2 + Math.random() * 5;
      return {
        style: {
          position: "absolute",
          left: (8 + Math.random() * 84) + "%",
          top: (10 + Math.random() * 78) + "%",
          width: size + "px",
          height: size + "px",
          borderRadius: "50%",
          background: Math.random() > 0.45 ? "#FFE89A" : "#C8B8FF",
          boxShadow: "0 0 10px currentColor",
          animation: `rewardParticle ${(1.7 + Math.random() * 2.3).toFixed(2)}s ${(Math.random() * 1.4).toFixed(2)}s ease-in-out infinite`,
        },
      };
    });
  }

  useEffect(() => {
    if (badgeIds.length === 0) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [badgeIds.length, onClose]);

  if (badgeIds.length === 0) return null;

  const badgeMeta = badgeIds
    .map((cid) => badges.find((b) => b.id === cid))
    .filter((b): b is LearningUnitMeta => Boolean(b));

  const firstBadge = badgeMeta[0];
  const Icon = firstBadge ? (ICON_MAP[firstBadge.iconName] || Terminal) : Terminal;
  const badgeImagePath = getBadgeImagePath(firstBadge?.sourceConceptId);
  const hex = firstBadge ? (COLOR_HEX[firstBadge.colorClass] || "#18C99A") : "#18C99A";

  const nextId = firstBadge
    ? firstBadge.sourceConceptId === 0
      ? (conceptOrders[0]?.[0] ?? null)
      : nextConceptIdInOrders(firstBadge.id, conceptOrders)
    : null;
  const nextBadge = nextId !== null ? badges.find((b) => b.id === nextId) : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-celebration-title"
      className="reward-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: 20,
        background: `radial-gradient(circle at 50% 42%,${hex}42 0%,rgba(38,24,83,.82) 30%,rgba(13,10,35,.96) 72%)`,
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div className="reward-vignette" aria-hidden="true" />
      <div className="reward-rays" aria-hidden="true" />
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }} aria-hidden="true">
        {sparkleRef.current.map((particle, index) => (
          <span key={`sparkle-${index}`} style={particle.style as React.CSSProperties} />
        ))}
        {confettiRef.current.map((c, i) => (
          <div key={i} style={c.style as React.CSSProperties} />
        ))}
      </div>

      <div
        className="reward-panel"
        style={{
          position: "relative",
          width: "min(450px, calc(100vw - 34px))",
          maxHeight: "calc(100vh - 24px)",
          overflow: "hidden",
          border: "1px solid rgba(255,232,157,.48)",
          borderRadius: 30,
          padding: "30px 34px 28px",
          textAlign: "center",
          color: "#fff",
          background: "linear-gradient(155deg,rgba(42,30,91,.96),rgba(21,17,55,.98) 62%,rgba(34,22,73,.98))",
          boxShadow: `0 0 0 1px rgba(255,255,255,.06),0 0 55px ${hex}52,0 38px 90px rgba(0,0,0,.62)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="뱃지 획득 창 닫기"
          style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, display: "grid", placeItems: "center", border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, background: "rgba(255,255,255,.06)", color: "#BFB6DD", cursor: "pointer" }}
        >
          <X size={16} />
        </button>

        <div className="reward-kicker">
          <span />
          <Sparkles size={13} color="#FFE084" />
          ACHIEVEMENT UNLOCKED
          <span />
        </div>

        <h2 id="badge-celebration-title" className="reward-title">
          새 뱃지 획득
        </h2>
        <div className="reward-subtitle" style={{ marginTop: 5, color: "#BEB4DA", fontSize: 13.5, letterSpacing: "-.01em" }}>
          새로운 코딩 등급을 달성했어
        </div>

        <div className="reward-emblem-stage" style={{ margin: "22px auto 13px" }}>
          <div className="reward-halo reward-halo-outer" style={{ borderColor: `${hex}88` }} />
          <div className="reward-halo reward-halo-inner" style={{ borderColor: "rgba(255,220,111,.66)" }} />
          <div className="reward-emblem-glow" style={{ background: hex, boxShadow: `0 0 70px 24px ${hex}66` }} />
          {badgeImagePath ? (
            <div className="reward-badge-image-shell">
              <Image
                src={badgeImagePath}
                alt={firstBadge ? `${firstBadge.badgeNameKo} 뱃지` : "획득한 뱃지"}
                fill
                sizes="170px"
                priority
                style={{ objectFit: "contain", filter: "drop-shadow(0 16px 14px rgba(0,0,0,.42))" }}
              />
              <span className="reward-emblem-sweep" />
            </div>
          ) : (
            <div
              className="reward-emblem-frame"
              style={{ background: `linear-gradient(145deg,#FFF0A8 0%,#D99D25 28%,${hex} 60%,#FFF4BB 100%)` }}
            >
              <div className="reward-emblem-core" style={{ background: `radial-gradient(circle at 38% 28%,${hex} 0%,#2B1B5C 68%,#171132 100%)` }}>
                <Icon size={52} color="#fff" strokeWidth={1.85} style={{ filter: "drop-shadow(0 5px 5px rgba(0,0,0,.36))" }} />
                <span className="reward-emblem-sweep" />
              </div>
            </div>
          )}
          <Sparkles className="reward-emblem-star reward-emblem-star-left" size={20} color="#FFE898" />
          <Sparkles className="reward-emblem-star reward-emblem-star-right" size={16} color="#fff" />
        </div>

        {firstBadge && (
          <>
            <div className="reward-rank-label" style={{ color: "#AFA4CE", fontSize: 11, fontWeight: 800, letterSpacing: ".16em" }}>
              NEW RANK
            </div>
            <div className="reward-rank-name" style={{ marginTop: 3, fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 28, color: "#FFF4C8", textShadow: `0 0 18px ${hex}99` }}>
              {firstBadge.badgeNameKo}
            </div>
            <div className="reward-concept-name" style={{ marginTop: 5, color: "#D2C9E8", fontSize: 13.5 }}>
              {firstBadge.nameKo} 개념 마스터
            </div>
          </>
        )}

        {feedback && (
          <div className="reward-feedback" style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, lineHeight: 1.58, color: "#E3DDF2", background: "rgba(255,255,255,.055)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 14, padding: "12px 14px", textAlign: "left" }}>
            <Sparkles size={16} color="#FFD86B" style={{ flex: "none", marginTop: 2 }} />
            <span>{feedback}</span>
          </div>
        )}

        {nextBadge && (
          <div className="reward-next-unlock" style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 12.5, fontWeight: 750, color: "#FFE7A0", background: "rgba(255,210,81,.09)", border: "1px solid rgba(255,218,105,.22)", padding: "9px 13px", borderRadius: 12 }}>
            <LockOpen size={14} />
            다음 단계 해금 · {nextBadge.nameKo}
          </div>
        )}

        {nextBadge && onNext ? (
          <>
            <button
              type="button"
              onClick={() => {
                if (advancing) return;
                setAdvancing(true);
                onNext(nextBadge.id);
              }}
              disabled={advancing}
              aria-busy={advancing}
              autoFocus
              className="reward-primary-button"
              style={{ marginTop: 18 }}
            >
              {advancing ? "다음 단계 여는 중..." : "다음 단계 도전하기"}
              <ChevronRight size={18} strokeWidth={2.6} />
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={advancing}
              className="reward-secondary-button"
            >
              조금 더 연습하기
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onClose}
            autoFocus
            className="reward-primary-button"
            style={{ marginTop: 18 }}
          >
            레벨 완주 확인
            <Sparkles size={17} />
          </button>
        )}
      </div>
    </div>
  );
}
