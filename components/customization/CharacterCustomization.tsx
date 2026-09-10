"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Gift, Lock, Shirt, Sparkles, X } from "lucide-react";
import CharacterPicker from "@/components/robot/CharacterPicker";
import RobotCharacter from "@/components/robot/RobotCharacter";
import DogCharacter from "@/components/robot/DogCharacter";
import GameCharacter from "@/components/robot/GameCharacter";
import WizardCharacter from "@/components/robot/WizardCharacter";
import AstronautCharacter from "@/components/robot/AstronautCharacter";
import SlimeCharacter from "@/components/robot/SlimeCharacter";
import { ACTIVE_CHARACTERS, COSMETIC_FAMILIES, cosmeticItemKey, parseCosmeticItemKey } from "@/lib/cosmetics";
import type { ActiveCharacterType, CharacterLoadout, CosmeticSlot } from "@/types";
import styles from "./CharacterCustomization.module.css";

type PendingGrant = {
  id: number;
  sourceType: "group" | "ai";
  familyKey: string | null;
  availability: Record<ActiveCharacterType, number>;
};

type CustomizationState = {
  activeCharacter: ActiveCharacterType;
  inventory: string[];
  loadouts: Record<ActiveCharacterType, CharacterLoadout>;
  pendingGrants: PendingGrant[];
  aiProgress: { solved: number; target: number };
};

type Props = {
  value: ActiveCharacterType;
  onChange: (value: ActiveCharacterType) => void;
  onLoadoutsChange: (value: Record<ActiveCharacterType, CharacterLoadout>) => void;
  rewardSignal: number;
};

const EMPTY_LOADOUTS: Record<ActiveCharacterType, CharacterLoadout> = {
  robot: {}, dog: {}, game: {}, wizard: {}, astronaut: {}, slime: {},
};
const SLOT_LABEL: Record<CosmeticSlot, string> = { head: "머리", face: "얼굴", body: "몸", back: "등" };

function Preview({ type, loadout, size = 150 }: { type: ActiveCharacterType; loadout?: CharacterLoadout; size?: number }) {
  const props = { state: "idle" as const, emotion: "happy" as const, size, loadout };
  if (type === "dog") return <DogCharacter {...props} />;
  if (type === "game") return <GameCharacter {...props} />;
  if (type === "wizard") return <WizardCharacter {...props} />;
  if (type === "astronaut") return <AstronautCharacter {...props} />;
  if (type === "slime") return <SlimeCharacter {...props} />;
  return <RobotCharacter {...props} />;
}

