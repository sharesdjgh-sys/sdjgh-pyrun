"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { SelectableCharacterType } from "@/types";

interface CharacterPickerProps {
  value: SelectableCharacterType;
  onChange: (value: SelectableCharacterType) => void;
}

interface CharacterOption {
  type: SelectableCharacterType;
  label: string;
  image: string;
  color: string;
  tint: string;
}

const CHARACTER_OPTIONS: CharacterOption[] = [
  { type: "robot", label: "로봇", image: "/character-icons/robot.webp", color: "#7B5CF0", tint: "#F2ECFD" },
  { type: "dog", label: "강아지", image: "/character-icons/dog.webp", color: "#D97706", tint: "#FFF7E8" },
  { type: "game", label: "전사", image: "/character-icons/warrior.webp", color: "#E2557A", tint: "#FFF0F4" },
  { type: "wizard", label: "마법사", image: "/character-icons/wizard.webp", color: "#7251D6", tint: "#F0EBFF" },
  { type: "astronaut", label: "우주비행사", image: "/character-icons/astronaut.webp", color: "#1687A7", tint: "#EAF9FC" },
  { type: "slime", label: "슬라임", image: "/character-icons/slime.webp", color: "#169E83", tint: "#E9FAF5" },
];

export default function CharacterPicker({ value, onChange }: CharacterPickerProps) {
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
          <Image
            src={selected.image}
            alt=""
            width={22}
            height={22}
            style={{ width: 22, height: 22, borderRadius: 7, objectFit: "cover" }}
          />
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
            width: 300,
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
                  minHeight: 88,
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
                <Image
                  src={option.image}
                  alt=""
                  width={54}
                  height={54}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 12,
                    objectFit: "cover",
                    boxShadow: isSelected ? `0 4px 10px ${option.color}33` : "0 2px 7px rgba(61,43,115,.12)",
                  }}
                />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
