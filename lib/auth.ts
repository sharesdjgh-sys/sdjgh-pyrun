import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/index";
import { schools, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        schoolCode: { label: "학교명", type: "text" },
        username: { label: "아이디", type: "text" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const username = credentials.username as string;
        const password = credentials.password as string;
        const schoolCode = typeof credentials.schoolCode === "string"
          ? credentials.schoolCode.trim().toLowerCase()
          : "";

        const candidates = schoolCode
          ? await db
              .select({ user: users })
              .from(users)
              .innerJoin(schools, eq(users.schoolId, schools.id))
              .where(and(eq(users.username, username), eq(schools.code, schoolCode)))
              .limit(2)
          : await db
              .select({ user: users })
              .from(users)
              .where(eq(users.username, username))
              .limit(2);

        // 학교명이 없어도 동일 아이디가 한 학교에만 존재하면 기존 방식으로 로그인할 수 있습니다.
        if (candidates.length !== 1) return null;
        const user = candidates[0].user;

        // Dynamic import of bcryptjs to keep it out of Edge Runtime
        const bcrypt = await import("bcryptjs");
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: String(user.id),
          name: user.role === "student"
            ? user.nickname && user.nickname !== user.displayName ? user.nickname : "코드러너"
            : user.displayName || user.username,
          username: user.username,
          nickname: user.nickname,
          displayName: user.displayName,
          role: user.role,
          schoolId: user.schoolId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = Number(user.id);
        token.username = (user as { username?: string }).username;
        token.nickname = (user as { nickname?: string | null }).nickname;
        token.displayName = (user as { displayName?: string | null }).displayName;
        token.role = (user as { role?: string }).role;
        token.schoolId = (user as { schoolId?: number }).schoolId;
      }
      if (trigger === "update" && typeof session?.name === "string") {
        token.name = session.name.slice(0, 100);
      }
      if (trigger === "update" && typeof session?.nickname === "string") {
        token.nickname = session.nickname.slice(0, 20);
      }
      if (trigger === "update" && typeof session?.displayName === "string") {
        token.displayName = session.displayName.slice(0, 100);
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = String(token.userId);
        session.user.name = typeof token.name === "string" ? token.name : session.user.name;
        (session.user as { username?: string }).username = token.username as string;
        (session.user as { nickname?: string }).nickname = typeof token.nickname === "string" ? token.nickname : "";
        (session.user as { displayName?: string }).displayName = typeof token.displayName === "string" ? token.displayName : "";
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { schoolId?: number }).schoolId = Number(token.schoolId);
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
