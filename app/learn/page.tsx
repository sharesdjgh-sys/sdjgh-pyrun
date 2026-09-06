import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LearnClient from "./LearnClient";
import { isStudentRole } from "@/lib/roles";
import { sessionTenant } from "@/lib/curriculum-access";

export default async function LearnPage() {
  const session = await auth();
  const context = sessionTenant(session);
  if (!session || !context) redirect("/login");
  return <LearnClient key={context.userId} userName={session.user?.name || "학생"} isStudent={isStudentRole(context.role)} />;
}
