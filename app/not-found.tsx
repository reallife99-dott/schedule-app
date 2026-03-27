import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">ページが見つかりません</h2>
      <p className="text-gray-500 text-sm mb-6">URLをご確認ください</p>
      <Link
        href="/"
        className="inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        トップページへ
      </Link>
    </div>
  );
}
