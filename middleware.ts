import { auth } from "@/lib/auth";
import { makeBrowserSessionCookie } from "@/lib/browser-session-cookie";
import type { NextAuthRequest } from "next-auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const authMiddleware = auth((_request: NextAuthRequest, _event: NextFetchEvent) => NextResponse.next());

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const response = await authMiddleware(request, event);
  return makeBrowserSessionCookie(response instanceof Response ? response : NextResponse.next());
}

export const config = {
  matcher: ["/learn/:path*", "/progress/:path*"],
};
