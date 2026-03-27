"use client";

import { useState } from "react";
import { formatSlotFull } from "@/lib/utils";
import type { Slot, AnswerStatus, CreateResponseRequest } from "@/types";

interface ResponseFormProps {
  eventId: string;
  slots: Slot[];
  onSubmitted: (name: string) => void;
}

const STATUS_CONFIG: Record<
  AnswerStatus,
  { label: string; emoji: string; bg: string; border: string; text: string; selectedBg: string }
> = {
  best: {
    label: "◎",
    emoji: "◎",
    bg: "bg-white",
    border: "border-green-300",
    text: "text-green-700",
    selectedBg: "bg-green-500 border-green-500 text-white",
  },
  ok: {
    label: "○",
    emoji: "○",
    bg: "bg-white",
    border: "border-blue-300",
    text: "text-blue-700",
    selectedBg: "bg-blue-500 border-blue-500 text-white",
  },
  maybe: {
    label: "△",
    emoji: "△",
    bg: "bg-white",
    border: "border-yellow-300",
    text: "text-yellow-700",
    selectedBg: "bg-yellow-400 border-yellow-400 text-white",
  },
  no: {
    label: "×",
    emoji: "×",
    bg: "bg-white",
    border: "border-red-300",
    text: "text-red-700",
    selectedBg: "bg-red-400 border-red-400 text-white",
  },
};

const STATUSES: AnswerStatus[] = ["best", "ok", "maybe", "no"];

export default function ResponseForm({ eventId, slots, onSubmitted }: ResponseFormProps) {
  const [name, setName] = useState("");
  const [memo, setMemo] = useState("");
  const [answers, setAnswers] = useState<Record<string, AnswerStatus>>(() => {
    const init: Record<string, AnswerStatus> = {};
    slots.forEach((s) => { init[s.id] = "ok"; });
    return init;
  });
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setAnswer(slotId: string, status: AnswerStatus) {
    setAnswers((prev) => ({ ...prev, [slotId]: status }));
  }

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    setError("");
    setConfirming(true);
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const body: CreateResponseRequest = {
        name: name.trim(),
        memo: memo.trim() || undefined,
        answers: Object.entries(answers).map(([slotId, status]) => ({
          slotId,
          status,
        })),
      };

      const res = await fetch(`/api/events/${eventId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "エラーが発生しました");
        setConfirming(false);
        return;
      }

      onSubmitted(name.trim());
    } catch {
      setError("通信エラーが発生しました");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-4">
          <p className="text-sm font-semibold text-blue-800 mb-1">回答者名</p>
          <p className="text-gray-900">{name}</p>
          {memo && (
            <>
              <p className="text-sm font-semibold text-blue-800 mt-3 mb-1">メモ</p>
              <p className="text-gray-700 text-sm">{memo}</p>
            </>
          )}
        </div>

        <div className="space-y-2">
          {slots.map((slot) => {
            const status = answers[slot.id] ?? "ok";
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={slot.id} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <span className="text-sm text-gray-700">{formatSlotFull(slot.startAt, slot.endAt)}</span>
                <span className={`font-bold text-lg ${cfg.text}`}>{cfg.label}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setConfirming(false)}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            戻る
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "送信中…" : "この内容で送信する"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleConfirm} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          お名前 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="山田 太郎"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          required
        />
      </div>

      {/* Answer legend */}
      <div className="flex flex-wrap gap-2 bg-gray-50 rounded-xl p-3">
        {STATUSES.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <div key={s} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className={`font-bold ${cfg.text}`}>{cfg.label}</span>
              <span>
                {s === "best" ? "参加できる（最適）" :
                 s === "ok" ? "参加できる" :
                 s === "maybe" ? "微妙" : "参加できない"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Slots */}
      <div className="space-y-3">
        {slots.map((slot) => {
          const current = answers[slot.id] ?? "ok";
          return (
            <div key={slot.id} className="rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-medium text-gray-800 mb-3">
                {formatSlotFull(slot.startAt, slot.endAt)}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {STATUSES.map((status) => {
                  const cfg = STATUS_CONFIG[status];
                  const isSelected = current === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAnswer(slot.id, status)}
                      className={`rounded-lg border-2 py-2.5 text-xl font-bold transition-all active:scale-95 ${
                        isSelected
                          ? cfg.selectedBg
                          : `${cfg.bg} ${cfg.border} ${cfg.text} hover:opacity-80`
                      }`}
                    >
                      {cfg.emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Memo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ（任意）
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="補足があればどうぞ"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        確認画面へ
      </button>
    </form>
  );
}
