import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        deadline: true,
        createdAt: true,
        slots: {
          orderBy: { startAt: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "イベントが見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Failed to get event:", error);
    return NextResponse.json(
      { error: "イベントの取得に失敗しました" },
      { status: 500 }
    );
  }
}
