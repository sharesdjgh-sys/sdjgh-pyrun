"use client";

import { motion, AnimatePresence } from "framer-motion";

interface VariableFloatProps {
  varName?: string;
  varValue?: string;
  visible: boolean;
}

export default function VariableFloat({ varName, varValue, visible }: VariableFloatProps) {
  if (!varName) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: [0, -6, 0], transition: { y: { duration: 1.5, repeat: Infinity } } }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-3 py-1 text-yellow-300 text-xs font-mono whitespace-nowrap"
        >
          {varName} = {varValue}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
