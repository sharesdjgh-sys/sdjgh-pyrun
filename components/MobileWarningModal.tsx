"use client";

import { useEffect, useState } from "react";
import { Monitor, Tablet } from "lucide-react";

export default function MobileWarningModal() {
  const [show, setShow] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const check = () => setShow(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.88) translateY(16px); }
          100% { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes blobFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-12px) scale(1.04); }
        }
        @keyframes phoneWiggle {
          0%, 100% { transform: rotate(-8deg); }
          50%       { transform: rotate(8deg); }
        }
      `}</style>

      {/* 배경 오버레이 */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "rgba(44, 39, 71, 0.55)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          animation: "fadeIn 0.25s ease",
        }}
      >
        {/* 카드 */}
        <div
          style={{
            position: "relative",
            background: "#ffffff",
            borderRadius: "28px",
            padding: "40px 32px 36px",
            maxWidth: "340px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 30px 70px rgba(44, 39, 71, 0.32)",
            overflow: "hidden",
            animation: "popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {/* 배경 블롭 */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              top: "-40px",
              left: "-40px",
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, #C9B6FF, #A78BFA00)",
              animation: "blobFloat 9s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "-30px",
              right: "-30px",
              width: "140px",
              height: "140px",
              borderRadius: "50%",
              background: "radial-gradient(circle at 60% 40%, #FFC2DA, #FF8FB800)",
              animation: "blobFloat 11s ease-in-out infinite reverse",
              pointerEvents: "none",
            }}
          />

          {/* 아이콘 */}
          <div
            style={{
              fontSize: "3.2rem",
              marginBottom: "1.25rem",
              display: "inline-block",
              animation: "phoneWiggle 1.6s ease-in-out infinite",
            }}
          >
            📱
          </div>

          {/* 제목 */}
          <h2
            style={{
              fontFamily: "var(--font-jua), 'Jua', sans-serif",
              fontSize: "1.3rem",
              fontWeight: 700,
              color: "#2C2747",
              marginBottom: "0.75rem",
              lineHeight: 1.4,
              position: "relative",
            }}
          >
            모바일은 지원하지 않아요
          </h2>

          {/* 설명 */}
          <p
            style={{
              fontSize: "0.875rem",
              color: "#544D70",
              lineHeight: 1.75,
              marginBottom: "2rem",
              position: "relative",
            }}
          >
            PyRun Studio는 코드 편집기와 캐릭터 무대를<br />
            함께 보여주는 서비스예요.<br />
            작은 화면에서는 제대로 이용하기 어려우니<br />
            <strong style={{ color: "#7B5CF0" }}>태블릿 또는 PC</strong>에서 접속해 주세요!
          </p>

          {/* 디바이스 안내 칩 */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              marginBottom: "2rem",
              position: "relative",
            }}
          >
            {[
              { Icon: Tablet, label: "태블릿" },
              { Icon: Monitor, label: "PC / 노트북" },
            ].map(({ Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "#F4EFFC",
                  border: "1px solid #EFEAF8",
                  borderRadius: "14px",
                  padding: "0.75rem 1.1rem",
                  color: "#7B5CF0",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                <Icon size={24} strokeWidth={1.8} />
                {label}
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
