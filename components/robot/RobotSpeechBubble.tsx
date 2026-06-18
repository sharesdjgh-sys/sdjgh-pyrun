"use client";

import { useEffect, useState } from "react";

interface RobotSpeechBubbleProps {
  text: string;
  visible: boolean;
}

export default function RobotSpeechBubble({ text, visible }: RobotSpeechBubbleProps) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!visible || !text) { setDisplayed(""); return; }
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 26);
    return () => clearInterval(timer);
  }, [text, visible]);

  if (!visible || !text) {
    return (
      <div style={{ fontSize: 13, color: "#B6AED0", alignSelf: "center", textAlign: "center" }}>
        코드를 실행하면 로봇이 말을 걸어요
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative", maxWidth: 300,
        background: "#fff", border: "2px solid #E9E1FA",
        borderRadius: 20, padding: "13px 16px",
        boxShadow: "0 8px 20px rgba(90,63,214,.12)",
        animation: "popIn .3s ease",
      }}
    >
      <div style={{ fontSize: 14, lineHeight: 1.5, color: "#3A3458" }}>
        {displayed}
        {displayed.length < text.length && (
          <span style={{ display: "inline-block", width: 6, height: 14, background: "#7B5CF0", borderRadius: 1, verticalAlign: -2, marginLeft: 1, animation: "caretBlink 1s steps(1) infinite" }} />
        )}
      </div>
      {/* Diamond tip */}
      <div style={{ position: "absolute", bottom: -9, left: "50%", transform: "translateX(-50%)", width: 16, height: 16, background: "#fff", borderRight: "2px solid #E9E1FA", borderBottom: "2px solid #E9E1FA", rotate: "45deg" }} />
    </div>
  );
}
