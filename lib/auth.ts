import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db/index";
import { schools, users, smartCampusUserBindings } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { exchangeSsoToken } from "@/lib/ssoVerify";
import { isCurrentAuthToken, nativeAccessAllowed } from "@/lib/sso-session";
import { currentBoundStudentNumber } from "@/lib/student-number";

// This deployment serves a single school (matches lib/db/seed.ts's seeded row).
// SSO auto-login runs inside a third-party iframe (embedded under
// platform.sdjgh-ai.kr); SameSite=Lax cookies (NextAuth's default) are not
// sent in that cross-site ancestor context, so signIn("sso", ...) always
// failed the CSRF check when embedded. See the `cookies` override below.
const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-" : "";
const cookieSameSite = useSecureCookies ? "none" : "lax";
const SSO_SCHOOL_CODE = "서대전여고";
const SSO_ROLE_MAP: Record<string, string> = {
  학생: "student", 교사: "teacher", 업무담당자: "teacher", 관리자: "admin",
};

function toAuthorizedUser(user: typeof users.$inferSelect) {
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
}

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
        // 통합 로그인 전용 계정의 무효 해시 표지는 자체 비밀번호로 사용할 수 없다.
        if (user.passwordHash.startsWith("!sso-only!")) return null;

        // Dynamic import of bcryptjs to keep it out of Edge Runtime
        const bcrypt = await import("bcryptjs");
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;
        if (!(await nativeAccessAllowed(user.id, user.schoolId))) return null;

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
    Credentials({
      id: "sso",
      name: "SmartCampus SSO",
      credentials: {
        ssoToken: { label: "ssoToken", type: "text" },
      },
      async authorize(credentials) {
        const ssoToken = credentials?.ssoToken as string | undefined;
        if (!ssoToken) return null;

        const exchange = await exchangeSsoToken(ssoToken);
        if (!exchange) return null;
        const ssoUser = exchange.user;
        const role = SSO_ROLE_MAP[ssoUser.role];
        if (!role) return null;
        // 중앙 B열 ID와 행 등록 UUID가 사전 검토된 같은 public.users.id에
        // 연결된 경우에만 앱 증명을 받아들인다. 5자리 학번은 기수 간 중복 가능하다.
        const ssoSession = {
          centralUserId: ssoUser.userId,
          centralRegistrationId: ssoUser.registrationId,
          centralUid: ssoUser.uid,
          ssoCredential: exchange.sessionProof,
        };

        const bound = await db
          .select({ user: users })
          .from(smartCampusUserBindings)
          .innerJoin(users, and(eq(users.id, smartCampusUserBindings.userId),
            eq(users.schoolId, smartCampusUserBindings.schoolId)))
          .innerJoin(schools, eq(schools.id, smartCampusUserBindings.schoolId))
          .where(and(eq(schools.code, SSO_SCHOOL_CODE),
            eq(smartCampusUserBindings.platformUserId, ssoUser.userId),
            eq(smartCampusUserBindings.registrationId, ssoUser.registrationId)))
          .limit(2);
        if (bound.length !== 1) return null;
        const linkedUser = bound[0].user;
        const currentStudent = role === "student"
          ? currentBoundStudentNumber(ssoUser.userId, ssoUser.uid) : null;
        // 일반 학생의 현재 학번이 중앙 B ID의 입학연도와 맞지 않으면
        // 오래된 학급 정보를 그대로 허용하지 않는다. 특수 형식 계정은 별도 검토한다.
        if (role === "student" && /^\d{2}-\d{5}$/.test(ssoUser.userId) && !currentStudent) return null;
        const syncedUser = { ...linkedUser, role, displayName: ssoUser.name,
          ...(currentStudent ? { studentNumber: currentStudent.studentNumber,
            grade: currentStudent.grade, classNumber: currentStudent.classNumber,
            seatNumber: currentStudent.seatNumber } : {}) };
        if (linkedUser.role !== syncedUser.role || linkedUser.displayName !== syncedUser.displayName ||
            (currentStudent && (linkedUser.studentNumber !== syncedUser.studentNumber ||
              linkedUser.grade !== syncedUser.grade || linkedUser.classNumber !== syncedUser.classNumber ||
              linkedUser.seatNumber !== syncedUser.seatNumber))) {
          // 중앙 등록 세대에 묶인 같은 PK만 갱신한다. 입학연도 결합 학번으로
          // 다음 기수의 같은 5자리 번호와 DB 고유값이 겹치지 않게 한다.
          await db.update(users).set({ role: syncedUser.role, displayName: syncedUser.displayName,
            ...(currentStudent ? { studentNumber: currentStudent.studentNumber,
              grade: currentStudent.grade, classNumber: currentStudent.classNumber,
              seatNumber: currentStudent.seatNumber } : {}) }).where(and(
            eq(users.id, linkedUser.id), eq(users.schoolId, linkedUser.schoolId)));
        }
        return { ...toAuthorizedUser(syncedUser), ...ssoSession };
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
        const sso = user as { centralUserId?: string; centralRegistrationId?: string; centralUid?: string;
          ssoCredential?: string };
        if (sso.centralUserId && sso.centralRegistrationId && typeof sso.centralUid === "string" && sso.ssoCredential) {
          token.authOrigin = "smart-campus-v2";
          token.centralUserId = sso.centralUserId;
          token.centralRegistrationId = sso.centralRegistrationId;
          token.centralUid = sso.centralUid;
          token.ssoCredential = sso.ssoCredential;
        } else {
          token.authOrigin = "native-v2";
        }
      } else if (!(await isCurrentAuthToken(token))) {
        // Auth.js는 null 반환 시 세션 쿠키를 지운다. 중앙 중지·코드 재발급·
        // 검증 장애 모두 다음 서버 요청에서 SSO 세션을 사용할 수 없게 한다.
        return null;
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
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}authjs.session-token`,
      options: { httpOnly: true, sameSite: cookieSameSite, path: "/", secure: useSecureCookies },
    },
    callbackUrl: {
      name: `${cookiePrefix}authjs.callback-url`,
      options: { httpOnly: true, sameSite: cookieSameSite, path: "/", secure: useSecureCookies },
    },
    csrfToken: {
      name: `${useSecureCookies ? "__Host-" : ""}authjs.csrf-token`,
      options: { httpOnly: true, sameSite: cookieSameSite, path: "/", secure: useSecureCookies },
    },
  },
});
