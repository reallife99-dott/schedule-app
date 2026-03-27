"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Bookmark } from "lucide-react";
import type { CreateEventResponse } from "@/types";

interface CreatedModalProps {
  data: CreateEventResponse;
  onClose: () => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3">
      <span className="flex-1 text-sm text-gray-700 break-all font-mono">{text}</span>
      <button
        onClick={handleCopy}
        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors shadow-sm"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-500" />
            <span className="text-green-600">コピー済</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            {label}
          </>
        )}
      </button>
    </div>
  );
}

export default function CreatedModal({ data, onClose }: CreatedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 px-6 py-8 text-white text-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Check className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-xl font-bold">イベントを作成しました！</h2>
          <p className="mt-1 text-blue-100 text-sm">以下のURLを参加者に共有してください</p>
        </div>

        <div className="p-6 space-y-5">
          {/* Response URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">
                📤 回答URL（参加者に送るURL）
              </span>
            </div>
            <CopyButton text={data.eventUrl} label="コピー" />
          </div>

          {/* Admin URL */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bookmark className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-gray-800">
                🔐 管理URL（あなた専用・必ずブックマーク）
              </span>
            </div>
            <CopyButton text={data.adminUrl} label="コピー" />
            <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              ⚠️ この管理URLは再発行できません。必ずブックマークまたはメモしてください。
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href={data.adminUrl}
              className="flex-1 text-center rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              集計画面を開く
            </a>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              新しいイベントを作る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
