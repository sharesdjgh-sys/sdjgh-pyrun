"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RobotSpeechBubbleProps {
  text: string;
  visible: boolean;
}

export default function RobotSpeechBubble({ text, visible }: RobotSpeechBubbleProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!visible || !text) {
      setDisplayed("");
      return;
    }
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, [text, visible]);

  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.9 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative bg-slate-800 border border-slate-600 rounded-2xl px-4 py-3 max-w-xs text-sm text-slate-100 leading-relaxed speech-bubble-tail"
          style={{ minWidth: 120 }}
        >
          {displayed}
          {displayed.length < text.length && (
            <span className="inline-block w-1 h-3 bg-blue-400 ml-0.5 animate-pulse align-middle" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
