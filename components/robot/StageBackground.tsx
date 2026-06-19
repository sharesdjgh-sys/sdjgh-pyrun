"use client";

import React from "react";

export default function StageBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* 도트 격자 패턴 */}
        <pattern id="dot-grid" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1.5" fill="rgba(123, 92, 240, 0.08)" />
        </pattern>
      </defs>
      {/* 격자 배경 채우기 */}
      <rect width="100%" height="100%" fill="url(#dot-grid)" />

      {/* 중앙 축 가이드라인 */}
      <line
        x1="50%"
        y1="0"
        x2="50%"
        y2="100%"
        stroke="rgba(123, 92, 240, 0.06)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
      <line
        x1="0"
        y1="50%"
        x2="100%"
        y2="50%"
        stroke="rgba(123, 92, 240, 0.06)"
        strokeWidth="1"
        strokeDasharray="4 4"
      />
    </svg>
  );
}
