"use client";

import { useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus, Trash2, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { CreateEventRequest, CreateEventResponse } from "@/types";

interface SlotInput {
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string;
}

interface EventFormProps {
  onCreated: (data: CreateEventResponse) => void;
}

const TIME_OPTIONS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00",
];

function generateId() {
  return crypto.randomUUID();
}

export default function EventForm({ onCreated }: EventFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [slots, setSlots] = useState<(SlotInput & { id: string })[]>([]);
  const [calendarDate, setCalendarDate] = useState(startOfDay(new Date()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Calendar: show current month
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  function prevMonth() {
    setCalendarDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCalendarDate(new Date(year, month + 1, 1));
  }

  function toggleDate(dateStr: string) {
    const existing = slots.filter((s) => s.date === dateStr);
    if (existing.length > 0) {
      // remove all slots for this date
      setSlots((prev) => prev.filter((s) => s.date !== dateStr));
    } else {
      // add a default slot
      setSlots((prev) => [
        ...prev,
        { id: generateId(), date: dateStr, startTime: "10:00", endTime: "11:00" },
      ]);
    }
  }

  function addSlotForDate(dateStr: string) {
    setSlots((prev) => [
      ...prev,
      { id: generateId(), date: dateStr, startTime: "10:00", endTime: "11:00" },
    ]);
  }

  function updateSlot(id: string, field: "startTime" | "endTime", value: string) {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function removeSlot(id: string) {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  }

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, typeof slots>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  const selectedDates = new Set(Object.keys(slotsByDate));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }
    if (slots.length === 0) {
      setError("候補日を1つ以上選択してください");
      return;
    }

    setLoading(true);
    try {
      const body: CreateEventRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline || undefined,
        slots: slots.map((s) => ({
          startAt: `${s.date}T${s.startTime}:00`,
          endAt: `${s.date}T${s.endTime}:00`,
        })),
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "エラーが発生しました");
        return;
      }

      const data: CreateEventResponse = await res.json();
      onCreated(data);
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  const today = format(new Date(), "yyyy-MM-dd");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          イベント名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：プロジェクト定例ミーティング"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          メモ・説明（任意）
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="場所や補足情報など"
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
        />
      </div>

      {/* Calendar for slot selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Calendar className="inline w-4 h-4 mr-1" />
          候補日を選択 <span className="text-red-500">*</span>
          <span className="ml-2 text-xs text-gray-400 font-normal">日付をタップして追加</span>
        </label>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-gray-800">
              {format(calendarDate, "yyyy年M月", { locale: ja })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
            {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
              <div
                key={d}
                className={`text-center text-xs py-2 font-medium ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-500"
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: startDow }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = format(new Date(year, month, day), "yyyy-MM-dd");
              const isSelected = selectedDates.has(dateStr);
              const isPast = dateStr < today;
              const isToday = dateStr === today;
              const dow = new Date(year, month, day).getDay();

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => toggleDate(dateStr)}
                  className={`aspect-square flex items-center justify-center text-sm font-medium transition-colors ${
                    isPast
                      ? "text-gray-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : isToday
                      ? "border-2 border-blue-400 text-blue-600 hover:bg-blue-50"
                      : dow === 0
                      ? "text-red-400 hover:bg-red-50"
                      : dow === 6
                      ? "text-blue-400 hover:bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Slot time settings */}
      {Object.keys(slotsByDate).length > 0 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            <Clock className="inline w-4 h-4 mr-1" />
            時間帯の設定
          </label>
          {Object.entries(slotsByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([dateStr, dateSlots]) => (
              <div key={dateStr} className="border border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 text-sm">
                    {format(new Date(dateStr + "T00:00:00"), "M月d日(E)", { locale: ja })}
                  </span>
                  <button
                    type="button"
                    onClick={() => addSlotForDate(dateStr)}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    時間帯を追加
                  </button>
                </div>
                {dateSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center gap-2">
                    <select
                      value={slot.startTime}
                      onChange={(e) => updateSlot(slot.id, "startTime", e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span className="text-gray-400 text-sm">〜</span>
                    <select
                      value={slot.endTime}
                      onChange={(e) => updateSlot(slot.id, "endTime", e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}

      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          回答期限（任意）
        </label>
        <input
          type="datetime-local"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "作成中…" : "イベントを作成する"}
      </button>
    </form>
  );
}
