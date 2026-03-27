import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResponsePageClient from "./ResponsePageClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      deadline: true,
      slots: {
        orderBy: { startAt: "asc" },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const isExpired = event.deadline ? new Date() > event.deadline : false;

  return (
    <ResponsePageClient
      event={{
        id: event.id,
        title: event.title,
        description: event.description ?? null,
        deadline: event.deadline?.toISOString() ?? null,
        slots: event.slots.map((s) => ({
          id: s.id,
          eventId: s.eventId,
          startAt: s.startAt.toISOString(),
          endAt: s.endAt.toISOString(),
        })),
      }}
      isExpired={isExpired}
    />
  );
}
