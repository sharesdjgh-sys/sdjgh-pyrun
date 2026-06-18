"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sword, Zap } from "lucide-react";

interface ClassCharactersProps {
  characters: ("warrior" | "archer")[];
  visible: boolean;
}

const CHARACTER_CONFIG = {
  warrior: { Icon: Sword, label: "전사", color: "text-red-400", bg: "bg-red-500/20 border-red-500/40" },
  archer: { Icon: Zap, label: "궁수", color: "text-yellow-400", bg: "bg-yellow-500/20 border-yellow-500/40" },
};

export default function ClassCharacters({ characters, visible }: ClassCharactersProps) {
  const unique = [...new Set(characters)].slice(0, 4);

  return (
    <AnimatePresence>
      {visible && unique.length > 0 && (
        <div className="flex gap-2 justify-center mt-2">
          {unique.map((char, i) => {
            const config = CHARACTER_CONFIG[char];
            return (
              <motion.div
                key={char}
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 60, opacity: 0 }}
                transition={{ delay: i * 0.15, duration: 0.4, ease: "easeOut" }}
                className={`flex flex-col items-center gap-1 border rounded-xl px-3 py-2 ${config.bg}`}
              >
                <config.Icon size={22} className={config.color} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
