"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Bot } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } else {
      router.push("/learn");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
            <Bot size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">파이썬 학습 서비스</h1>
          <p className="text-slate-400 text-sm mt-1">AI 로봇과 함께 파이썬을 배워요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1d27] rounded-2xl p-6 border border-[#2d3148]">
          <h2 className="text-lg font-semibold text-white mb-5">로그인</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">아이디</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <LogIn size={16} />
            )}
            {loading ? "로그인 중..." : "로그인"}
          </button>

          <p className="text-center text-sm text-slate-400 mt-4">
            계정이 없나요?{" "}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
