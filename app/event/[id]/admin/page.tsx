import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageClient from "./AdminPageClient";
import type { AdminEventData, AnswerStatus, SlotSummary } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function AdminPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">アクセス権限がありません</h2>
        <p className="text-gray-500 text-sm">管理URLからアクセスしてください</p>
      </div>
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
    notFound();
  }

  if (event.adminToken !== token) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">トークンが正しくありません</h2>
        <p className="text-gray-500 text-sm">正しい管理URLからアクセスしてください</p>
      </div>
    );
  }

  const slotSummaries: SlotSummary[] = event.slots.map((slot) => {
    const counts: Record<AnswerStatus, number> = { best: 0, ok: 0, maybe: 0, no: 0 };
    for (const response of event.responses) {
      const answer = response.answers.find((a) => a.slotId === slot.id);
      if (answer) counts[answer.status as AnswerStatus]++;
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

  const adminData: AdminEventData = {
    event: {
      id: event.id,
      title: event.title,
      description: event.description ?? null,
      deadline: event.deadline?.toISOString() ?? null,
      createdAt: event.createdAt.toISOString(),
      slots: event.slots.map((s) => ({
        id: s.id,
        eventId: s.eventId,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
      })),
      responses: event.responses.map((r) => ({
        id: r.id,
        eventId: r.eventId,
        name: r.name,
        memo: r.memo ?? null,
        createdAt: r.createdAt.toISOString(),
        answers: r.answers.map((a) => ({
          id: a.id,
          slotId: a.slotId,
          responseId: a.responseId,
          status: a.status as AnswerStatus,
        })),
      })),
    },
    responses: event.responses.map((r) => ({
      id: r.id,
      eventId: r.eventId,
      name: r.name,
      memo: r.memo ?? null,
      createdAt: r.createdAt.toISOString(),
      answers: r.answers.map((a) => ({
        id: a.id,
        slotId: a.slotId,
        responseId: a.responseId,
        status: a.status as AnswerStatus,
      })),
    })),
    slotSummaries,
  };

  return <AdminPageClient data={adminData} eventId={id} token={token} />;
}
