import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/index";
import { concepts, users } from "@/lib/db/schema";
import { resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";
import { canOpenAdminPage, isAdministratorRole } from "@/lib/roles";
import { and, asc, eq } from "drizzle-orm";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const currentUserId = Number(session?.user?.id);
  if (!session || !Number.isInteger(currentUserId) || !canOpenAdminPage(role)) {
    redirect("/login");
  }

  const context = sessionTenant(session);
  if (!context) redirect("/login");

  const defaultCurriculumId = await resolveCurriculumIdForUser(context);
  const rows = defaultCurriculumId
    ? await db
        .select()
        .from(concepts)
        .where(and(eq(concepts.curriculumId, defaultCurriculumId), eq(concepts.isActive, true)))
        .orderBy(asc(concepts.level), asc(concepts.orderIndex))
    : [];
  const userRows = isAdministratorRole(role)
    ? await db
        .select({
          id: users.id,
          username: users.username,
          role: users.role,
          displayName: users.displayName,
        })
        .from(users)
        .where(eq(users.schoolId, context.schoolId))
        .orderBy(asc(users.id))
    : [];

  return (
    <AdminClient
      concepts={rows}
      users={userRows}
      currentRole={role}
      currentUserId={currentUserId}
    />
  );
}
