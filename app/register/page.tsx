"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Bot } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "오류가 발생했습니다.");
    } else {
      router.push("/login?registered=true");
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
          <p className="text-slate-400 text-sm mt-1">계정을 만들고 시작해요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1a1d27] rounded-2xl p-6 border border-[#2d3148]">
          <h2 className="text-lg font-semibold text-white mb-5">회원가입</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">닉네임</label>
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                className="w-full bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="화면에 표시될 이름"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">아이디</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="영문, 숫자 3~50자"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#0f1117] border border-[#2d3148] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="4자 이상"
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
              <UserPlus size={16} />
            )}
            {loading ? "가입 중..." : "회원가입"}
          </button>

          <p className="text-center text-sm text-slate-400 mt-4">
            이미 계정이 있나요?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
