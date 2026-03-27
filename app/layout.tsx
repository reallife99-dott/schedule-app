import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "スケジュール調整",
  description: "URLを送るだけで日程調整が完了するシンプルなアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="font-bold text-gray-900 text-base">スケジュール調整</span>
            </a>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
