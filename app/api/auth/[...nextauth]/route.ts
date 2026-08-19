import { handlers } from "@/lib/auth";
import { makeBrowserSessionCookie } from "@/lib/browser-session-cookie";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return makeBrowserSessionCookie(await handlers.GET(request));
}

export async function POST(request: NextRequest) {
  return makeBrowserSessionCookie(await handlers.POST(request));
}
