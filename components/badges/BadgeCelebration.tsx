"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package,
} from "lucide-react";
import { BADGE_METADATA } from "@/lib/curriculum";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal, Variable, Calculator, Scale, Equal, GitBranch, Hash, Type,
  List, ToggleLeft, GitMerge, RotateCcw, RefreshCw, FunctionSquare, Boxes, Package,
};

interface BadgeCelebrationProps {
  badgeIds: number[];
  onClose: () => void;
}

export default function BadgeCelebration({ badgeIds, onClose }: BadgeCelebrationProps) {
  const badges = badgeIds
    .map((id) => {
      const allBadges = BADGE_METADATA;
      return allBadges.find((_, idx) => idx + 1 === id) || allBadges[0];
    })
    .filter(Boolean);

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {badgeIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-slate-800 border border-slate-600 rounded-3xl p-8 flex flex-col items-center gap-5 max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl"
            >
              <span className="text-yellow-400 text-5xl">★</span>
            </motion.div>

            <div className="text-center">
              <p className="text-slate-400 text-sm mb-1">새 뱃지 획득!</p>
              <h2 className="text-white text-xl font-bold">개념 마스터 달성</h2>
            </div>

            <div className="flex gap-3 flex-wrap justify-center">
              {badges.map((badge, i) => {
                const Icon = ICON_MAP[badge.iconName] || Terminal;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                    className="flex flex-col items-center gap-2 bg-slate-700 rounded-2xl p-4"
                  >
                    <div className="w-14 h-14 bg-slate-600 rounded-xl flex items-center justify-center">
                      <Icon size={28} className={badge.colorClass} />
                    </div>
                    <span className="text-white text-sm font-semibold">{badge.nameKo}</span>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="mt-2 text-slate-400 text-sm hover:text-white transition-colors"
            >
              닫기
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
