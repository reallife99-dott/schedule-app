import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/utils";
import type { CreateEventRequest, CreateEventResponse } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: CreateEventRequest = await req.json();

    if (!body.title?.trim()) {
      return NextResponse.json(
        { error: "タイトルは必須です" },
        { status: 400 }
      );
    }

    if (!body.slots || body.slots.length === 0) {
      return NextResponse.json(
        { error: "候補日を1つ以上選択してください" },
        { status: 400 }
      );
    }

    const event = await prisma.event.create({
      data: {
        title: body.title.trim(),
        description: body.description?.trim() || null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        slots: {
          create: body.slots.map((slot) => ({
            startAt: new Date(slot.startAt),
            endAt: new Date(slot.endAt),
          })),
        },
      },
    });

    const appUrl = getAppUrl();
    const response: CreateEventResponse = {
      eventId: event.id,
      adminToken: event.adminToken,
      eventUrl: `${appUrl}/event/${event.id}`,
      adminUrl: `${appUrl}/event/${event.id}/admin?token=${event.adminToken}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "イベントの作成に失敗しました" },
      { status: 500 }
    );
  }
}
