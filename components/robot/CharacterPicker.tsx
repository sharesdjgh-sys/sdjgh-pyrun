"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ActiveCharacterType, CharacterLoadout } from "@/types";
import { ACTIVE_CHARACTERS } from "@/lib/cosmetics";
import RobotCharacter from "./RobotCharacter";
import DogCharacter from "./DogCharacter";
import GameCharacter from "./GameCharacter";
import WizardCharacter from "./WizardCharacter";
import AstronautCharacter from "./AstronautCharacter";
import SlimeCharacter from "./SlimeCharacter";

interface CharacterPickerProps {
  value: ActiveCharacterType;
  onChange: (value: ActiveCharacterType) => void;
  loadouts?: Record<ActiveCharacterType, CharacterLoadout>;
}

interface CharacterOption {
  type: ActiveCharacterType;
  label: string;
  color: string;
  tint: string;
}

const CHARACTER_OPTIONS: CharacterOption[] = ACTIVE_CHARACTERS;

function CharacterPreview({ type, size = 54, loadout }: { type: ActiveCharacterType; size?: number; loadout?: CharacterLoadout }) {
  const props = { state: "idle" as const, size, loadout };
  if (type === "dog") return <DogCharacter {...props} />;
  if (type === "game") return <GameCharacter {...props} />;
  if (type === "wizard") return <WizardCharacter {...props} />;
  if (type === "astronaut") return <AstronautCharacter {...props} />;
  if (type === "slime") return <SlimeCharacter {...props} />;
  return <RobotCharacter {...props} />;
}

export default function CharacterPicker({ value, onChange, loadouts }: CharacterPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selected = CHARACTER_OPTIONS.find((option) => option.type === value) ?? CHARACTER_OPTIONS[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: "relative", zIndex: 60 }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="character-picker-menu"
        onClick={() => setOpen((current) => !current)}
        style={{
          minWidth: 128,
          height: 31,
          padding: "0 10px",
          border: "1.5px solid #DED6F3",
          borderRadius: 10,
          background: "#FFFFFF",
          color: "#675D82",
          boxShadow: open ? "0 4px 12px rgba(89,67,160,.14)" : "0 2px 5px rgba(89,67,160,.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          cursor: "pointer",
          fontSize: 11.5,
          fontWeight: 800,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 24, height: 24, overflow: "hidden", display: "grid", placeItems: "start center" }}>
            <CharacterPreview type={selected.type} size={24} loadout={loadouts?.[selected.type]} />
          </span>
          {selected.label}
        </span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .16s ease" }}
        />
      </button>

      {open && (
        <div
          id="character-picker-menu"
          role="menu"
          aria-label="캐릭터 선택"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            width: 318,
            padding: 8,
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 6,
            border: "1px solid #E5DFF2",
            borderRadius: 14,
            background: "rgba(255,255,255,.98)",
            boxShadow: "0 14px 32px rgba(61,43,115,.18)",
            backdropFilter: "blur(10px)",
          }}
        >
          {CHARACTER_OPTIONS.map((option) => {
            const isSelected = option.type === value;
            return (
              <button
                key={option.type}
                type="button"
                role="menuitemradio"
                aria-checked={isSelected}
                onClick={() => {
                  onChange(option.type);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                style={{
                  minHeight: 104,
                  padding: "7px 5px 8px",
                  border: isSelected ? `1.5px solid ${option.color}` : "1.5px solid transparent",
                  borderRadius: 10,
                  background: isSelected ? option.tint : "#FAF9FD",
                  color: isSelected ? option.color : "#7D7496",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                <span style={{ width: 68, height: 70, overflow: "hidden", display: "grid", placeItems: "start center" }}>
                  <CharacterPreview type={option.type} size={62} loadout={loadouts?.[option.type]} />
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
