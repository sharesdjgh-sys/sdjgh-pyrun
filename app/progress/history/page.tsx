import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export default async function LearningHistoryPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <HistoryClient userName={session.user?.name || "학생"} />;
}
