# スケジュール調整アプリ

URLを送るだけで日程調整が完了するシンプルなWebアプリです。

## セットアップ

### 1. Node.js のインストール

[https://nodejs.org/](https://nodejs.org/) からLTS版をインストールしてください。

### 2. 依存パッケージのインストール

```bash
cd schedule-app
npm install
```

### 3. 環境変数の設定

```bash
cp .env.example .env
```

`.env` の内容はデフォルトのままでOKです。

### 4. データベースのセットアップ

```bash
npm run db:generate
npm run db:push
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

---

## 使い方

### 主催者
1. トップページ (`/`) でイベント名と候補日を入力
2. 「イベントを作成する」をクリック
3. 発行された **回答URL** を参加者に共有
4. **管理URL** をブックマーク（再発行不可）
5. 管理画面で回答を集計、「この日に確定する」で確定メッセージをコピー

### 参加者
1. 回答URLを開く（アカウント不要）
2. 名前を入力
3. 各候補日に ◎/○/△/× で回答
4. 確認画面で「送信する」

---

## 技術スタック

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** + **SQLite**（本番環境はPostgresに変更可能）

## 画面構成

| パス | 内容 |
|------|------|
| `/` | イベント作成フォーム |
| `/event/[id]` | 参加者の回答画面 |
| `/event/[id]/admin?token=xxx` | 主催者の集計・管理画面 |

## 本番環境への移行（PostgreSQL）

1. `DATABASE_URL` をPostgreSQLの接続文字列に変更
2. `prisma/schema.prisma` の `provider = "sqlite"` を `provider = "postgresql"` に変更
3. `npm run db:migrate` を実行
