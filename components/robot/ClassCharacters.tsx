"use client";

interface ClassCharactersProps {
  characters: ("warrior" | "archer")[];
  visible: boolean;
}

const CONFIG = {
  warrior: { label: "전사", color: "#FF5C8A", bg: "#FFF0F4", border: "#FFD0DC" },
  archer:  { label: "궁수", color: "#FFB02E", bg: "#FFF9EC", border: "#FFE29A" },
};

export default function ClassCharacters({ characters, visible }: ClassCharactersProps) {
  if (!visible || characters.length === 0) return null;
  const unique = [...new Set(characters)].slice(0, 4);

  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
      {unique.map((char, i) => {
        const c = CONFIG[char];
        return (
          <div
            key={char}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
              border: `1.5px solid ${c.border}`, borderRadius: 16, padding: "8px 14px",
              background: c.bg,
              animation: `popIn 0.4s ease ${i * 0.12}s both`,
            }}
          >
            {char === "warrior" ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m14.5 17.5-5-5" /><path d="m5.5 2.5 2 2-4 4 2 2L9 7l2 2 3.5-3.5-4.5-4.5z" /><path d="m9 7 5 5" /><path d="m14.5 9.5 4 4-3 3-4-4" /><path d="m19.5 14.5-1 1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={c.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2a4 4 0 0 1 4 4 4 4 0 0 1-4 4" /><path d="m10 10 6.5-6.5" /><path d="M3.5 17.5c1.4-1.4 5.1-3.9 8-1s.6 6.6-.8 8" /><path d="M3.5 17.5 7 21" /><path d="M7 17.5 3.5 21" />
              </svg>
            )}
            <span style={{ fontSize: 11.5, fontWeight: 700, color: c.color }}>{c.label}</span>
          </div>
        );
      })}
    </div>
  );
}
