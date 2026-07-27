"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CircleHelp,
  Lightbulb,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { getStudentVocative } from "@/lib/student-name";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const HINT_SECTION_META = {
  "살펴볼 부분": {
    icon: Search,
    color: "#D35A72",
    background: "#FFF6F8",
    border: "#F4D9DF",
  },
  "개념 정리": {
    icon: BookOpen,
    color: "#5B55B8",
    background: "#F7F6FF",
    border: "#E2DFFA",
  },
  "미니 예시": {
    icon: Lightbulb,
    color: "#24708F",
    background: "#F2FAFD",
    border: "#D3EAF3",
    code: true,
  },
  "힌트": {
    icon: Lightbulb,
    color: "#B56B08",
    background: "#FFF9EC",
    border: "#F3E2BA",
  },
  "생각해 볼 질문": {
    icon: CircleHelp,
    color: "#287A68",
    background: "#F1FBF8",
    border: "#CFECE4",
  },
  "한눈에 보기": {
    icon: BookOpen,
    color: "#5B55B8",
    background: "#F7F6FF",
    border: "#E2DFFA",
    code: false,
  },
  "사용 방법": {
    icon: Search,
    color: "#24708F",
    background: "#F2FAFD",
    border: "#D3EAF3",
    code: false,
  },
  "매개변수": {
    icon: CircleHelp,
    color: "#7A5B24",
    background: "#FFFAF0",
    border: "#EFE0BE",
    code: false,
  },
  "쉬운 예제": {
    icon: Lightbulb,
    color: "#B56B08",
    background: "#FFF9EC",
    border: "#F3E2BA",
    code: true,
  },
  "기억할 점": {
    icon: CircleHelp,
    color: "#287A68",
    background: "#F1FBF8",
    border: "#CFECE4",
    code: false,
  },
} as const;

type HintSectionTitle = keyof typeof HINT_SECTION_META;

function parseHintSections(content: string) {
  const sections: Array<{ title: HintSectionTitle; body: string }> = [];
  let current: { title: HintSectionTitle; lines: string[] } | null = null;

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(
      /^(?:#{1,3}\s*)?(?:\*\*)?(살펴볼 부분|개념 정리|미니 예시|힌트|생각해 볼 질문|한눈에 보기|사용 방법|매개변수|쉬운 예제|기억할 점)(?:\*\*)?\s*:?\s*(.*)$/,
    );

    if (match) {
      if (current) {
        const body = current.lines.join("\n").trim();
        if (body) sections.push({ title: current.title, body });
      }
      current = {
        title: match[1] as HintSectionTitle,
        lines: match[2] ? [match[2]] : [],
      };
    } else if (current) {
      current.lines.push(line);
    }
  }

  if (current) {
    const body = current.lines.join("\n").trim();
    if (body) sections.push({ title: current.title, body });
  }

  return sections;
}

function AssistantMessageContent({ content }: { content: string }) {
  const sections = parseHintSections(content);
  if (sections.length < 2) return <>{content}</>;

  return (
    <div style={{ display: "grid", gap: 9 }}>
      {sections.map((section) => {
        const meta = HINT_SECTION_META[section.title];
        const Icon = meta.icon;
        return (
          <section
            key={section.title}
            style={{
              padding: "10px 11px 11px",
              border: `1px solid ${meta.border}`,
              borderRadius: 12,
              background: meta.background,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: 6,
                color: meta.color,
                fontSize: 12,
                fontWeight: 900,
                lineHeight: 1.2,
              }}
            >
              <Icon size={14} strokeWidth={2.4} />
              {section.title}
            </div>
            <div
              style={{
                color: "#4A4165",
                fontSize: 12.5,
                lineHeight: 1.62,
                whiteSpace: "pre-wrap",
                ...("code" in meta && meta.code
                  ? {
                      padding: "9px 10px",
                      borderRadius: 9,
                      background: "rgba(255,255,255,.78)",
                      color: "#30445A",
                      fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                      fontSize: 12,
                    }
                  : {}),
              }}
            >
              {section.body}
            </div>
          </section>
        );
      })}
    </div>
  );
}

interface StudentHintChatbotProps {
  studentName: string;
  conceptName: string;
  conceptDescription: string;
  code: string;
  output: string;
  error: string;
}

