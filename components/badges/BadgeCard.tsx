"use client";

import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package, Lock,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package,
};

const COLOR_HEX: Record<string, string> = {
  "text-green-500": "#18C99A",
  "text-blue-500": "#4F8EF7",
  "text-yellow-500": "#FFB02E",
  "text-orange-500": "#FF7A59",
  "text-amber-500": "#FF9F40",
  "text-red-500": "#F5577A",
  "text-teal-500": "#14B8A6",
  "text-cyan-500": "#22B8CF",
  "text-sky-500": "#5B7CFA",
  "text-violet-500": "#8B5CF6",
  "text-pink-500": "#FF5C8A",
  "text-emerald-500": "#2BC48A",
  "text-lime-500": "#84CC16",
  "text-indigo-500": "#6366F1",
  "text-purple-500": "#A855F7",
  "text-orange-600": "#FB923C",
};

interface BadgeCardProps {
  nameKo: string;
  iconName: string;
  colorClass: string;
  earned: boolean;
  size?: "sm" | "md";
}

export default function BadgeCard({ nameKo, iconName, colorClass, earned, size = "md" }: BadgeCardProps) {
  const Icon = ICON_MAP[iconName] || Terminal;
  const hex = COLOR_HEX[colorClass] || "#7B5CF0";
  const isSm = size === "sm";

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: isSm ? 4 : 7,
    cursor: earned ? "default" : "default",
  };

  const iconBoxStyle: React.CSSProperties = isSm
    ? {
        width: "100%",
        aspectRatio: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 11,
        ...(earned
          ? { background: "#fff", border: `2px solid ${hex}33`, boxShadow: `0 3px 8px ${hex}22` }
          : { background: "#F4F1FA", border: "2px dashed #E2DCF2" }),
      }
    : {
        width: "100%",
        aspectRatio: "1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 18,
        ...(earned
          ? { background: "#fff", border: `2.5px solid ${hex}40`, boxShadow: `0 6px 16px ${hex}2e` }
          : { background: "#F4F1FA", border: "2.5px dashed #E2DCF2" }),
      };

  return (
    <div style={containerStyle}>
      <div style={iconBoxStyle}>
        {earned ? (
          <Icon size={isSm ? 16 : 26} color={hex} />
        ) : (
          <Lock size={isSm ? 13 : 20} color="#C9C1DE" />
        )}
      </div>
      {!isSm && (
        <span style={{ fontSize: 10.5, fontWeight: 600, color: earned ? "#544D70" : "#BDB6D4", textAlign: "center", lineHeight: 1.2 }}>
          {nameKo}
        </span>
      )}
    </div>
  );
}
