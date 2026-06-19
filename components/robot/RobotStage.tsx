"use client";

import React, { useState, useEffect, useRef } from "react";
import RobotCharacter from "./RobotCharacter";
import DogCharacter from "./DogCharacter";
import GameCharacter from "./GameCharacter";
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
  characterType?: "robot" | "dog" | "game";
}

interface DrawnShape {
  id: string;
  type: string;
  x: number;
  y: number;
}

interface RobotClone {
  id: string;
  x: number;
  y: number;
  direction: "left" | "right";
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
}: RobotStageProps) {
  // 로봇 상태 변수들
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [scale, setScale] = useState(1.0);
  const [emotion, setEmotion] = useState<RobotEmotion>("idle");
  const [robotState, setRobotState] = useState<RobotState>("idle");
  const [speech, setSpeech] = useState<string | null>(null);

  // 캐릭터 렌더링 헬퍼
  const renderCharacter = (
    charState: RobotState,
    charEmotion: RobotEmotion,
    charScale: number,
    charDir: "left" | "right",
    charSize = 70
  ) => {
    switch (characterType) {
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

  const [isRunning, setIsRunning] = useState(false);
  const executionIdRef = useRef(0);

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
        setIsRunning(true);
        // 초기화
        let currentPos = { x: 0, y: 0 };
        let currentDir: "left" | "right" = "right";
        let currentScale = 1.0;
        let currentEmotion: RobotEmotion = "idle";

        setPos(currentPos);
        setDirection(currentDir);
        setScale(currentScale);
        setEmotion(currentEmotion);
        setRobotState("idle");
        setSpeech(null);
        setShapes([]);
        setPaths([{ x: 0, y: 0 }]);
        setClones([]);

        await delay(300);

        for (const cmd of commands) {
          if (executionIdRef.current !== executionId) return;

          switch (cmd.type) {
            case "move": {
              const steps = cmd.params.steps ?? 1;
              // 1걸음 = 30px 이동
              const stepDistance = 30;
              const distance = steps * stepDistance;
              const newX = currentPos.x + (currentDir === "right" ? distance : -distance);

              // 영역 한계 (-200 ~ 200) 체크 및 보정
              const finalX = Math.max(-170, Math.min(170, newX));

              currentPos = { x: finalX, y: currentPos.y };
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
              currentDir = dir === "left" || dir === "right" ? dir : "right";
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
        setEmotion("idle");
        setRobotState("idle");
        setSpeech(null);
        setClones([]);
        setShapes([]);
        setPaths([{ x: 0, y: 0 }]);

        setIsRunning(false);
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      };

      run();
    } else {
      // commands가 비어있는 상태이면 완전히 리셋
      setPos({ x: 0, y: 0 });
      setDirection("right");
      setScale(1.0);
      setEmotion("idle");
      setRobotState("idle");
      setSpeech(null);
      setShapes([]);
      setPaths([{ x: 0, y: 0 }]);
      setClones([]);
      setIsRunning(false);
    }
  }, [commands]);

  // 논리 좌표 x/y를 백분율 스타일 좌표로 매핑
  const getPercentX = (x: number) => `${((200 + x) / 400) * 100}%`;
  const getPercentY = (y: number) => `${((150 - y) / 300) * 100}%`;

  return (
    <div className="relative w-full aspect-[4/3] bg-[#FCFAFF] border border-[#ECE7F8] rounded-2xl overflow-hidden shadow-sm">
      {/* Layer 0: 배경 격자 점 */}
      <StageBackground />

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
          {renderCharacter("idle", clone.emotion, clone.scale, clone.direction, 70)}
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

        {renderCharacter(robotState, emotion, scale, direction, 70)}
      </div>
    </div>
  );
}
