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
          name: user.displayName || user.username,
          username: user.username,
          role: user.role,
          schoolId: user.schoolId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = Number(user.id);
        token.username = (user as { username?: string }).username;
        token.role = (user as { role?: string }).role;
        token.schoolId = (user as { schoolId?: number }).schoolId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = String(token.userId);
        (session.user as { username?: string }).username = token.username as string;
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
