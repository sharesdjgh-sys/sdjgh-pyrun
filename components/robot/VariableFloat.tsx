"use client";

interface VariableFloatProps {
  varName?: string;
  varValue?: string;
  visible: boolean;
}

export default function VariableFloat({ varName, varValue, visible }: VariableFloatProps) {
  if (!varName || !visible) return null;

  return (
    <div
      style={{
        position: "absolute", top: -44, left: "50%", transform: "translateX(-50%)",
        zIndex: 3, animation: "floatChip 1.6s ease-in-out infinite",
        background: "#FFF6DC", border: "2px solid #FFD970", borderRadius: 12,
        padding: "5px 12px",
        fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
        fontSize: 12.5, fontWeight: 700, color: "#A87A12",
        boxShadow: "0 5px 12px rgba(255,193,60,.3)",
        whiteSpace: "nowrap",
      }}
    >
      {varName} = {varValue}
    </div>
  );
}
