"use client";

import React, { useState } from "react";

export default function RobotApiTooltip() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: "1.5px solid #ECE7F8",
          background: isOpen ? "#F2ECFD" : "#fff",
          color: "#7B5CF0",
          fontFamily: "inherit",
          fontSize: 12.5,
          fontWeight: 700,
          padding: "5px 12px",
          borderRadius: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 6,
          transition: "all 0.15s ease",
        }}
      >
        <span>📖 Robot API 사용법</span>
        <span
          style={{
            fontSize: 10,
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            display: "inline-block",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            zIndex: 100,
            width: 440,
            background: "#fff",
            border: "1px solid #ECE7F8",
            borderRadius: 16,
            padding: "16px",
            boxShadow: "0 10px 30px rgba(90,63,214,.12)",
            animation: "popIn 0.2s ease",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#3A3458",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>🤖 로봇 명령어 사전</span>
            <span style={{ fontSize: 11, color: "#8B6CFF", background: "#F2ECFD", padding: "2px 6px", borderRadius: 4 }}>
              import robot 필수!
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 380,
              overflowY: "auto",
              paddingRight: 4,
            }}
          >
            <div style={{ borderBottom: "1.5px solid #F4F1FA", paddingBottom: 8 }}>
              <code style={{ fontSize: 11.5, color: "#7B5CF0", fontWeight: 700, display: "block" }}>import robot</code>
              <span style={{ fontSize: 11, color: "#A39CC0" }}>로봇을 조종하기 위해 코드 맨 위에 꼭 적어주세요!</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "8px 10px", fontSize: 12 }}>
              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.move(칸수)</code>
              <span style={{ color: "#5A527A" }}>지정한 칸수만큼 앞으로 이동 (1~20)</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.turn("방향")</code>
              <span style={{ color: "#5A527A" }}>방향 전환 ("left" / "right" / "up" / "down")</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.jump()</code>
              <span style={{ color: "#5A527A" }}>제자리에서 껑충 뛰어오르기</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.say("말")</code>
              <span style={{ color: "#5A527A" }}>말풍선에 원하는 대사 표시</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.emotion("감정")</code>
              <span style={{ color: "#5A527A" }}>표정 및 연출 변경 (happy/sad/angry/surprised)</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.dance()</code>
              <span style={{ color: "#5A527A" }}>신나게 댄스 댄스!</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.size(크기)</code>
              <span style={{ color: "#5A527A" }}>로봇 크기 변경 (0.5 ~ 3.0)</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.draw("도형")</code>
              <span style={{ color: "#5A527A" }}>도형 그리기 (circle/square/star/triangle/heart/diamond)</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.clone()</code>
              <span style={{ color: "#5A527A" }}>현재 자리에 로봇 복제하기 (최대 5개)</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.bounce(횟수)</code>
              <span style={{ color: "#5A527A" }}>지정 횟수만큼 점프 반복 (1~5)</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.spin()</code>
              <span style={{ color: "#5A527A" }}>제자리에서 한 바퀴 회전</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.shake()</code>
              <span style={{ color: "#5A527A" }}>몸을 좌우로 흔들기</span>

              <code style={{ color: "#7B5CF0", fontWeight: 700 }}>robot.clear()</code>
              <span style={{ color: "#5A527A" }}>스테이지에 그린 도형 전부 지우기</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
