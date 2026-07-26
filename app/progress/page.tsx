import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProgressClient from "./ProgressClient";

export default async function ProgressPage() {
  const session = await auth();
  if (!session) redirect("/login");
  return <ProgressClient userName={session.user?.name || "학생"} />;
}
