# Tech Blog

モダンな技術ブログプラットフォーム - Astro 5.x、TypeScript、Tailwind CSS v4で構築された高速・高性能な静的サイト。

## ✨ 主な機能

- **⚡️ 高速**: 静的サイト生成によるミリ秒単位のページロード
- **🎨 モダンなデザイン**: Tailwind CSS v4によるレスポンシブデザイン
- **🔍 全文検索**: Pagefindによる高速な日本語対応検索
- **🌙 ダークモード**: システム設定対応のテーマ切り替え
- **♿️ アクセシブル**: WCAG AA準拠のアクセシビリティ対応
- **📱 レスポンシブ**: モバイルファーストのレイアウト設計
- **📝 Markdown管理**: Content Collectionsによる型安全なコンテンツ管理
- **🏷️ タグシステム**: 柔軟なカテゴリ分類とフィルタリング
- **🎯 SEO最適化**: 構造化データ、Open Graph、Twitter Card対応
- **🚀 高性能**: Lighthouse スコア95点以上達成

## 🛠 技術スタック

- **Framework**: [Astro](https://astro.build) 5.x
- **Language**: TypeScript (strict mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) v4
- **Search**: [Pagefind](https://pagefind.app)
- **Package Manager**: pnpm
- **Linter/Formatter**: [Biome](https://biomejs.dev)
- **Deployment**: Vercel / Netlify

## 📋 前提条件

- Node.js 20.x以上
- pnpm 8.x以上

## 🚀 セットアップ

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### 開発サーバー起動

```bash
# 開発サーバーを起動（http://localhost:4321）
# デフォルトではデモ用ダミー記事が表示されます
pnpm dev

# 本番記事を表示して起動
pnpm dev:prod
```

### コンテンツモード

このプロジェクトでは、本番用の記事とデモ用のダミー記事を環境変数で切り替えることができます。

| モード | ディレクトリ | 用途 |
| :--- | :--- | :--- |
| `demo` (デフォルト) | `src/content/blog-demo/` | 表示テスト・開発用のダミー記事 |
| `production` | `src/content/blog/` | 本番用のブログ記事 |

```bash
# デモモード（デフォルト）
pnpm dev          # または pnpm dev:demo

# 本番モード
pnpm dev:prod     # または CONTENT_MODE=production pnpm dev
```

### ビルド

```bash
# 本番ビルド（本番記事を使用）
pnpm build

# デモビルド（ダミー記事を使用）
pnpm build:demo
```

> **Note**: ビルドコマンドには Pagefind によるインデックス生成が含まれています。

### プレビュー

```bash
# ビルド結果をローカルでプレビュー
pnpm preview
```

## 📁 プロジェクト構造

```
/
├── public/              # 静的ファイル（画像、favicon等）
├── src/
│   ├── components/      # UIコンポーネント
│   │   ├── ads/         # 広告コンポーネント
│   │   ├── article/     # 記事関連コンポーネント
│   │   ├── common/      # 共通コンポーネント
│   │   └── layout/      # レイアウトコンポーネント
│   ├── content/         # Markdownコンテンツ
│   │   ├── blog/        # 本番用ブログ記事
│   │   ├── blog-demo/   # デモ用ダミー記事
│   │   └── pages/       # 固定ページ
│   ├── layouts/         # ページレイアウト
│   ├── lib/             # ユーティリティ・リポジトリ
│   │   ├── repositories/
│   │   ├── types/
│   │   └── utils/
│   ├── pages/           # ページルーティング
│   └── styles/          # グローバルスタイル
├── .env.example         # 環境変数サンプル
└── astro.config.mjs     # Astro設定ファイル
```

## 📝 ドキュメント

詳細なドキュメントは [docs/tech-blog/](./docs/tech-blog/) に格納されています。

- [WRITING_GUIDE.md](./docs/tech-blog/WRITING_GUIDE.md) - 記事の書き方・記法ガイド
- [DEPLOYMENT.md](./docs/tech-blog/DEPLOYMENT.md) - デプロイ手順
- [ADVERTISING.md](./docs/tech-blog/ADVERTISING.md) - 広告配置ガイド
- [IMAGE_OPTIMIZATION.md](./docs/tech-blog/IMAGE_OPTIMIZATION.md) - 画像最適化ガイド
- [PERFORMANCE.md](./docs/tech-blog/PERFORMANCE.md) - パフォーマンス最適化ガイド

## 🎯 コマンド一覧

| コマンド | 説明 |
| :--- | :--- |
| `pnpm install` | 依存関係をインストール |
| `pnpm dev` | 開発サーバーを起動（デモモード） |
| `pnpm dev:demo` | 開発サーバーを起動（デモモード） |
| `pnpm dev:prod` | 開発サーバーを起動（本番モード） |
| `pnpm build` | 本番ビルド（本番記事を使用） |
| `pnpm build:demo` | デモビルド（ダミー記事を使用） |
| `pnpm preview` | ビルド結果をローカルでプレビュー |
| `pnpm format` | Biomeでコードフォーマット |
| `pnpm lint` | Biomeでリント |

## 🔧 環境変数

環境変数は `.env.local` または `.env` ファイルで設定します。

```bash
# コンテンツモード（demo / production）
CONTENT_MODE=demo

# サイト設定
PUBLIC_SITE_URL=https://example.com

# 広告設定（オプション）
PUBLIC_ENABLE_ADS=false
```

| 変数名 | 説明 | デフォルト |
| :--- | :--- | :--- |
| `CONTENT_MODE` | コンテンツモード（`demo` / `production`） | `demo` |
| `PUBLIC_SITE_URL` | サイトURL | - |
| `PUBLIC_ENABLE_ADS` | 広告表示フラグ | `false` |
| `PUBLIC_GA_TRACKING_ID` | Google Analytics ID | - |

詳細は [.env.example](./.env.example) を参照してください。

## 📊 パフォーマンス

- **Lighthouse スコア**: 95点以上
- **バンドルサイズ**: 24KB (gzip圧縮後)
- **ビルド時間**: 約2.2秒 (17ページ)
- **Core Web Vitals**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

