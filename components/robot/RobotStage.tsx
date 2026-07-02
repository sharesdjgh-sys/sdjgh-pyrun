"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import RobotCharacter from "./RobotCharacter";
import DogCharacter from "./DogCharacter";
import GameCharacter from "./GameCharacter";
import MechdogCharacter from "./MechdogCharacter";
import RobotSpeechBubble from "./RobotSpeechBubble";
import StageBackground from "./StageBackground";
import VariableFloat from "./VariableFloat";
import type { RobotCommand } from "@/lib/animation-queue";
import type { RobotEmotion, RobotState } from "@/types";

interface RobotStageProps {
  commands: RobotCommand[];
  onAnimationComplete?: () => void;
  varName?: string;
  varValue?: string;
  showVariable?: boolean;
  characterType?: "robot" | "dog" | "game" | "mechdog";
  isError?: boolean;
}

interface DrawnShape {
  id: string;
  type: string;
  x: number;
  y: number;
}

type Direction4 = "left" | "right" | "up" | "down";

interface RobotClone {
  id: string;
  x: number;
  y: number;
  direction: Direction4;
  scale: number;
  emotion: RobotEmotion;
}

export default function RobotStage({
  commands,
  onAnimationComplete,
  varName,
  varValue,
  showVariable,
  characterType = "robot",
  isError = false,
}: RobotStageProps) {
  // 로봇 상태 변수들
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<Direction4>("right");
  const [scale, setScale] = useState(1.0);
  const [emotion, setEmotion] = useState<RobotEmotion>("idle");
  const [robotState, setRobotState] = useState<RobotState>("idle");
  const [speech, setSpeech] = useState<string | null>(null);
  const [mechdogLabel, setMechdogLabel] = useState<string | null>(null);
  const [mechdogLedColor, setMechdogLedColor] = useState<string | null>(null);
  const [mechdogAction, setMechdogAction] = useState<string | null>(null);

  // 캐릭터 렌더링 헬퍼
  const renderCharacter = (
    charState: RobotState,
    charEmotion: RobotEmotion,
    charScale: number,
    charDir: "left" | "right",
    charSize = 70
  ) => {
    switch (characterType) {
      case "mechdog":
        return (
          <MechdogCharacter
            state={charState}
            emotion={charEmotion}
            scale={charScale}
            direction={charDir}
            size={Math.max(charSize, 76)}
            action={mechdogAction}
            ledColor={mechdogLedColor}
          />
        );
      case "dog":
        return (
          <DogCharacter
            state={charState}
            emotion={charEmotion}
            scale={charScale}
            direction={charDir}
            size={charSize}
          />
        );
      case "game":
        return (
          <GameCharacter
            state={charState}
            emotion={charEmotion}
            scale={charScale}
            direction={charDir}
            size={charSize}
          />
        );
      case "robot":
      default:
        return (
          <RobotCharacter
            state={charState}
            emotion={charEmotion}
            scale={charScale}
            direction={charDir}
            size={charSize}
          />
        );
    }
  };

  // 스테이지 내 렌더링할 도형, 경로, 클론들
  const [shapes, setShapes] = useState<DrawnShape[]>([]);
  const [paths, setPaths] = useState<{ x: number; y: number }[]>([{ x: 0, y: 0 }]);
  const [clones, setClones] = useState<RobotClone[]>([]);

  const executionIdRef = useRef(0);
  const onAnimationCompleteRef = useRef(onAnimationComplete);
  useEffect(() => { onAnimationCompleteRef.current = onAnimationComplete; });

  // 비동기 딜레이 헬퍼
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 스타 포인트를 그리는 SVG 헬퍼
  const getStarPoints = (cx: number, cy: number, spikes = 5, outerRadius = 12, innerRadius = 6) => {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;
    const points = [];

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      points.push(`${x},${y}`);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      points.push(`${x},${y}`);
      rot += step;
    }
    return points.join(" ");
  };

  useEffect(() => {
    // 새로운 commands가 들어오면 기존 실행을 강제 중단
    const executionId = ++executionIdRef.current;

    if (commands && commands.length > 0) {
      const run = async () => {
        // 초기화
        let currentPos = { x: 0, y: 0 };
        let currentDir: Direction4 = "right";
        let currentScale = 1.0;
        let currentEmotion: RobotEmotion = "idle";

        setPos(currentPos);
        setDirection(currentDir);
        setScale(currentScale);
        setEmotion(currentEmotion);
        setRobotState("idle");
        setSpeech(null);
        setMechdogLabel(null);
        setMechdogLedColor(null);
        setMechdogAction(null);
        setShapes([]);
        setPaths([{ x: 0, y: 0 }]);
        setClones([]);

        // mechdog 로컬 상태 (리액트 state 를 쓰면 비동기 문제가 있어서 클로저 변수 사용)
        let mechdogSpeed = 0;
        let mechdogAngle = 0;

        await delay(300);

        for (const cmd of commands) {
          if (executionIdRef.current !== executionId) return;

          switch (cmd.type) {
            case "move": {
              const steps = cmd.params.steps ?? 1;
              // 1걸음 = 30px 이동
              const stepDistance = 30;
              const distance = steps * stepDistance;

              let newX = currentPos.x;
              let newY = currentPos.y;
              if (currentDir === "right") newX += distance;
              else if (currentDir === "left") newX -= distance;
              else if (currentDir === "up") newY += distance;
              else if (currentDir === "down") newY -= distance;

              // 영역 한계 체크 및 보정
              const finalX = Math.max(-170, Math.min(170, newX));
              const finalY = Math.max(-120, Math.min(120, newY));

              currentPos = { x: finalX, y: finalY };
              setRobotState("walking");
              setPos(currentPos);
              setPaths((prev) => [...prev, currentPos]);

              // 걷는 걸음 수만큼 딜레이 조절 (걸음당 400ms)
              await delay(350 * steps);
              setRobotState("idle");
              break;
            }

            case "turn": {
              const dir = cmd.params.direction;
              currentDir = (["left", "right", "up", "down"].includes(dir) ? dir : "right") as Direction4;
              setDirection(currentDir);
              await delay(400);
              break;
            }

            case "jump": {
              setRobotState("jumping");
              await delay(600);
              setRobotState("idle");
              break;
            }

            case "say": {
              setSpeech(cmd.params.text);
              setRobotState("talking");
              // 말풍선 읽는 시간만큼 충분히 대기
              await delay(Math.max(1500, cmd.params.text.length * 80));
              setRobotState("idle");
              break;
            }

            case "emotion": {
              currentEmotion = (cmd.params.feeling as RobotEmotion) ?? "idle";
              setEmotion(currentEmotion);
              await delay(800);
              break;
            }

            case "dance": {
              setRobotState("celebrating");
              await delay(2400); // 0.8s * 3회 반복
              setRobotState("idle");
              break;
            }

            case "size": {
              currentScale = cmd.params.scale ?? 1.0;
              setScale(currentScale);
              await delay(500);
              break;
            }

            case "draw": {
              const shape = cmd.params.shape ?? "circle";
              setShapes((prev) => [
                ...prev,
                { id: Math.random().toString(), type: shape, x: currentPos.x, y: currentPos.y },
              ]);
              await delay(600);
              break;
            }

            case "clone": {
              // 복제 로봇 5개 제한
              setClones((prev) => {
                if (prev.length >= 5) return prev;
                return [
                  ...prev,
                  {
                    id: Math.random().toString(),
                    x: currentPos.x,
                    y: currentPos.y,
                    direction: currentDir,
                    scale: currentScale,
                    emotion: currentEmotion,
                  },
                ];
              });
              await delay(600);
              break;
            }

            case "spin": {
              setRobotState("spinning");
              await delay(800);
              setRobotState("idle");
              break;
            }

            case "shake": {
              setRobotState("shaking");
              await delay(650);
              setRobotState("idle");
              break;
            }

            case "clear": {
              setShapes([]);
              await delay(200);
              break;
            }

            // ── mechdog 시뮬레이션 커맨드 ──────────────────────────────────────
            case "mechdog_move": {
              const { speed, angle } = cmd.params;
              mechdogSpeed = speed;
              mechdogAngle = angle;
              if (speed === 0) {
                setRobotState("idle");
                setMechdogLabel("정지");
              } else {
                setRobotState("walking");
                if (angle > 0) {
                  currentDir = "left";
                } else if (angle < 0) {
                  currentDir = "right";
                } else {
                  currentDir = speed > 0 ? "right" : "left";
                }
                const angleLabel = angle > 0 ? " (좌회전)" : angle < 0 ? " (우회전)" : "";
                setMechdogLabel(speed > 0 ? `전진 ${speed}${angleLabel}` : `후진 ${Math.abs(speed)}${angleLabel}`);
              }
              setDirection(currentDir);
              await delay(300);
              break;
            }

            case "mechdog_wait": {
              const waitSec = Math.min(cmd.params.seconds ?? 1, 5);
              const waitMs = waitSec * 1000;
              // 이동 중이면 위치 갱신
              if (mechdogSpeed !== 0) {
                const pxPerSec = (Math.abs(mechdogSpeed) / 120) * 40;
                const angleRad = (mechdogAngle / 50) * (Math.PI / 4);
                const dirSign = mechdogSpeed > 0 ? 1 : -1;
                const dx = dirSign * pxPerSec * waitSec * Math.cos(angleRad);
                const dy = dirSign * pxPerSec * waitSec * Math.sin(angleRad);
                const newX = Math.max(-170, Math.min(170, currentPos.x + dx));
                const newY = Math.max(-120, Math.min(120, currentPos.y + dy));
                currentPos = { x: newX, y: newY };
                setPos(currentPos);
                setPaths((prev) => [...prev, currentPos]);
              }
              await delay(waitMs);
              break;
            }

            case "mechdog_action": {
              const actionName = cmd.params.name;
              const ACTION_MAP: Record<string, { state: RobotState; label: string; ms: number; emotion?: RobotEmotion }> = {
                default_pose:    { state: "idle",        label: "기본 자세",       ms: 800 },
                stand_four_legs: { state: "idle",        label: "네 발로 서기",    ms: 800 },
                sit_dowm:        { state: "celebrating", label: "앉기 🐾",         ms: 1200, emotion: "happy" },
                sit_down:        { state: "celebrating", label: "앉기 🐾",         ms: 1200, emotion: "happy" },
                go_prone:        { state: "shaking",     label: "엎드리기",        ms: 1000 },
                stand_two_legs:  { state: "jumping",     label: "두 발로 서기 🐾", ms: 1500 },
                handshake:       { state: "celebrating", label: "악수 🤝",         ms: 1500, emotion: "happy" },
                scrape_a_bow:    { state: "shaking",     label: "인사 🙇",         ms: 1200 },
                nodding_motion:  { state: "shaking",     label: "고개 끄덕이기",   ms: 1000 },
                boxing:          { state: "celebrating", label: "권투 🥊",         ms: 2000 },
                stretch_oneself: { state: "spinning",    label: "기지개 켜기",     ms: 1200 },
                pee:             { state: "celebrating", label: "쉬~ 💧",          ms: 1500 },
                press_up:        { state: "jumping",     label: "팔굽혀펴기 💪",  ms: 2000 },
                rotation_pitch:  { state: "shaking",     label: "앞뒤 흔들기",    ms: 1200 },
                rotation_roll:   { state: "spinning",    label: "좌우 흔들기",    ms: 1200 },
                left_foot_kick:  { state: "jumping",     label: "왼발 차기 🦵",   ms: 1000 },
                right_foot_kick: { state: "jumping",     label: "오른발 차기 🦵", ms: 1000 },
              };
              const info = ACTION_MAP[actionName] ?? { state: "celebrating" as RobotState, label: actionName, ms: 1000 };
              if (info.emotion) currentEmotion = info.emotion;
              setEmotion(currentEmotion);
              if (characterType === "mechdog") {
                // mechdog 캐릭터는 액션 이름으로 고유 관절 애니메이션을 직접 수행
                setMechdogAction(actionName);
              } else {
                setRobotState(info.state);
              }
              setMechdogLabel(info.label);
              await delay(info.ms);
              setRobotState("idle");
              setMechdogAction(null);
              if (info.emotion) { currentEmotion = "idle"; setEmotion("idle"); }
              setMechdogLabel(null);
              break;
            }

            case "mechdog_transform": {
              const { tz, pitch, roll } = cmd.params;
              let tLabel = "자세 조절";
              if (tz > 0) tLabel = "↑ 몸 높이기";
              else if (tz < 0) tLabel = "↓ 몸 낮추기";
              else if (pitch > 0) tLabel = "앞으로 기울기";
              else if (pitch < 0) tLabel = "뒤로 기울기";
              else if (roll > 0) tLabel = "오른쪽 기울기";
              else if (roll < 0) tLabel = "왼쪽 기울기";
              setMechdogLabel(tLabel);
              if (characterType === "mechdog") {
                let tAction = "transform_up";
                if (tz > 0) tAction = "transform_up";
                else if (tz < 0) tAction = "transform_down";
                else if (pitch > 0) tAction = "transform_pitch_fwd";
                else if (pitch < 0) tAction = "transform_pitch_back";
                else if (roll > 0) tAction = "transform_roll_right";
                else if (roll < 0) tAction = "transform_roll_left";
                setMechdogAction(tAction);
              } else {
                setRobotState("shaking");
              }
              await delay(Math.min(cmd.params.duration || 1000, 2000));
              setRobotState("idle");
              setMechdogAction(null);
              setMechdogLabel(null);
              break;
            }

            case "mechdog_homeostasis": {
              const { enabled } = cmd.params;
              setMechdogLabel(enabled ? "균형 유지 ON ⚖️" : "균형 유지 OFF");
              if (characterType === "mechdog") {
                setMechdogAction(enabled ? "homeostasis_on" : null);
              } else {
                setRobotState(enabled ? "shaking" : "idle");
              }
              await delay(800);
              setRobotState("idle");
              setMechdogAction(null);
              setMechdogLabel(null);
              break;
            }

            case "mechdog_gait": {
              const { liftTime, height } = cmd.params;
              setMechdogLabel(`걸음걸이 조절 (높이 ${height}mm)`);
              setRobotState(liftTime < 130 ? "jumping" : "walking");
              await delay(600);
              setRobotState("idle");
              setMechdogLabel(null);
              break;
            }

            case "mechdog_led": {
              const { r, g, b } = cmd.params;
              let ledLabel = "LED 꺼짐";
              let ledColor = null as string | null;
              if (r === 0 && g === 0 && b === 0) {
                ledLabel = "LED 꺼짐";
                ledColor = null;
              } else {
                ledColor = `rgb(${r},${g},${b})`;
                if (r > 200 && g < 100) ledLabel = "🔴 LED 빨강";
                else if (g > 150 && r < 100) ledLabel = "🟢 LED 초록";
                else if (b > 150 && r < 100) ledLabel = "🔵 LED 파랑";
                else if (r > 150 && g > 130 && b < 30) ledLabel = "🟡 LED 노랑";
                else if (r > 150 && g < 60 && b > 150) ledLabel = "🟣 LED 보라";
                else ledLabel = `💡 LED`;
              }
              setMechdogLedColor(ledColor);
              setMechdogLabel(ledLabel);
              await delay(300);
              setMechdogLabel(null);
              break;
            }

            case "mechdog_buzz": {
              setMechdogLabel("🔔 부저음");
              await delay(300);
              setMechdogLabel(null);
              break;
            }

            case "mechdog_display": {
              const { text } = cmd.params;
              if (text) {
                setSpeech(`📟 ${text}`);
                setRobotState("talking");
                await delay(800);
                setRobotState("idle");
                setSpeech(null);
              }
              break;
            }

            default:
              break;
          }

          // 커맨드 사이의 부드러운 텀
          await delay(150);
        }

        // 시킨 동작을 로봇이 다 하고 나면 기본 상태로 복구
        setPos({ x: 0, y: 0 });
        setDirection("right");
        setScale(1.0);
        setEmotion(isError ? "sad" : "idle");
        setRobotState(isError ? "error" : "idle");
        setSpeech(null);
        setMechdogLabel(null);
        setMechdogLedColor(null);
        setMechdogAction(null);
        setClones([]);
        setShapes([]);
        setPaths([{ x: 0, y: 0 }]);

        if (onAnimationCompleteRef.current) {
          onAnimationCompleteRef.current();
        }
      };

      run();
    } else {
      // commands가 비어있는 상태이면 완전히 리셋
      setPos({ x: 0, y: 0 });
      setDirection("right");
      setScale(1.0);
      setEmotion(isError ? "sad" : "idle");
      setRobotState(isError ? "error" : "idle");
      setSpeech(null);
      setMechdogLabel(null);
      setMechdogLedColor(null);
      setMechdogAction(null);
      setShapes([]);
      setPaths([{ x: 0, y: 0 }]);
      setClones([]);
    }
  }, [commands, isError]);

  // 4방향 헬퍼: up/down은 캐릭터를 회전시키고 left/right는 그대로
  const toBaseDir = (dir: Direction4): "left" | "right" =>
    dir === "up" || dir === "down" ? "right" : dir;
  const toDirRotate = (dir: Direction4): string | undefined => {
    if (dir === "up") return "rotate(-90deg)";
    if (dir === "down") return "rotate(90deg)";
    return undefined;
  };

  // 논리 좌표 x/y를 백분율 스타일 좌표로 매핑
  const getPercentX = (x: number) => `${((200 + x) / 400) * 100}%`;
  const getPercentY = (y: number) => `${((150 - y) / 300) * 100}%`;

  return (
    <div className="relative w-full aspect-[4/3] bg-[#FCFAFF] border border-[#ECE7F8] rounded-2xl overflow-hidden shadow-sm">
      {/* Layer 0: 배경 격자 점 */}
      <StageBackground />

      {/* mechdog 액션 라벨 */}
      {mechdogLabel && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-full px-3 py-1 text-xs font-semibold text-purple-700 shadow-sm whitespace-nowrap">
            {mechdogLedColor && (
              <span
                className="inline-block w-3 h-3 rounded-full border border-white shadow-sm"
                style={{ background: mechdogLedColor }}
              />
            )}
            <span>🐾 {mechdogLabel}</span>
          </div>
        </div>
      )}

      {/* SVG 레이어: 경로 및 드로잉 도형 렌더링 */}
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 경로 끝점 화살표 마커 */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="rgba(123, 92, 240, 0.7)" />
          </marker>
        </defs>

        {/* Layer 1: 이동 경로 (점선) */}
        {paths.length > 1 && (
          <polyline
            points={paths.map((p) => `${200 + p.x},${150 - p.y}`).join(" ")}
            fill="none"
            stroke="rgba(123, 92, 240, 0.5)"
            strokeWidth="2"
            strokeDasharray="4 4"
            markerEnd="url(#arrow)"
          />
        )}

        {/* Layer 2: 그린 도형들 */}
        {shapes.map((shape) => {
          const cx = 200 + shape.x;
          const cy = 150 - shape.y;

          switch (shape.type) {
            case "circle":
              return (
                <circle
                  key={shape.id}
                  cx={cx}
                  cy={cy}
                  r="10"
                  fill="#FF6B9D"
                  className="animate-pulse"
                  opacity="0.85"
                />
              );
            case "square":
              return (
                <rect
                  key={shape.id}
                  x={cx - 10}
                  y={cy - 10}
                  width="20"
                  height="20"
                  rx="3"
                  fill="#4ECDC4"
                  opacity="0.85"
                />
              );
            case "star":
              return (
                <polygon
                  key={shape.id}
                  points={getStarPoints(cx, cy, 5, 12, 5)}
                  fill="#FFE66D"
                  opacity="0.85"
                />
              );
            case "triangle":
              return (
                <polygon
                  key={shape.id}
                  points={`${cx},${cy - 12} ${cx - 12},${cy + 10} ${cx + 12},${cy + 10}`}
                  fill="#A78BFA"
                  opacity="0.85"
                />
              );
            case "heart":
              return (
                <g key={shape.id} transform={`translate(${cx}, ${cy})`}>
                  <path
                    d="M 0 -6 C -3 -12 -14 -9 -14 -2 C -14 5 -7 11 0 16 C 7 11 14 5 14 -2 C 14 -9 3 -12 0 -6 Z"
                    fill="#FF6B9D"
                    opacity="0.85"
                    style={{ filter: "drop-shadow(0 1px 2px rgba(255,107,157,0.4))" }}
                  />
                </g>
              );
            case "diamond":
              return (
                <g key={shape.id} transform={`translate(${cx}, ${cy})`}>
                  <polygon
                    points="0,-14 14,0 0,14 -14,0"
                    fill="#60A5FA"
                    opacity="0.85"
                    style={{ filter: "drop-shadow(0 1px 2px rgba(96,165,250,0.4))" }}
                  />
                </g>
              );
            default:
              return null;
          }
        })}
      </svg>

      {/* Layer 3: 복제 로봇들 */}
      {clones.map((clone) => (
        <div
          key={clone.id}
          className="absolute z-20 transition-all duration-500 ease-out"
          style={{
            left: getPercentX(clone.x),
            top: getPercentY(clone.y),
            transform: "translate(-50%, -90%) scale(0.65)",
            opacity: 0.75,
          }}
        >
          <div style={{ transform: toDirRotate(clone.direction) }}>
            {renderCharacter("idle", clone.emotion, clone.scale, toBaseDir(clone.direction), 70)}
          </div>
        </div>
      ))}

      {/* Layer 4 & 5: 메인 로봇 캐릭터 및 말풍선 */}
      <div
        className="absolute z-30 transition-all duration-300 ease-out"
        style={{
          left: getPercentX(pos.x),
          top: getPercentY(pos.y),
          transform: "translate(-50%, -90%)",
        }}
      >
        {/* 변수 렌더링 - 로봇 바로 머리 위에 띄움 */}
        {showVariable && varName && (
          <div className="absolute bottom-[98%] left-1/2 -translate-x-1/2 mb-12 z-50">
            <VariableFloat varName={varName} varValue={varValue} visible={!!showVariable} />
          </div>
        )}

        {/* 말풍선 렌더링 - 로봇 상단에 위치 */}
        {speech && (
          <div className="absolute bottom-[95%] left-1/2 -translate-x-1/2 mb-3 z-40 w-max max-w-[200px]">
            <RobotSpeechBubble text={speech} visible={!!speech} />
          </div>
        )}

        <motion.div
          animate={
            robotState === "spinning"
              ? { rotate: [0, 360], transition: { duration: 0.7, ease: "easeInOut" } }
              : robotState === "shaking"
              ? { x: [0, -10, 10, -10, 10, -5, 5, 0], transition: { duration: 0.5 } }
              : { rotate: 0, x: 0 }
          }
        >
          <div style={{ transform: toDirRotate(direction) }}>
            {renderCharacter(robotState, emotion, scale, toBaseDir(direction), 70)}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
