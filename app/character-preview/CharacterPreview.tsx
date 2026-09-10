"use client";

import { useState } from "react";
import { MotionConfig } from "framer-motion";
import GameCharacter from "@/components/robot/GameCharacter";
import WizardCharacter from "@/components/robot/WizardCharacter";
import AstronautCharacter from "@/components/robot/AstronautCharacter";
import CharacterCustomization from "@/components/customization/CharacterCustomization";
import { COSMETIC_FAMILIES, cosmeticItemKey } from "@/lib/cosmetics";
import type { ActiveCharacterType, CharacterLoadout, RobotEmotion, RobotState } from "@/types";

const characters = [
  { type: "game", name: "전사", title: "든든한 꼬마 골렘 전사", note: "남자 돌 수호자 · 황금 수정 · 커다란 주먹", tint: "#EDF3E7", component: GameCharacter },
  { type: "wizard", name: "마법사", title: "달빛을 부리는 고양이 마녀", note: "여자 고양이 마법사 · 달 지팡이 · 꼬불꼬불 꼬리", tint: "#F1EDFC", component: WizardCharacter },
  { type: "astronaut", name: "우주비행사", title: "별 사이를 떠다니는 외계 탐험가", note: "동그란 버블 우주선 · 초록 외계인 · 세 발", tint: "#EDF4FA", component: AstronautCharacter },
] as const;
const states: RobotState[] = ["idle", "talking", "walking", "jumping", "celebrating", "error", "headShake", "spinning", "shaking"];
const emotions: RobotEmotion[] = ["idle", "happy", "sad", "angry", "surprised"];
const ignorePreviewLoadouts = () => {};

/** Development-only gallery: real production components, no student data or rewards. */
export default function CharacterPreview() {
  const [state, setState] = useState<RobotState>("idle");
  const [emotion, setEmotion] = useState<RobotEmotion>("happy");
  const [family, setFamily] = useState("");
  const [selected, setSelected] = useState<ActiveCharacterType>("game");
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [staticView, setStaticView] = useState(false);
  const loadoutFor = (type: ActiveCharacterType): CharacterLoadout => family === "set"
    ? { head: cosmeticItemKey("pastel-cap", type), face: cosmeticItemKey("round-glasses", type), body: cosmeticItemKey("star-badge", type), back: cosmeticItemKey("wing-pack", type) }
    : Object.fromEntries(COSMETIC_FAMILIES.filter((item) => item.key === family).map((item) => [item.slot, cosmeticItemKey(item.key, type)]));
  return <MotionConfig reducedMotion={staticView ? "always" : "user"}>
    <main style={{ minHeight: "100vh", padding: "48px 20px", background: "#F8F6F2", color: "#403B51" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <p style={{ fontSize: 12, letterSpacing: 3, color: "#8B7B9B", fontWeight: 800 }}>PYRUN · COMPANION STUDIO</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "10px 0" }}>함께 자라고 싶은 작은 동료들</h1>
        <p style={{ fontSize: 14, color: "#81778D" }}>개발용 디자인 검수 · 실제 캐릭터와 꾸미기 아이템 미리보기</p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 16, padding: "24px 0" }}>
          <label>동작 <select aria-label="동작" value={state} onChange={(e) => setState(e.target.value as RobotState)}>{states.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label>표정 <select aria-label="표정" value={emotion} onChange={(e) => setEmotion(e.target.value as RobotEmotion)}>{emotions.map((v) => <option key={v}>{v}</option>)}</select></label>
          <label>아이템 <select aria-label="아이템" value={family} onChange={(e) => setFamily(e.target.value)}><option value="">기본 모습</option><option value="set">4개 부위 함께 착용</option>{COSMETIC_FAMILIES.map((v) => <option key={v.key} value={v.key}>{v.nameKo}</option>)}</select></label>
          <label>방향 <select aria-label="방향" value={direction} onChange={(e) => setDirection(e.target.value as "left" | "right")}><option value="right">오른쪽</option><option value="left">왼쪽</option></select></label>
          <label><input type="checkbox" checked={staticView} onChange={(e) => setStaticView(e.target.checked)} /> 동작 줄이기</label>
          <CharacterCustomization value={selected} onChange={setSelected} onLoadoutsChange={ignorePreviewLoadouts} rewardSignal={0} />
        </div>
        <section aria-label="캐릭터 디자인" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {characters.map(({ type, name, title, note, tint, component: Character }) => <article key={type} aria-label={name} style={{ borderRadius: 28, background: "white", border: "1px solid #ECE7EF", overflow: "hidden" }}>
            <div style={{ background: tint, minHeight: 340, display: "grid", placeItems: "center", position: "relative" }}>
              <span style={{ position: "absolute", top: 18, left: 20, fontSize: 12, fontWeight: 800, color: "#8E7D98" }}>{name}</span>
              <Character state={state} emotion={emotion} direction={direction} size={230} loadout={loadoutFor(type)} />
            </div>
            <div style={{ padding: "22px 18px" }}>
              <h2 style={{ fontSize: 17, fontWeight: 800 }}>{title}</h2>
              <p style={{ marginTop: 8, fontSize: 12, color: "#8D8197" }}>{note}</p>
              <div style={{ display: "flex", alignItems: "end", justifyContent: "space-evenly", gap: 12, marginTop: 20 }}>
                {[70, 138].map((size) => <div key={size} style={{ display: "grid", justifyItems: "center", gap: 8 }}><Character state={state} emotion={emotion} direction={direction} size={size} loadout={loadoutFor(type)} /><span style={{ fontSize: 11, color: "#9C90A7" }}>{size === 70 ? "학습 화면 · 70px" : "옷장 · 138px"}</span></div>)}
              </div>
            </div>
          </article>)}
        </section>
      </div>
    </main>
  </MotionConfig>;
}
