"use client";

import { useState } from "react";
import { formatSlotFull } from "@/lib/utils";
import { Check, Copy, X } from "lucide-react";
import type { AdminEventData, AnswerStatus, Response, Slot } from "@/types";

interface AdminViewProps {
  data: AdminEventData;
}

const STATUS_LABEL: Record<AnswerStatus, string> = {
  best: "◎",
  ok: "○",
  maybe: "△",
  no: "×",
};

const STATUS_COLOR: Record<AnswerStatus, string> = {
  best: "text-green-600 font-bold",
  ok: "text-blue-600 font-bold",
  maybe: "text-yellow-600 font-bold",
  no: "text-red-400",
};

function getAnswerForSlot(response: Response, slotId: string): AnswerStatus | null {
  const answer = response.answers.find((a) => a.slotId === slotId);
  return (answer?.status as AnswerStatus) ?? null;
}

interface ConfirmModalProps {
  slot: Slot;
  eventTitle: string;
  onClose: () => void;
}

function ConfirmModal({ slot, eventTitle, onClose }: ConfirmModalProps) {
  const [copied, setCopied] = useState(false);
  const message = `【日程確定のご連絡】\n\n${eventTitle}\n\n日時：${formatSlotFull(slot.startAt, slot.endAt)}\n\nご参加をお待ちしております。`;

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">日程確定メッセージ</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-5">
          <pre className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
            {message}
          </pre>
          <button
            onClick={handleCopy}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                コピーしました
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                メッセージをコピー
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminView({ data }: AdminViewProps) {
  const { event, responses, slotSummaries } = data;
  const [confirmSlot, setConfirmSlot] = useState<Slot | null>(null);

  const maxPositive = Math.max(...slotSummaries.map((s) => s.totalPositive), 0);

  return (
    <div className="space-y-6">
      {/* Summary badges */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">候補日サマリー</h2>
        <div className="space-y-2">
          {slotSummaries.map((summary) => {
            const isBest = summary.totalPositive === maxPositive && maxPositive > 0;
            return (
              <div
                key={summary.slot.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isBest ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {isBest && (
                      <span className="inline-block mb-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        ★ 最有力
                      </span>
                    )}
                    <p className="text-sm font-medium text-gray-800">
                      {formatSlotFull(summary.slot.startAt, summary.slot.endAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex gap-1.5 text-sm">
                      <span className="text-green-600 font-bold">◎{summary.counts.best}</span>
                      <span className="text-blue-600 font-bold">○{summary.counts.ok}</span>
                      <span className="text-yellow-600 font-bold">△{summary.counts.maybe}</span>
                      <span className="text-red-400">×{summary.counts.no}</span>
                    </div>
                    <div className="bg-blue-600 text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
                      {summary.totalPositive}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setConfirmSlot(summary.slot)}
                  className="mt-3 w-full rounded-lg border border-gray-200 bg-white py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  この日に確定する
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Response grid */}
      {responses.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            回答一覧（{responses.length}名）
          </h2>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-600 whitespace-nowrap">名前</th>
                  {event.slots.map((slot) => (
                    <th key={slot.id} className="px-2 py-2 font-medium text-gray-600 text-center whitespace-nowrap min-w-[80px]">
                      <div>{formatSlotFull(slot.startAt, slot.endAt).split(" ")[0]}</div>
                      <div className="text-xs text-gray-400 font-normal">
                        {formatSlotFull(slot.startAt, slot.endAt).split(" ").slice(1).join(" ")}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {responses.map((response) => (
                  <tr key={response.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2.5 pr-4 font-medium text-gray-900 whitespace-nowrap">
                      {response.name}
                      {response.memo && (
                        <span className="ml-2 text-xs text-gray-400">({response.memo})</span>
                      )}
                    </td>
                    {event.slots.map((slot) => {
                      const status = getAnswerForSlot(response, slot.id);
                      return (
                        <td key={slot.id} className="px-2 py-2.5 text-center">
                          {status ? (
                            <span className={`text-lg ${STATUS_COLOR[status]}`}>
                              {STATUS_LABEL[status]}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-2">📭</p>
          <p>まだ回答がありません</p>
          <p className="text-sm mt-1">回答URLを参加者に共有してください</p>
        </div>
      )}

      {confirmSlot && (
        <ConfirmModal
          slot={confirmSlot}
          eventTitle={event.title}
          onClose={() => setConfirmSlot(null)}
        />
      )}
    </div>
  );
}