export default function CharacterCustomization({ value, onChange, onLoadoutsChange, rewardSignal }: Props) {
  const [state, setState] = useState<CustomizationState | null>(null);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [wardrobeCharacter, setWardrobeCharacter] = useState<ActiveCharacterType>(value);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [revealedItem, setRevealedItem] = useState<string | null>(null);

  const applyState = useCallback((next: CustomizationState) => {
    setState(next);
    onChange(next.activeCharacter);
    onLoadoutsChange(next.loadouts ?? EMPTY_LOADOUTS);
  }, [onChange, onLoadoutsChange]);

  const refresh = useCallback(async (openNewest = false) => {
    const response = await fetch("/api/customization", { cache: "no-store" });
    if (!response.ok) return;
    const next = await response.json() as CustomizationState;
    applyState(next);
    if (openNewest && next.pendingGrants.length > 0) {
      setRevealedItem(null);
      setRewardOpen(true);
    }
  }, [applyState]);

  useEffect(() => { void refresh(false); }, [refresh]);
  useEffect(() => {
    if (rewardSignal > 0) void refresh(true);
  }, [rewardSignal, refresh]);

  const loadouts = state?.loadouts ?? EMPTY_LOADOUTS;
  const activeGrant = state?.pendingGrants[0] ?? null;
  const inventory = useMemo(() => new Set(state?.inventory ?? []), [state?.inventory]);

  const selectCharacter = async (characterType: ActiveCharacterType) => {
    onChange(characterType);
    setWardrobeCharacter(characterType);
    if (!state) return;
    setState({ ...state, activeCharacter: characterType });
    await fetch("/api/customization", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "select-character", characterType }),
    });
  };

  const equip = async (itemKey: string) => {
    const parsed = parseCosmeticItemKey(itemKey);
    if (!parsed || busy) return;
    const slot = parsed.family.slot;
    const current = loadouts[wardrobeCharacter]?.[slot];
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/customization", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "equip",
          characterType: wardrobeCharacter,
          slot,
          itemKey: current === itemKey ? null : itemKey,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "장착하지 못했습니다.");
      applyState(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "장착하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const claim = async (characterType: ActiveCharacterType) => {
    if (!activeGrant || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/customization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grantId: activeGrant.id, characterType }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "보상을 받지 못했습니다.");
      setRevealedItem(data.reward.itemKey);
      applyState(data.state);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "보상을 받지 못했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const closeReward = () => {
    if (revealedItem && state?.pendingGrants.length) {
      setRevealedItem(null);
      return;
    }
    setRewardOpen(false);
    setRevealedItem(null);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <CharacterPicker value={value} onChange={selectCharacter} loadouts={loadouts} />
        <button
          type="button"
          onClick={() => { setWardrobeCharacter(value); setWardrobeOpen(true); }}
          style={{ height: 31, padding: "0 11px", border: "1.5px solid #E2D9F7", borderRadius: 10, background: "#fff", color: "#7056C7", fontSize: 11.5, fontWeight: 800, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", position: "relative" }}
        >
          <Shirt size={14} /> 꾸미기
          {!!state?.pendingGrants.length && <span style={{ position: "absolute", top: -8, right: -8, minWidth: 19, height: 19, padding: "0 5px", borderRadius: 99, background: "#EC4899", color: "white", display: "grid", placeItems: "center", fontSize: 10, boxShadow: "0 2px 6px rgba(236,72,153,.35)" }}>{state.pendingGrants.length}</span>}
        </button>
        <span
          title="서로 다른 AI 추가 문제를 3개 해결하면 꾸미기 아이템을 받을 수 있어요. 틀려도 진행도는 줄어들지 않아요."
          aria-label={`AI 추가 문제 ${state?.aiProgress.solved ?? 0}개 해결, 3개 해결하면 꾸미기 아이템 획득`}
          style={{ height: 31, padding: "0 10px", borderRadius: 10, background: "#F5F1FF", color: "#7659CC", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800 }}
        >
          <Sparkles size={13} /> AI 추가 문제 {state?.aiProgress.solved ?? 0}/3
        </span>
      </div>

      {wardrobeOpen && (
        <div role="dialog" aria-modal="true" aria-label="나의 캐릭터 옷장" style={overlayStyle}>
          <div style={{ ...modalStyle, width: "min(880px, calc(100vw - 28px))" }}>
            <button type="button" aria-label="닫기" onClick={() => setWardrobeOpen(false)} style={closeStyle}><X size={19} /></button>
            <div style={{ padding: "25px 28px 18px", borderBottom: "1px solid #EEE9F7" }}>
              <div style={{ color: "#2F2742", fontSize: 22, fontWeight: 900 }}>나의 캐릭터 옷장</div>
              <div style={{ color: "#8B83A8", fontSize: 13, marginTop: 5 }}>공부해서 모은 아이템을 자유롭게 조합해 보세요.</div>
            </div>
            <div className={styles.wardrobeGrid}>
              <div className={styles.wardrobePreview} style={{ padding: 22, background: "linear-gradient(180deg,#FBF8FF,#F4F8FF)", borderRight: "1px solid #EEE9F7" }}>
                <div style={{ height: 245, display: "grid", placeItems: "center", overflow: "hidden" }}>
                  <Preview type={wardrobeCharacter} loadout={loadouts[wardrobeCharacter]} size={178} />
                </div>
                <div className={styles.characterTiles} role="group" aria-label="옷장 캐릭터 선택">
                  {ACTIVE_CHARACTERS.map((character) => (
                    <button
                      key={character.type}
                      type="button"
                      className={styles.characterTile}
                      aria-label={character.label}
                      aria-pressed={wardrobeCharacter === character.type}
                      onClick={() => setWardrobeCharacter(character.type)}
                      style={{ background: wardrobeCharacter === character.type ? character.tint : "#fff", color: character.color }}
                    >
                      <span className={styles.tilePortrait} aria-hidden="true"><Preview type={character.type} loadout={loadouts[character.type]} size={42} /></span>
                      <span className={styles.tileLabel}>{character.label}</span>
                      {wardrobeCharacter === character.type && <span className={styles.tileSelected} aria-hidden="true"><Check size={10} strokeWidth={3} /></span>}
                    </button>
                  ))}
                </div>
                {!!state?.pendingGrants.length && (
                  <button onClick={() => { setWardrobeOpen(false); setRevealedItem(null); setRewardOpen(true); }} style={{ width: "100%", marginTop: 16, border: 0, borderRadius: 12, padding: "12px", background: "linear-gradient(135deg,#8B5CF6,#EC4899)", color: "white", fontWeight: 900, cursor: "pointer", boxShadow: "0 7px 16px rgba(139,92,246,.22)" }}>
                    <Gift size={15} style={{ verticalAlign: -3, marginRight: 6 }} /> 받지 않은 보상 {state.pendingGrants.length}개
                  </button>
                )}
              </div>
              <div style={{ padding: 22, overflowY: "auto", maxHeight: 540 }}>
                {(["head", "face", "body", "back"] as CosmeticSlot[]).map((slot) => {
                  const families = COSMETIC_FAMILIES.filter((family) => family.slot === slot);
                  return <section key={slot} style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#675D82", marginBottom: 9 }}>{SLOT_LABEL[slot]} 아이템</div>
                    <div className={styles.itemGrid}>
                      {families.map((family) => {
                        const key = cosmeticItemKey(family.key, wardrobeCharacter);
                        const owned = inventory.has(key);
                        const equipped = loadouts[wardrobeCharacter]?.[slot] === key;
                        return <button key={key} disabled={!owned || busy} onClick={() => void equip(key)} style={{ minHeight: 74, border: equipped ? `2px solid ${family.color}` : "1.5px solid #ECE7F4", borderRadius: 13, background: equipped ? `${family.accent}66` : owned ? "#fff" : "#F7F5FA", color: owned ? "#4C435F" : "#B1A9C2", padding: 9, textAlign: "left", cursor: owned ? "pointer" : "not-allowed", position: "relative" }}>
                          <span style={{ width: 24, height: 24, borderRadius: 8, display: "grid", placeItems: "center", background: owned ? family.color : "#DDD8E6", color: "white", marginBottom: 6 }}>{owned ? (equipped ? <Check size={15} /> : <Sparkles size={13} />) : <Lock size={12} />}</span>
                          <strong style={{ display: "block", fontSize: 11.5 }}>{family.nameKo}</strong>
                          <small style={{ fontSize: 10 }}>{owned ? (equipped ? "장착 중" : "장착하기") : "아직 잠김"}</small>
                        </button>;
                      })}
                    </div>
                  </section>;
                })}
                {message && <p style={{ color: "#DC2626", fontSize: 12, fontWeight: 700 }}>{message}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {rewardOpen && activeGrant && (
        <div role="dialog" aria-modal="true" aria-label="꾸미기 아이템 선택" style={{ ...overlayStyle, zIndex: 150 }}>
          <div style={{ ...modalStyle, width: "min(820px, calc(100vw - 28px))", padding: "28px" }}>
            <button type="button" aria-label="닫기" onClick={closeReward} style={closeStyle}><X size={19} /></button>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 99, background: activeGrant.sourceType === "ai" ? "#F3E8FF" : "#E8FFF7", color: activeGrant.sourceType === "ai" ? "#8B5CF6" : "#0F9F78", fontSize: 11, fontWeight: 900 }}>
                {activeGrant.sourceType === "ai" ? "AI 도전 3개 성공" : "학습 묶음 완료"}
              </span>
              <h2 style={{ margin: "9px 0 4px", color: "#332A47", fontSize: 24 }}>{revealedItem ? "새 아이템을 받았어요!" : "어떤 친구의 아이템을 받을까요?"}</h2>
              <p style={{ margin: 0, color: "#8B83A8", fontSize: 13 }}>{activeGrant.sourceType === "ai" ? "캐릭터를 고르면 아직 없는 아이템 하나가 나타나요." : "세 모습을 충분히 미리 보고 하나를 선택하세요."}</p>
            </div>
            {revealedItem ? (() => {
              const parsed = parseCosmeticItemKey(revealedItem);
              if (!parsed) return null;
              const previewLoadout = { ...loadouts[parsed.characterType], [parsed.family.slot]: revealedItem };
              return <div style={{ textAlign: "center" }}>
                <div style={{ width: 230, height: 260, margin: "0 auto", display: "grid", placeItems: "center", borderRadius: 24, background: `linear-gradient(160deg,#fff,${parsed.family.accent}66)`, overflow: "hidden" }}><Preview type={parsed.characterType} loadout={previewLoadout} size={186} /></div>
                <strong style={{ display: "block", color: "#4B3D66", fontSize: 18, marginTop: 10 }}>{parsed.family.nameKo}</strong>
                <button onClick={closeReward} style={primaryButton}>다음 보상 확인</button>
              </div>;
            })() : (
              <div className={styles.rewardGrid}>
                {ACTIVE_CHARACTERS.map((character) => {
                  const family = COSMETIC_FAMILIES.find((item) => item.key === activeGrant.familyKey);
                  const groupItemKey = family ? cosmeticItemKey(family.key, character.type) : null;
                  const available = activeGrant.sourceType === "group"
                    ? !!groupItemKey && !inventory.has(groupItemKey)
                    : activeGrant.availability[character.type] > 0;
                  const previewLoadout = family ? { ...loadouts[character.type], [family.slot]: cosmeticItemKey(family.key, character.type) } : loadouts[character.type];
                  return <button className={styles.rewardCard} key={character.type} disabled={!available || busy} onClick={() => void claim(character.type)} style={{ border: `2px solid ${available ? character.color : "#DDD8E6"}`, borderRadius: 20, background: available ? `linear-gradient(180deg,#fff,${character.tint})` : "#F6F4F8", padding: "13px 8px 16px", cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : .55, color: character.color }}>
                    <div className={styles.rewardPreview} style={{ height: 185, display: "grid", placeItems: "center", overflow: "hidden" }}><Preview type={character.type} loadout={previewLoadout} size={138} /></div>
                    <span><strong style={{ display: "block", fontSize: 15 }}>{character.label}</strong>
                    <small style={{ color: "#817793", fontWeight: 700 }}>{activeGrant.sourceType === "ai" ? `${activeGrant.availability[character.type]}개 중 랜덤` : family?.nameKo}</small></span>
                  </button>;
                })}
              </div>
            )}
            {message && <p style={{ color: "#DC2626", textAlign: "center", fontSize: 12, fontWeight: 800 }}>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
}

const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, zIndex: 120, background: "rgba(39,28,65,.48)", backdropFilter: "blur(6px)", display: "grid", placeItems: "center", padding: 14 };
const modalStyle: React.CSSProperties = { position: "relative", maxHeight: "calc(100vh - 28px)", overflow: "auto", borderRadius: 24, background: "#fff", boxShadow: "0 28px 80px rgba(42,30,74,.28)", border: "1px solid rgba(255,255,255,.8)" };
const closeStyle: React.CSSProperties = { position: "absolute", right: 15, top: 15, width: 34, height: 34, border: "1px solid #E9E4F2", borderRadius: 11, background: "#fff", color: "#716787", display: "grid", placeItems: "center", cursor: "pointer", zIndex: 3 };
const primaryButton: React.CSSProperties = { marginTop: 16, border: 0, borderRadius: 12, padding: "12px 22px", background: "linear-gradient(135deg,#7B5CF0,#A855F7)", color: "#fff", fontWeight: 900, cursor: "pointer", boxShadow: "0 7px 16px rgba(123,92,240,.25)" };
