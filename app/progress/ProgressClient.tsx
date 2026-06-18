"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, MessageSquare, CheckCircle, Circle, Loader2 } from "lucide-react";
import BadgeCard from "@/components/badges/BadgeCard";
import { BADGE_METADATA } from "@/lib/curriculum";

interface BadgeInfo {
  badgeId: number;
  conceptId: number;
  nameKo: string;
  iconName: string;
  colorClass: string;
  earned: boolean;
  clearedAt: string | null;
}

interface FeedbackItem {
  id: number;
  conceptIds: number[];
  aiFeedback: string;
  isSuccess: boolean;
  createdAt: string;
  codeSnippet: string;
}

export default function ProgressClient() {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [clearedCount, setClearedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/badges").then((r) => r.json()),
      fetch("/api/progress").then((r) => r.json()),
    ]).then(([badgeData, progressData]) => {
      setBadges(badgeData.earned || []);
      setFeedbackHistory(progressData.feedbackHistory || []);
      setProgressPercent(progressData.progressPercent || 0);
      setClearedCount((progressData.clearedConceptIds || []).length);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <Loader2 size={32} className="text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <div className="bg-[#1a1d27] border-b border-[#2d3148] px-4 py-3 flex items-center gap-3">
        <Link
          href="/learn"
          className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">학습으로 돌아가기</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Progress Bar */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-400" />
            <h2 className="text-lg font-bold">학습 진행률</h2>
          </div>
          <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-300 text-sm">{clearedCount}개 / 16개 개념 완료</span>
              <span className="text-blue-400 font-bold text-lg">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle size={12} className="text-green-400" /> 완료된 개념
              </span>
              <span className="flex items-center gap-1">
                <Circle size={12} className="text-slate-600" /> 미완료 개념
              </span>
            </div>
          </div>
        </section>

        {/* Badge Grid */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-yellow-400 text-xl">★</span>
            <h2 className="text-lg font-bold">획득한 뱃지</h2>
            <span className="text-slate-500 text-sm ml-1">({clearedCount}/16)</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {BADGE_METADATA.map((badge, idx) => {
              const cid = idx + 1;
              const earned = badges.some((b) => b.conceptId === cid && b.earned);
              return (
                <BadgeCard
                  key={cid}
                  nameKo={badge.nameKo}
                  iconName={badge.iconName}
                  colorClass={badge.colorClass}
                  earned={earned}
                  size="md"
                />
              );
            })}
          </div>
        </section>

        {/* Feedback History */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={20} className="text-purple-400" />
            <h2 className="text-lg font-bold">AI 피드백 기록</h2>
          </div>
          {feedbackHistory.length === 0 ? (
            <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-8 text-center text-slate-500">
              아직 코드를 실행한 기록이 없어요. 학습 화면에서 코드를 실행해보세요.
            </div>
          ) : (
            <div className="space-y-3">
              {feedbackHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1a1d27] border border-[#2d3148] rounded-xl p-4 hover:border-slate-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.isSuccess
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.isSuccess ? "성공" : "오류"}
                    </span>
                    <span className="text-slate-600 text-xs">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {item.codeSnippet && (
                    <pre className="text-slate-500 text-xs font-mono bg-slate-900 rounded-lg p-2 mb-2 overflow-x-auto">
                      {item.codeSnippet}
                      {item.codeSnippet.length >= 100 ? "..." : ""}
                    </pre>
                  )}
                  <p className="text-slate-300 text-sm leading-relaxed">{item.aiFeedback}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
