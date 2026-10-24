import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db";
import { userCosmeticItems, users } from "@/lib/db/schema";
import { cosmeticItemKey, parseCosmeticItemKey } from "@/lib/cosmetics";
import { isAdministratorRole } from "@/lib/roles";
import { eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ id: string }> };

async function authorizedTarget(params: RouteContext["params"]) {
  const session = sessionTenant(await auth());
  if (!session) return { denied: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  if (!isAdministratorRole(session.role)) {
    return { denied: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }) };
  }

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return { denied: NextResponse.json({ error: "유효하지 않은 사용자입니다." }, { status: 400 }) };
  }
  const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return { denied: NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 }) };
  return { userId };
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const target = await authorizedTarget(params);
    if ("denied" in target) return target.denied;
    const items = await db.select({ itemKey: userCosmeticItems.itemKey })
      .from(userCosmeticItems).where(eq(userCosmeticItems.userId, target.userId));
    return NextResponse.json({ inventory: items.map((item) => item.itemKey) }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin cosmetic inventory failed", error);
    return NextResponse.json({ error: "아이템 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const target = await authorizedTarget(params);
    if ("denied" in target) return target.denied;
    const body: unknown = await req.json().catch(() => null);
    const itemKey = body && typeof body === "object" && "itemKey" in body ? body.itemKey : null;
    const parsed = typeof itemKey === "string" ? parseCosmeticItemKey(itemKey) : null;
    if (!parsed || itemKey !== cosmeticItemKey(parsed.family.key, parsed.characterType)) {
      return NextResponse.json({ error: "지급할 꾸미기 아이템이 올바르지 않습니다." }, { status: 400 });
    }

    // The user-item unique index makes repeated clicks and concurrent requests idempotent.
    const inserted = await db.insert(userCosmeticItems)
      .values({ userId: target.userId, itemKey, source: "admin" })
      .onConflictDoNothing()
      .returning({ itemKey: userCosmeticItems.itemKey });
    if (inserted.length === 0) {
      return NextResponse.json({ error: "이미 보유한 아이템입니다." }, { status: 409 });
    }
    return NextResponse.json({ itemKey: inserted[0].itemKey }, {
      status: 201,
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Admin cosmetic grant failed", error);
    return NextResponse.json({ error: "아이템을 지급하지 못했습니다." }, { status: 500 });
  }
}
