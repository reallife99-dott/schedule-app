"use client";

import { useState } from "react";
import EventForm from "@/components/EventForm";
import CreatedModal from "@/components/CreatedModal";
import type { CreateEventResponse } from "@/types";

export default function HomePage() {
  const [created, setCreated] = useState<CreateEventResponse | null>(null);

  function handleCreated(data: CreateEventResponse) {
    setCreated(data);
  }

  function handleClose() {
    setCreated(null);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新しいイベントを作成</h1>
        <p className="mt-1 text-gray-500 text-sm">
          候補日を選んでURLを発行するだけ。参加者はアカウント登録不要で回答できます。
        </p>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <EventForm onCreated={handleCreated} />
      </div>
      {created && <CreatedModal data={created} onClose={handleClose} />}
    </div>
  );
}
