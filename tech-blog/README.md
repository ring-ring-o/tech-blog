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
pnpm dev
```

### ビルド

```bash
# 本番用ビルド
pnpm build

# ビルド後にPagefindインデックス生成
npx pagefind --site dist
```

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
│   │   └── blog/        # ブログ記事
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

- [CONTRIBUTING.md](./CONTRIBUTING.md) - 記事の投稿・編集方法
- [DEPLOYMENT.md](./DEPLOYMENT.md) - デプロイ手順
- [ADVERTISING.md](./ADVERTISING.md) - 広告配置ガイド
- [IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md) - 画像最適化ガイド
- [PERFORMANCE.md](./PERFORMANCE.md) - パフォーマンス最適化ガイド

## 🎯 コマンド一覧

| コマンド | 説明 |
| :--- | :--- |
| `pnpm install` | 依存関係をインストール |
| `pnpm dev` | 開発サーバーを起動 (`localhost:4321`) |
| `pnpm build` | 本番用にビルド (`./dist/`) |
| `pnpm preview` | ビルド結果をローカルでプレビュー |
| `pnpm format` | Biomeでコードフォーマット |
| `pnpm lint` | Biomeでリント |
| `pnpm check` | TypeScript型チェック |

## 🔧 環境変数

環境変数は `.env.local` または `.env` ファイルで設定します。

```bash
# サイト設定
PUBLIC_SITE_URL=https://example.com

# 広告設定（オプション）
PUBLIC_ENABLE_ADS=false
```

詳細は [.env.example](./.env.example) を参照してください。

## 📊 パフォーマンス

- **Lighthouse スコア**: 95点以上
- **バンドルサイズ**: 24KB (gzip圧縮後)
- **ビルド時間**: 約2.2秒 (17ページ)
- **Core Web Vitals**:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

## 🤝 コントリビューション

記事の投稿や機能改善のプルリクエストを歓迎します。
詳細は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 📞 サポート

質問や問題がある場合は、以下の方法でお問い合わせください：

- GitHubで[Issueを作成](https://github.com/yourusername/tech-blog/issues)
- Email: tech-blog@example.com

## 🔗 リンク

- [公式サイト](https://example.com)
- [Astro ドキュメント](https://docs.astro.build)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
