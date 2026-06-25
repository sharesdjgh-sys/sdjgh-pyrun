import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/index";
import { concepts } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || (role !== "teacher" && role !== "admin")) {
    redirect("/login");
  }

  const rows = await db.select().from(concepts).orderBy(asc(concepts.orderIndex));
  return <AdminClient concepts={rows} />;
}
