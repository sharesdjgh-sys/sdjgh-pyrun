"use client";

import { motion } from "framer-motion";
import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package,
  Lock,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package,
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
  const isSm = size === "sm";

  return (
    <motion.div
      whileHover={{ scale: earned ? 1.05 : 1 }}
      className={`flex flex-col items-center gap-1.5 rounded-xl border transition-all ${
        earned
          ? "bg-slate-800 border-slate-600"
          : "bg-slate-900/50 border-slate-700/50 opacity-50"
      } ${isSm ? "p-2" : "p-3"}`}
    >
      <div
        className={`rounded-lg flex items-center justify-center ${
          isSm ? "w-8 h-8" : "w-10 h-10"
        } ${earned ? "bg-slate-700" : "bg-slate-800"}`}
      >
        {earned ? (
          <Icon size={isSm ? 16 : 20} className={colorClass} />
        ) : (
          <Lock size={isSm ? 14 : 18} className="text-slate-600" />
        )}
      </div>
      <span className={`text-center font-medium leading-tight ${isSm ? "text-xs" : "text-xs"} ${earned ? "text-slate-200" : "text-slate-600"}`}>
        {nameKo}
      </span>
    </motion.div>
  );
}
