import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCurriculumUnits, resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";
import { isActiveCharacter } from "@/lib/cosmetics";
import { claimCosmeticReward, getCustomizationState, saveActiveCharacter, saveEquippedItem, syncAiRewardGrants, syncGroupRewardGrants } from "@/lib/customization";
import type { CosmeticSlot } from "@/types";

async function contextForRequest() {
  const context = sessionTenant(await auth());
  if (!context) return null;
  const curriculumId = await resolveCurriculumIdForUser(context);
  return curriculumId ? { ...context, curriculumId } : null;
}

export async function GET() {
  const context = await contextForRequest();
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const units = await getCurriculumUnits(context.curriculumId);
    await syncGroupRewardGrants(context.userId, context.curriculumId, units);
    await syncAiRewardGrants(context.userId, context.curriculumId);
    return NextResponse.json(await getCustomizationState(context.userId, context.curriculumId), {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Customization bootstrap failed", error);
    return NextResponse.json({ error: "꾸미기 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const context = await contextForRequest();
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const data = await req.json() as Record<string, unknown>;
    if (!Number.isInteger(data.grantId) || !isActiveCharacter(data.characterType)) {
      return NextResponse.json({ error: "보상 선택 정보가 올바르지 않습니다." }, { status: 400 });
    }
    const reward = await claimCosmeticReward(
      context.userId,
      context.curriculumId,
      data.grantId as number,
      data.characterType,
    );
    return NextResponse.json({ reward, state: await getCustomizationState(context.userId, context.curriculumId) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "보상을 받지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}

export async function PUT(req: NextRequest) {
  const context = await contextForRequest();
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const data = await req.json() as Record<string, unknown>;
    if (!isActiveCharacter(data.characterType)) {
      return NextResponse.json({ error: "캐릭터 정보가 올바르지 않습니다." }, { status: 400 });
    }
    if (data.action === "select-character") {
      await saveActiveCharacter(context.userId, data.characterType);
    } else if (data.action === "equip") {
      const slots: CosmeticSlot[] = ["head", "face", "body", "back"];
      if (!slots.includes(data.slot as CosmeticSlot) || (data.itemKey !== null && typeof data.itemKey !== "string")) {
        return NextResponse.json({ error: "장착 정보가 올바르지 않습니다." }, { status: 400 });
      }
      await saveEquippedItem(
        context.userId,
        data.characterType,
        data.slot as CosmeticSlot,
        data.itemKey as string | null,
      );
    } else {
      return NextResponse.json({ error: "꾸미기 요청이 올바르지 않습니다." }, { status: 400 });
    }
    return NextResponse.json(await getCustomizationState(context.userId, context.curriculumId));
  } catch (error) {
    const message = error instanceof Error ? error.message : "꾸미기 상태를 저장하지 못했습니다.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
