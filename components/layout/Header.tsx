"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Bot, TrendingUp, LogOut } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-14 bg-[#1a1d27] border-b border-[#2d3148] flex items-center justify-between px-4 shrink-0">
      <Link href="/learn" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
          <Bot size={16} className="text-white" />
        </div>
        <span className="font-bold text-white text-sm">파이썬 학습 서비스</span>
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-slate-400 text-sm hidden sm:block">
          {session?.user?.name || "학생"}
        </span>
        <Link
          href="/progress"
          className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <TrendingUp size={15} />
          <span className="hidden sm:block">성장 기록</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
}
