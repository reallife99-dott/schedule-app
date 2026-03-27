"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Copy, Check, RefreshCw } from "lucide-react";
import AdminView from "@/components/AdminView";
import type { AdminEventData } from "@/types";

interface Props {
  data: AdminEventData;
  eventId: string;
  token: string;
}

export default function AdminPageClient({ data, eventId, token }: Props) {
  const [copiedEvent, setCopiedEvent] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const eventUrl = `${appUrl}/event/${eventId}`;
  const adminUrl = `${appUrl}/event/${eventId}/admin?token=${token}`;

  async function copyEventUrl() {
    await navigator.clipboard.writeText(eventUrl);
    setCopiedEvent(true);
    setTimeout(() => setCopiedEvent(false), 2000);
  }

  async function copyAdminUrl() {
    await navigator.clipboard.writeText(adminUrl);
    setCopiedAdmin(true);
    setTimeout(() => setCopiedAdmin(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Event header */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data.event.title}</h1>
            {data.event.description && (
              <p className="mt-1 text-gray-500 text-sm">{data.event.description}</p>
            )}
            {data.event.deadline && (
              <p className="mt-1 text-xs text-amber-700">
                回答期限：{format(parseISO(data.event.deadline), "M月d日(E) HH:mm", { locale: ja })}
              </p>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="更新"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URL share panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-blue-800">URLを共有</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">📤 回答URL</span>
          <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <p className="text-xs text-gray-700 truncate font-mono">{eventUrl}</p>
          </div>
          <button
            onClick={copyEventUrl}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
          >
            {copiedEvent ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedEvent ? "済" : "コピー"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 shrink-0">🔐 管理URL</span>
          <div className="flex-1 min-w-0 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
            <p className="text-xs text-gray-700 truncate font-mono">{adminUrl}</p>
          </div>
          <button
            onClick={copyAdminUrl}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-600 text-white text-xs font-medium hover:bg-gray-700 transition-colors"
          >
            {copiedAdmin ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedAdmin ? "済" : "コピー"}
          </button>
        </div>
      </div>

      {/* Admin view */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <AdminView data={data} />
      </div>
    </div>
  );
}
