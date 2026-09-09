import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LearnClient from "./LearnClient";
import { isStudentRole } from "@/lib/roles";
import { sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export default async function LearnPage() {
  const session = await auth();
  const context = sessionTenant(session);
  if (!session || !context) redirect("/login");
  const isStudent = isStudentRole(context.role);
  const [profile] = await db
    .select({ displayName: users.displayName })
    .from(users)
    .where(and(eq(users.id, context.userId), eq(users.schoolId, context.schoolId)))
    .limit(1);
  const displayName = profile?.displayName?.trim();
  const userName = displayName || (isStudent ? "학생" : session.user?.name || "사용자");
  return <LearnClient key={context.userId} userName={userName} isStudent={isStudent} />;
}
