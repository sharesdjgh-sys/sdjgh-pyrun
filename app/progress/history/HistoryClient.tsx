"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Flame,
  Lightbulb,
  MessageCircle,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { getStudentCallName } from "@/lib/student-name";
import { learningAttemptStatus, type LearningAttemptStatus } from "@/lib/learning-history";

interface BadgeInfo {
  conceptId: number;
  conceptNameKo: string;
  level: number;
}

interface FeedbackItem {
  id: number;
  conceptIds: number[];
  codeSubmitted: string;
  outputText: string | null;
  aiFeedback: string;
  isSuccess: boolean;
  practiceConceptId: number | null;
  isSolved: boolean | null;
  createdAt: string;
}

type HistoryFilter = "review" | "all" | "solved" | "free" | "pending";

const STATUS_META: Record<LearningAttemptStatus, {
  label: string;
  description: string;
  icon: React.ElementType;
}> = {
  solved: { label: "정답 해결", description: "문제의 조건을 모두 충족했어", icon: Trophy },
  incorrect: { label: "다시 볼 오답", description: "실행됐지만 문제의 조건이 부족했어", icon: AlertCircle },
  pending: { label: "채점 확인 필요", description: "AI 판정을 완료하지 못한 기록이야", icon: Clock3 },
  free: { label: "자유 코딩", description: "스스로 작성하고 실행한 코드야", icon: Code2 },
  runtime_error: { label: "실행 오류", description: "오류를 고치며 성장할 수 있는 기록이야", icon: RotateCcw },
};

