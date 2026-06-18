import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LearnClient from "./LearnClient";

export default async function LearnPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <LearnClient userName={session.user?.name || "학생"} />;
}
