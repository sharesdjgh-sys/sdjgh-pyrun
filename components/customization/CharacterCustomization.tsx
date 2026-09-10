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
import { ACTIVE_CHARACTERS, AI_REWARD_CONCEPT_LIMIT, COSMETIC_FAMILIES, characterCosmeticFamily, cosmeticItemKey, parseCosmeticItemKey } from "@/lib/cosmetics";
import type { ActiveCharacterType, CharacterLoadout, CosmeticSlot } from "@/types";
import styles from "./CharacterCustomization.module.css";
import CosmeticItemPreview from "./CosmeticItemPreview";

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
  aiProgress: { solved: number; target: number; remaining?: number };
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
  const [wardrobeSlot, setWardrobeSlot] = useState<CosmeticSlot>("head");
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

  useEffect(() => {
    if (!wardrobeOpen && !rewardOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [wardrobeOpen, rewardOpen]);

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
    if (!parsed || busy || !inventory.has(itemKey)) return;
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
          title={`서로 다른 AI 추가 문제를 3개 해결하면 꾸미기 아이템을 받을 수 있어요. 같은 목차에서는 최대 ${AI_REWARD_CONCEPT_LIMIT}개까지만 보상에 반영해요. 틀려도 진행도는 줄어들지 않아요.`}
          aria-label={`AI 추가 문제 ${state?.aiProgress.solved ?? 0}개 해결, 3개 해결하면 꾸미기 아이템 획득`}
          style={{ height: 31, padding: "0 10px", borderRadius: 10, background: "#F5F1FF", color: "#7659CC", display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 800 }}
        >
          <Sparkles size={13} /> AI 추가 문제 {state?.aiProgress.solved ?? 0}/3
        </span>
      </div>

      {wardrobeOpen && (
        <div role="dialog" aria-modal="true" aria-label="나의 캐릭터 옷장" style={overlayStyle}>
          <div className={styles.wardrobeModal} style={{ ...modalStyle, width: "min(880px, calc(100vw - 28px))" }}>
            <button type="button" aria-label="닫기" onClick={() => setWardrobeOpen(false)} style={closeStyle}><X size={19} /></button>
            <div className={styles.wardrobeHeader}>
              <div className={styles.wardrobeTitle}>나의 캐릭터 옷장</div>
              <section className={styles.rewardGuide} aria-label="아이템 얻는 방법">
                <p className={styles.guideMain}><Gift size={15} aria-hidden="true" /><span><strong>학습 묶음의 필수 문제 완료</strong> 또는 <strong>AI 추가 문제 {state?.aiProgress.target ?? 3}개 해결</strong>하면 아이템을 받아요.</span></p>
                <p className={styles.guideLimit}>AI 보상은 같은 목차 최대 {AI_REWARD_CONCEPT_LIMIT}개 · 같은 문제 중복 제외</p>
                <p className={styles.guideHint}>6종 중 캐릭터 선택 → 미보유 전용 아이템 랜덤 획득</p>
                {!!state && (state.aiProgress.remaining ?? 0) > state.aiProgress.target && <p className={styles.guideHint}>기존 보상 유지 · 다음 보상까지 다른 목차에서 {state.aiProgress.remaining}개 더 해결</p>}
              </section>
            </div>
            <div className={styles.wardrobeGrid}>
              <div className={styles.wardrobePreview}>
                <div className={styles.mainPortrait}>
                  <Preview type={wardrobeCharacter} loadout={loadouts[wardrobeCharacter]} size={128} />
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
                      <span className={styles.tilePortrait} aria-hidden="true"><Preview type={character.type} loadout={loadouts[character.type]} size={28} /></span>
                      <span className={styles.tileLabel}>{character.label}</span>
                      {wardrobeCharacter === character.type && <span className={styles.tileSelected} aria-hidden="true"><Check size={10} strokeWidth={3} /></span>}
                    </button>
                  ))}
                </div>
                {!!state?.pendingGrants.length && (
                  <button className={styles.pendingReward} onClick={() => { setWardrobeOpen(false); setRevealedItem(null); setRewardOpen(true); }}>
                    <Gift size={15} style={{ verticalAlign: -3, marginRight: 6 }} /> 받지 않은 보상 {state.pendingGrants.length}개
                  </button>
                )}
              </div>
              <div className={styles.wardrobeItems}>
                <div className={styles.slotPicker} role="group" aria-label="아이템 부위 선택">
                  {(["head", "face", "body", "back"] as CosmeticSlot[]).map((slot) => <button key={slot} type="button" aria-pressed={wardrobeSlot === slot} onClick={() => setWardrobeSlot(slot)}>{SLOT_LABEL[slot]}</button>)}
                </div>
                <div className={styles.itemSections}>
                {(["head", "face", "body", "back"] as CosmeticSlot[]).map((slot) => {
                  const families = COSMETIC_FAMILIES.filter((family) => family.slot === slot).map((family) => characterCosmeticFamily(family, wardrobeCharacter));
                  return <section key={slot} className={styles.itemSection} data-active={wardrobeSlot === slot} aria-label={`${SLOT_LABEL[slot]} 아이템`}>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#675D82", marginBottom: 9 }}>{SLOT_LABEL[slot]} 아이템</div>
                    <div className={styles.itemGrid}>
                      {families.map((family) => {
                        const key = cosmeticItemKey(family.key, wardrobeCharacter);
                        const owned = inventory.has(key);
                        const equipped = loadouts[wardrobeCharacter]?.[slot] === key;
                        return <button key={key} type="button" className={styles.itemCard} data-owned={owned} aria-pressed={equipped} disabled={!owned || busy} onClick={() => void equip(key)} style={{ border: equipped ? `2px solid ${family.color}` : "1.5px solid #ECE7F4", background: equipped ? `${family.accent}66` : owned ? "#fff" : "#F7F5FA", color: owned ? "#4C435F" : "#8F849F", cursor: owned ? "pointer" : "not-allowed" }}>
                          <span className={styles.itemArtwork}><CosmeticItemPreview family={family} characterType={wardrobeCharacter} /></span>
                          <strong style={{ display: "block", fontSize: 11.5 }}>{family.nameKo}</strong>
                          <small className={styles.itemStatus}>{!owned ? <Lock size={10} aria-hidden="true" /> : equipped ? <Check size={11} aria-hidden="true" /> : null}{owned ? (equipped ? "장착 중" : "장착하기") : "아직 잠김"}</small>
                        </button>;
                      })}
                    </div>
                  </section>;
                })}
                </div>
                {message && <p style={{ color: "#DC2626", fontSize: 12, fontWeight: 700 }}>{message}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {rewardOpen && (activeGrant || revealedItem) && (
        <div role="dialog" aria-modal="true" aria-label="꾸미기 아이템 선택" style={{ ...overlayStyle, zIndex: 150 }}>
          <div style={{ ...modalStyle, width: "min(820px, calc(100vw - 28px))", padding: "28px" }}>
            <button type="button" aria-label="닫기" onClick={closeReward} style={closeStyle}><X size={19} /></button>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <span style={{ display: "inline-flex", padding: "6px 10px", borderRadius: 99, background: "#F3E8FF", color: "#8B5CF6", fontSize: 11, fontWeight: 900 }}>
                {revealedItem ? "나만의 새 아이템" : activeGrant?.sourceType === "ai" ? "AI 추가 문제 3개 성공" : "학습 묶음 완료"}
              </span>
              <h2 style={{ margin: "9px 0 4px", color: "#332A47", fontSize: 24 }}>{revealedItem ? "새 아이템을 받았어요!" : "어떤 친구의 아이템을 받을까요?"}</h2>
              <p style={{ margin: 0, color: "#8B83A8", fontSize: 13 }}>{revealedItem ? "옷장에서 입혀 보세요. 새로운 모험을 함께할 준비가 됐어요!" : "좋아하는 캐릭터를 고르면, 아직 없는 전용 아이템 1개가 랜덤으로 나와요."}</p>
            </div>
            {revealedItem ? (() => {
              const parsed = parseCosmeticItemKey(revealedItem);
              if (!parsed) return null;
              const previewLoadout = { ...loadouts[parsed.characterType], [parsed.family.slot]: revealedItem };
              return <div style={{ textAlign: "center" }}>
                <div style={{ width: 230, height: 260, margin: "0 auto", display: "grid", placeItems: "center", borderRadius: 24, background: `linear-gradient(160deg,#fff,${parsed.family.accent}66)`, overflow: "hidden" }}><Preview type={parsed.characterType} loadout={previewLoadout} size={186} /></div>
                <strong style={{ display: "block", color: "#4B3D66", fontSize: 18, marginTop: 10 }}>{parsed.family.nameKo}</strong>
                <button onClick={() => { if (state?.pendingGrants.length) closeReward(); else { setWardrobeCharacter(parsed.characterType); setRewardOpen(false); setRevealedItem(null); setWardrobeOpen(true); } }} style={primaryButton}>{state?.pendingGrants.length ? "다음 선물 선택" : "옷장에서 입혀보기"}</button>
              </div>;
            })() : (
              <div className={styles.rewardGrid}>
                {ACTIVE_CHARACTERS.map((character) => {
                  const remaining = activeGrant?.availability[character.type] ?? 0;
                  const available = remaining > 0;
                  const previewLoadout = loadouts[character.type];
                  return <button className={styles.rewardCard} key={character.type} disabled={!available || busy} onClick={() => void claim(character.type)} style={{ border: `2px solid ${available ? character.color : "#DDD8E6"}`, borderRadius: 20, background: available ? `linear-gradient(180deg,#fff,${character.tint})` : "#F6F4F8", padding: "13px 8px 16px", cursor: available ? "pointer" : "not-allowed", opacity: available ? 1 : .55, color: character.color }}>
                    <div className={styles.rewardPreview} style={{ height: 185, display: "grid", placeItems: "center", overflow: "hidden" }}><Preview type={character.type} loadout={previewLoadout} size={138} /></div>
                    <span><strong style={{ display: "block", fontSize: 15 }}>{character.label}</strong>
                    <small className={styles.rewardItemLabel} style={{ color: "#817793", fontWeight: 700 }}>{available ? `전용 아이템 ${remaining}개 중 랜덤` : "모두 모았어요"}</small></span>
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