function createWelcomeMessage(studentName: string) {
  const greeting = `안녕, ${getStudentVocative(studentName)}!`;
  return `${greeting} 나는 같이 코딩을 고민해주는 파이런 학습 파트너야.

코딩이 어렵고 막히는 건 당연해. 부담 갖지 말고 편하게 물어봐! 어디를 살펴보면 좋을지 한 걸음씩 같이 찾아보자.`;
}

const QUICK_QUESTIONS = [
  "어디에서 실수했는지 알려줘",
  "이 개념을 쉽게 설명해줘",
  "help(print)를 쉽게 설명해줘",
  "다음 힌트를 하나만 줘",
];

export default function StudentHintChatbot({
  studentName,
  conceptName,
  conceptDescription,
  code,
  output,
  error,
}: StudentHintChatbotProps) {
  const welcomeMessage = createWelcomeMessage(studentName);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, sending]);

  async function sendMessage(text = input) {
    const content = text.trim();
    if (!content || sending) return;

    const userMessage: ChatMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage].slice(-10);
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          context: {
            conceptName,
            conceptDescription,
            code,
            output,
            error,
          },
        }),
      });
      const data = await response.json().catch(() => ({}));
      const answer = response.ok && typeof data.answer === "string"
        ? data.answer
        : typeof data.error === "string"
          ? data.error
          : "힌트를 준비하지 못했어. 잠시 후에 다시 물어봐 줘.";
      const assistantMessage: ChatMessage = { role: "assistant", content: answer };
      setMessages((current) => [
        ...current,
        assistantMessage,
      ].slice(-10));
    } catch {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: "네트워크 연결을 확인한 뒤 다시 물어봐 줘.",
      };
      setMessages((current) => [
        ...current,
        assistantMessage,
      ].slice(-10));
    } finally {
      setSending(false);
    }
  }

  function resetChat() {
    setMessages([{ role: "assistant", content: welcomeMessage }]);
    setInput("");
  }

  return (
    <>
      {open && (
        <section
          className="student-hint-chat-panel"
          aria-label="파이런 학습 파트너"
          style={{
            position: "fixed",
            right: 20,
            bottom: 74,
            width: 530,
            height: 594,
            maxWidth: "calc(100vw - 40px)",
            maxHeight: "calc(100vh - 98px)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #DED3FA",
            borderRadius: "24px 24px 12px 24px",
            background: "#fff",
            boxShadow: "0 22px 60px rgba(69,45,150,.24)",
          }}
        >
          <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", background: "linear-gradient(135deg,#F5F0FF,#EEE7FF)", borderBottom: "1px solid #E8DFFC" }}>
            <div style={{ width: 38, height: 38, display: "grid", placeItems: "center", overflow: "hidden", borderRadius: 12, background: "#fff", boxShadow: "0 5px 14px rgba(123,92,240,.16)" }}>
              <Image src="/pyrun_studio-favicon.png" alt="" width={36} height={31} style={{ objectFit: "contain" }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#3D2E8A", fontSize: 15, fontWeight: 900 }}>파이런 학습 파트너</div>
              <div style={{ marginTop: 2, color: "#82769F", fontSize: 11.5 }}>어려운 부분을 같이 하나씩 풀어보자</div>
            </div>
            <button onClick={resetChat} aria-label="대화 지우기" title="대화 지우기" style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: 0, borderRadius: 9, background: "rgba(255,255,255,.7)", color: "#887BA7", cursor: "pointer" }}>
              <Trash2 size={15} />
            </button>
            <button onClick={() => setOpen(false)} aria-label="챗봇 닫기" style={{ width: 32, height: 32, display: "grid", placeItems: "center", border: 0, borderRadius: 9, background: "rgba(255,255,255,.7)", color: "#625879", cursor: "pointer" }}>
              <X size={17} />
            </button>
          </header>

          <div style={{ padding: "8px 13px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #F0EBFA", background: "#FCFBFF", color: "#756A91", fontSize: 11.5 }}>
            <Lightbulb size={13} color="#F0A31A" />
            현재 단원: <strong style={{ color: "#5C4E84" }}>{conceptName || "자유 학습"}</strong>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "15px 14px 8px", background: "linear-gradient(180deg,#FDFCFF,#F8F5FF)" }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
                <div
                  style={{
                    maxWidth: message.role === "user" ? "86%" : "94%",
                    padding: "10px 12px",
                    borderRadius: message.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: message.role === "user" ? "linear-gradient(135deg,#8E70F7,#7254E7)" : "#fff",
                    color: message.role === "user" ? "#fff" : "#4A4165",
                    border: message.role === "user" ? "none" : "1px solid #EAE4F6",
                    boxShadow: message.role === "user" ? "0 5px 13px rgba(114,84,231,.18)" : "0 4px 12px rgba(80,61,137,.06)",
                    fontSize: 12.5,
                    lineHeight: 1.58,
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                  }}
                >
                  {message.role === "assistant"
                    ? <AssistantMessageContent content={message.content} />
                    : message.content}
                </div>
              </div>
            ))}
            {sending && (
              <div style={{ display: "flex", gap: 4, width: "fit-content", padding: "11px 14px", border: "1px solid #EAE4F6", borderRadius: "16px 16px 16px 4px", background: "#fff" }} aria-label="답변 작성 중">
                {[0, 1, 2].map((item) => (
                  <span key={item} style={{ width: 6, height: 6, borderRadius: "50%", background: "#9B7FFF", animation: `dotBounce 1.2s ${item * 0.15}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 2 && (
            <div style={{ display: "flex", gap: 6, padding: "8px 12px", overflowX: "auto", borderTop: "1px solid #F0EBFA", background: "#fff" }}>
              {QUICK_QUESTIONS.map((question) => (
                <button key={question} onClick={() => void sendMessage(question)} disabled={sending} style={{ flex: "none", padding: "7px 9px", border: "1px solid #DDD3F5", borderRadius: 99, background: "#F8F5FF", color: "#6C5B98", cursor: "pointer", fontFamily: "inherit", fontSize: 10.5, fontWeight: 700 }}>
                  {question}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: "10px 11px 11px", borderTop: "1px solid #EDE7F8", background: "#fff" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 7, padding: "7px 7px 7px 11px", border: "1.5px solid #DED6F1", borderRadius: 15, background: "#FCFBFF" }}>
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 1_000))}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.ctrlKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={3}
                placeholder="막힌 부분을 편하게 물어봐"
                aria-label="챗봇 질문"
                style={{ flex: 1, minWidth: 0, minHeight: 60, maxHeight: 180, overflowY: "auto", resize: "vertical", border: 0, outline: 0, background: "transparent", color: "#403755", fontFamily: "inherit", fontSize: 12.5, lineHeight: 1.5 }}
              />
              <button onClick={() => void sendMessage()} disabled={!input.trim() || sending} aria-label="질문 보내기" style={{ width: 36, height: 36, flex: "none", display: "grid", placeItems: "center", border: 0, borderRadius: 11, background: !input.trim() || sending ? "#D9D1EC" : "#7B5CF0", color: "#fff", cursor: !input.trim() || sending ? "not-allowed" : "pointer" }}>
                <Send size={16} />
              </button>
            </div>
            <div style={{ marginTop: 6, textAlign: "center", color: "#A59CB9", fontSize: 9.5 }}>Enter로 줄바꿈 · Ctrl + Enter로 질문 보내기</div>
          </div>
        </section>
      )}

      <div style={{ position: "fixed", right: 20, bottom: 18, zIndex: 101, display: "flex", alignItems: "center", gap: 8 }}>
        {!open && (
          <div style={{ padding: "8px 11px", border: "1px solid #E0D7F6", borderRadius: 12, background: "#fff", color: "#5C4E84", boxShadow: "0 8px 20px rgba(70,51,128,.13)", fontSize: 11.5, fontWeight: 800 }}>
            막히면 물어봐!
          </div>
        )}
          <button
            onClick={() => setOpen((current) => !current)}
            aria-label={open ? "챗봇 닫기" : "힌트 챗봇 열기"}
            aria-expanded={open}
            style={{
              width: 65,
              height: 65,
              display: "grid",
              placeItems: "center",
              overflow: "hidden",
              border: open ? "3px solid #DED3FA" : "3px solid #fff",
              borderRadius: 20,
              background: "linear-gradient(145deg,#F7F3FF,#E9DEFF)",
              boxShadow: open
                ? "0 8px 18px rgba(100,65,209,.22)"
                : "0 12px 30px rgba(100,65,209,.3)",
              cursor: "pointer",
            }}
          >
            <Image src="/pyrun_studio-favicon.png" alt="파이런 학습 파트너" width={61} height={53} priority style={{ objectFit: "contain" }} />
          </button>
      </div>
    </>
  );
}
