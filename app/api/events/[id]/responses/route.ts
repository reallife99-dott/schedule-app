import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CreateResponseRequest } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body: CreateResponseRequest = await req.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: "名前は必須です" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { slots: true },
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    if (event.deadline && new Date() > event.deadline) {
      return NextResponse.json(
        { error: "回答期限が過ぎています" },
        { status: 400 }
      );
    }

    const validSlotIds = new Set(event.slots.map((s) => s.id));
    const invalidSlot = body.answers?.find((a) => !validSlotIds.has(a.slotId));
    if (invalidSlot) {
      return NextResponse.json(
        { error: "無効な候補日が含まれています" },
        { status: 400 }
      );
    }

    const validStatuses = ["best", "ok", "maybe", "no"];
    const invalidStatus = body.answers?.find(
      (a) => !validStatuses.includes(a.status)
    );
    if (invalidStatus) {
      return NextResponse.json(
        { error: "無効な回答ステータスが含まれています" },
        { status: 400 }
      );
    }

    const response = await prisma.response.create({
      data: {
        eventId,
        name: body.name.trim(),
        memo: body.memo?.trim() || null,
        answers: {
          create: (body.answers ?? []).map((a) => ({
            slotId: a.slotId,
            status: a.status,
          })),
        },
      },
      include: {
        answers: true,
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create response:", error);
    return NextResponse.json(
      { error: "回答の送信に失敗しました" },
      { status: 500 }
    );
  }
}
