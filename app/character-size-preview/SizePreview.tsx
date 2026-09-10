"use client";

import { useCallback, useState } from "react";
import RobotStage from "@/components/robot/RobotStage";
import { robotApi } from "@/lib/robot-api";
import { animationQueue, type RobotCommand } from "@/lib/animation-queue";

export default function SizePreview() {
  const [scale, setScale] = useState("1");
  const [direction, setDirection] = useState("right");
  const [commands, setCommands] = useState<RobotCommand[]>([]);
  const [finished, setFinished] = useState(0);
  const complete = useCallback(() => setFinished(value => value + 1), []);
  const run = (action: "size" | "jump" | "dance") => {
    animationQueue.clear();
    robotApi.size(Number(scale));
    robotApi.turn(direction);
    if (action === "jump") robotApi.jump();
    if (action === "dance") robotApi.dance();
    setFinished(0);
    setCommands(animationQueue.get());
    animationQueue.clear();
  };
  return <main style={{ padding: 32, background: "#F5F3FA", minHeight: "100vh" }}>
    <h1 style={{ fontSize: 24 }}>robot.size 확대·축소 검수</h1>
    <div style={{ display: "flex", gap: 16, padding: "20px 0" }}>
      <label>배율 <select aria-label="배율" value={scale} onChange={e => setScale(e.target.value)}>{[.5, 1, 2.5, 3].map(n => <option key={n}>{n}</option>)}</select></label>
      <label>방향 <select aria-label="방향" value={direction} onChange={e => setDirection(e.target.value)}><option value="right">오른쪽</option><option value="left">왼쪽</option></select></label>
      <button onClick={() => run("size")}>크기 실행</button>
      <button onClick={() => run("jump")}>점프 후 확인</button>
      <button onClick={() => run("dance")}>춤 후 확인</button>
      <output aria-label="실행 상태">{finished >= 2 ? "완료" : commands.length ? "실행 중" : "대기"}</output>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 24 }}>
      {(["robot", "dog"] as const).map(type => <section key={type} aria-label={type}>
        <h2 style={{ marginBottom: 12 }}>{type === "robot" ? "로봇" : "강아지"} · {scale}배</h2>
        <div style={{ height: 560 }}><RobotStage characterType={type} commands={commands} onAnimationComplete={complete} /></div>
      </section>)}
    </div>
  </main>;
}