export default function HistoryClient({ userName }: { userName: string }) {
  const [badges, setBadges] = useState<BadgeInfo[]>([]);
  const [history, setHistory] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getJson = async (url: string) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error("학습 기록을 불러오지 못했습니다.");
      return response.json();
    };

    Promise.all([getJson("/api/badges"), getJson("/api/progress")])
      .then(([badgeData, progressData]) => {
        const nextHistory = (progressData.feedbackHistory || []) as FeedbackItem[];
        setBadges((badgeData.earned || []) as BadgeInfo[]);
        setHistory(nextHistory);
        if (nextHistory.some((item) => {
          const status = learningAttemptStatus(item);
          return status === "incorrect" || status === "runtime_error";
        })) {
          setFilter("review");
        }
        setLoading(false);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "학습 기록을 불러오지 못했습니다.");
        setLoading(false);
      });
  }, []);

  const badgeByConceptId = useMemo(
    () => new Map(badges.map((badge) => [badge.conceptId, badge])),
    [badges]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<LearningAttemptStatus, number> = {
      solved: 0,
      incorrect: 0,
      pending: 0,
      free: 0,
      runtime_error: 0,
    };
    history.forEach((item) => {
      counts[learningAttemptStatus(item)] += 1;
    });
    return counts;
  }, [history]);

  const filteredHistory = useMemo(() => history.filter((item) => {
    const status = learningAttemptStatus(item);
    if (filter === "all") return true;
    if (filter === "review") return status === "incorrect" || status === "runtime_error";
    return status === filter;
  }), [filter, history]);

  const conceptCount = useMemo(() => new Set(history.flatMap((item) =>
    item.practiceConceptId === null
      ? item.conceptIds
      : [item.practiceConceptId, ...item.conceptIds]
  )).size, [history]);

  const studentName = getStudentCallName(userName);
  const reviewCount = statusCounts.incorrect + statusCounts.runtime_error;
  const solvedRate = statusCounts.solved + reviewCount > 0
    ? Math.round((statusCounts.solved / (statusCounts.solved + reviewCount)) * 100)
    : 0;

  const selectFilter = (nextFilter: HistoryFilter) => {
    setFilter(nextFilter);
    setVisibleCount(8);
  };

  if (loading) {
    return (
      <main className="history-loading">
        <div />
        <p>학습 일지를 정리하고 있어...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="status-page" role="alert">
        <p>{error}</p>
        <button onClick={() => location.reload()}>다시 시도</button>
      </main>
    );
  }

  const filters: Array<{ id: HistoryFilter; label: string; count: number; icon: React.ElementType }> = [
    { id: "review", label: "다시 볼 기록", count: reviewCount, icon: RotateCcw },
    { id: "all", label: "전체 기록", count: history.length, icon: BookOpen },
    { id: "solved", label: "정답 해결", count: statusCounts.solved, icon: Trophy },
    { id: "free", label: "자유 코딩", count: statusCounts.free, icon: Code2 },
    { id: "pending", label: "채점 대기", count: statusCounts.pending, icon: Clock3 },
  ];

  return (
    <div className="history-page">
      <header className="history-topbar">
        <Link href="/progress"><ArrowLeft size={17} /> 성장 기록으로</Link>
        <div><BookOpen size={18} /> 코딩 학습 일지</div>
        <Link href="/learn" className="history-study-link">코딩하러 가기 <ChevronRight size={16} /></Link>
      </header>

      <main className="history-shell">
        <section className="history-hero">
          <div className="history-hero-copy">
            <div className="history-eyebrow"><Sparkles size={15} /> MY CODING ARCHIVE</div>
            <h1>{studentName}의<br /><span>코딩 학습 일지</span></h1>
            <p>틀린 코드는 실패가 아니라 다음 정답으로 가는 힌트야.<br />내가 시도하고 고친 과정을 천천히 돌아보자.</p>
          </div>
          <div className="history-hero-emblem" aria-hidden="true">
            <div><BookOpen size={62} /></div>
            <span><Flame size={15} fill="currentColor" /> 성장 기록</span>
          </div>
          <div className="history-hero-stats">
            <div><strong>{reviewCount}</strong><span>복습할 기록</span></div>
            <div><strong>{statusCounts.solved}</strong><span>해결한 문제</span></div>
            <div><strong>{conceptCount}</strong><span>연습한 개념</span></div>
            <div><strong>{solvedRate}%</strong><span>최근 해결 비율</span></div>
          </div>
        </section>

        {reviewCount > 0 && (
          <section className="history-review-banner">
            <div className="history-review-icon"><Lightbulb size={24} /></div>
            <div>
              <span>TODAY&apos;S REVIEW QUEST</span>
              <strong>다시 살펴볼 코드가 {reviewCount}개 있어</strong>
              <p>피드백을 읽고 코드를 한 번 더 고쳐보면 내 실력이 돼.</p>
            </div>
            <button type="button" onClick={() => selectFilter("review")}>
              오답 복습하기 <ChevronRight size={17} />
            </button>
          </section>
        )}

        <section className="history-content" aria-labelledby="history-list-title">
          <div className="history-content-heading">
            <div>
              <div className="history-section-kicker"><Target size={15} /> LEARNING TIMELINE</div>
              <h2 id="history-list-title">나의 학습 타임라인</h2>
              <p>최근 학습 기록 최대 50개를 모아 보여주고 있어.</p>
            </div>
            <span>{filteredHistory.length}개의 기록</span>
          </div>

          <div className="history-filter-tabs" role="tablist" aria-label="학습 기록 필터">
            {filters.map(({ id, label, count, icon: FilterIcon }) => (
              <button
                type="button"
                role="tab"
                aria-selected={filter === id}
                data-filter={id}
                className={filter === id ? "is-active" : ""}
                onClick={() => selectFilter(id)}
                key={id}
              >
                <FilterIcon size={15} />
                <span>{label}</span>
                <strong>{count}</strong>
              </button>
            ))}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="history-empty">
              <div><Sparkles size={34} /></div>
              <h3>{filter === "review" ? "지금은 복습할 기록이 없어!" : "아직 해당 기록이 없어"}</h3>
              <p>{filter === "review" ? "멋져! 새로운 문제에 도전해볼까?" : "코드를 실행하면 이곳에 학습 과정이 쌓여."}</p>
              <Link href="/learn">새로운 문제 풀기 <ChevronRight size={16} /></Link>
            </div>
          ) : (
            <div className="history-timeline">
              {filteredHistory.slice(0, visibleCount).map((item, index) => {
                const status = learningAttemptStatus(item);
                const meta = STATUS_META[status];
                const StatusIcon = meta.icon;
                const historyConceptIds = item.practiceConceptId === null
                  ? item.conceptIds
                  : [item.practiceConceptId, ...item.conceptIds.filter((id) => id !== item.practiceConceptId)];
                const learnedConcepts = historyConceptIds
                  .map((conceptId) => badgeByConceptId.get(conceptId))
                  .filter((badge): badge is BadgeInfo => Boolean(badge));
                const primaryConcept = learnedConcepts[0];
                const createdAt = new Date(item.createdAt);

                return (
                  <details
                    className={`history-entry learning-journal-entry is-${status}`}
                    open={index === 0 ? true : undefined}
                    key={item.id}
                  >
                    <summary className="history-entry-summary">
                      <div className="history-entry-status"><StatusIcon size={18} /></div>
                      <div className="history-entry-title">
                        <div>
                          <strong>{primaryConcept?.conceptNameKo || (status === "free" ? "자유 코딩" : "파이썬 코드 연습")}</strong>
                          <span className="learning-journal-status"><StatusIcon size={13} /> {meta.label}</span>
                        </div>
                        <p>{meta.description}</p>
                      </div>
                      <time dateTime={item.createdAt}>
                        {createdAt.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" })}
                        <span>{createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </time>
                      <ChevronDown className="history-entry-chevron" size={19} />
                    </summary>

                    <div className="history-entry-detail">
                      <div className="learning-concept-row">
                        <span>이번에 연습한 개념</span>
                        <div>
                          {learnedConcepts.length > 0 ? learnedConcepts.map((badge) => (
                            <em key={badge.conceptId}>Level {badge.level} · {badge.conceptNameKo}</em>
                          )) : <em className="is-free-coding">자유 코딩</em>}
                        </div>
                      </div>

                      <div className="learning-journal-code-grid">
                        <section>
                          <h3><Code2 size={15} /> 내가 작성한 코드</h3>
                          <pre><code>{item.codeSubmitted || "# 작성한 코드가 없어"}</code></pre>
                        </section>
                        <section>
                          <h3><PlayCircle size={15} /> 실행 결과</h3>
                          <pre className={item.outputText ? undefined : "is-empty"}>
                            {item.outputText || (item.isSuccess ? "출력된 내용이 없어" : "실행 중 오류가 발생했어")}
                          </pre>
                        </section>
                      </div>

                      <div className="learning-journal-feedback">
                        <MessageCircle size={18} />
                        <div>
                          <strong>파이런 학습 파트너의 피드백</strong>
                          <p>{item.aiFeedback}</p>
                        </div>
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          )}

          {visibleCount < filteredHistory.length && (
            <button
              type="button"
              className="learning-journal-more"
              onClick={() => setVisibleCount((count) => count + 8)}
            >
              이전 학습 기록 더 보기 <ChevronDown size={17} />
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
