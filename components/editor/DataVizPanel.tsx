"use client";

import { BarChart2 } from "lucide-react";

interface DataVizPanelProps {
  plots: string[];
  lv3Loading: boolean;
}

export default function DataVizPanel({ plots, lv3Loading }: DataVizPanelProps) {
  if (lv3Loading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 24,
          color: "#8B83A8",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            border: "4px solid #EFEAF8",
            borderTopColor: "#7B5CF0",
            borderRadius: "50%",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center", lineHeight: 1.7 }}>
          <div style={{ fontWeight: 700, color: "#5C5480", fontSize: 14, marginBottom: 4 }}>
            데이터 분석 환경 준비 중
          </div>
          <div style={{ fontSize: 12.5 }}>
            pandas, matplotlib, scikit-learn 설치 중...
            <br />
            처음 한 번만 필요해요 (약 30~60초)
          </div>
        </div>
      </div>
    );
  }

  if (plots.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 24,
          color: "#B0A8CC",
        }}
      >
        <BarChart2 size={48} strokeWidth={1.2} color="#C9BFE8" />
        <div style={{ textAlign: "center", lineHeight: 1.75, fontSize: 13 }}>
          <div style={{ fontWeight: 700, color: "#7B5CF0", marginBottom: 6 }}>
            시각화 패널
          </div>
          코드에서 <code style={{ background: "#F4EFFC", color: "#7B5CF0", padding: "1px 6px", borderRadius: 5, fontSize: 12 }}>plt.show()</code>를 호출하면
          <br />
          차트가 여기에 나타나요!
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {plots.map((b64, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #EFEAF8",
            padding: 8,
            boxShadow: "0 4px 14px rgba(90,63,214,.06)",
          }}
        >
          <img
            src={`data:image/png;base64,${b64}`}
            alt={`차트 ${i + 1}`}
            style={{ width: "100%", borderRadius: 8, display: "block" }}
          />
        </div>
      ))}
    </div>
  );
}
