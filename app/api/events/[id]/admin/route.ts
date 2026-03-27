import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AnswerStatus, SlotSummary } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "管理トークンが必要です" },
        { status: 401 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        slots: { orderBy: { startAt: "asc" } },
        responses: {
          orderBy: { createdAt: "asc" },
          include: { answers: true },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    if (event.adminToken !== token) {
      return NextResponse.json(
        { error: "管理トークンが正しくありません" },
        { status: 403 }
      );
    }

    const slotSummaries: SlotSummary[] = event.slots.map((slot) => {
      const counts: Record<AnswerStatus, number> = {
        best: 0,
        ok: 0,
        maybe: 0,
        no: 0,
      };

      for (const response of event.responses) {
        const answer = response.answers.find((a) => a.slotId === slot.id);
        if (answer) {
          counts[answer.status as AnswerStatus]++;
        }
      }

      return {
        slot: {
          id: slot.id,
          eventId: slot.eventId,
          startAt: slot.startAt.toISOString(),
          endAt: slot.endAt.toISOString(),
        },
        counts,
        totalPositive: counts.best + counts.ok,
      };
    });

    const { adminToken: _, ...eventWithoutToken } = event;
    void _;

    return NextResponse.json({
      event: {
        ...eventWithoutToken,
        slots: event.slots.map((s) => ({
          ...s,
          startAt: s.startAt.toISOString(),
          endAt: s.endAt.toISOString(),
        })),
        responses: event.responses.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        })),
        createdAt: event.createdAt.toISOString(),
        deadline: event.deadline?.toISOString() ?? null,
      },
      responses: event.responses.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
      slotSummaries,
    });
  } catch (error) {
    console.error("Failed to get admin data:", error);
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}
