"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import ResponseForm from "@/components/ResponseForm";
import type { Slot } from "@/types";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  slots: Slot[];
}

interface Props {
  event: EventData;
  isExpired: boolean;
}

export default function ResponsePageClient({ event, isExpired }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">回答を送信しました！</h2>
        <p className="text-gray-500 text-sm">{submittedName} さんの回答を受け付けました</p>
        <p className="mt-6 text-gray-400 text-sm">このページを閉じて大丈夫です</p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⏰</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">回答期限が過ぎています</h2>
        <p className="text-gray-500 text-sm">このイベントへの回答受付は終了しました</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">{event.title}</h1>
        {event.description && (
          <p className="mt-1.5 text-gray-600 text-sm whitespace-pre-wrap">{event.description}</p>
        )}
        {event.deadline && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 inline-block">
            回答期限：{format(parseISO(event.deadline), "M月d日(E) HH:mm", { locale: ja })}
          </p>
        )}
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <ResponseForm
          eventId={event.id}
          slots={event.slots}
          onSubmitted={(name) => {
            setSubmittedName(name);
            setSubmitted(true);
          }}
        />
      </div>
    </div>
  );
}
