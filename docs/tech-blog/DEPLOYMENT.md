# デプロイメントガイド

このドキュメントでは、Ring-a-Log を Cloudflare Pages にデプロイする手順を説明します。

## 📋 前提条件

- Git リポジトリが設定されている
- Node.js 20.x 以上がインストールされている
- pnpm 8.x 以上がインストールされている
- Cloudflare アカウントを持っている

## 🚀 デプロイ方法

### Cloudflare Pages でのデプロイ

#### 1. Cloudflare ダッシュボードからのデプロイ（推奨）

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com) にログイン
2. 左メニューから「Compute (Workers)」→「Workers & Pages」を選択
3. 「Create」→「Pages」タブをクリック
4. 「Connect to Git」で GitHub リポジトリを選択
5. ビルド設定を入力：

```
Framework preset: Astro
Build command: pnpm build
Build output directory: dist
```

6. 環境変数を設定（後述）
7. 「Save and Deploy」をクリック

#### 2. Wrangler CLI を使用したデプロイ

```bash
# Wrangler CLIのインストール
pnpm add -g wrangler

# Cloudflareにログイン
wrangler login

# ローカルでプレビュー
pnpm build && wrangler pages dev ./dist

# 本番環境へデプロイ
pnpm build && wrangler pages deploy ./dist
```

#### 3. 設定ファイル

##### wrangler.jsonc

プロジェクトルートに配置済み：

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "tech-blog",
  "compatibility_date": "2025-01-01",
  "pages_build_output_dir": "./dist"
}
```

##### public/\_headers

セキュリティヘッダーとキャッシュ設定：

```txt
# セキュリティヘッダー（全ページ）
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin

# Pagefind検索インデックス（長期キャッシュ）
/pagefind/*
  Cache-Control: public, max-age=31536000, immutable

# Astroビルドアセット（長期キャッシュ）
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

##### public/\_redirects

404 ページへのフォールバック：

```txt
/* /404.html 404
```

## 🔧 環境変数の設定

### 必須の環境変数

| 変数名            | 説明         | 例                           |
| ----------------- | ------------ | ---------------------------- |
| `PUBLIC_SITE_URL` | サイトの URL | `https://yourblog.pages.dev` |

### オプションの環境変数

| 変数名                  | 説明                | デフォルト |
| ----------------------- | ------------------- | ---------- |
| `PUBLIC_ENABLE_ADS`     | 広告表示の有効化    | `false`    |
| `PUBLIC_GA_TRACKING_ID` | Google Analytics ID | -          |

### Cloudflare での環境変数設定

1. Cloudflare ダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment variables」
3. 「Add variable」をクリック
4. 以下を追加：

```
PUBLIC_SITE_URL = https://your-domain.pages.dev
PUBLIC_ENABLE_ADS = false
```

5. Environment を選択（Production / Preview）
6. 「Save」をクリック

### ローカル環境変数

プロジェクトルートに `.env.local` ファイルを作成：

```bash
# .env.local
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_ENABLE_ADS=false
```

**注意**: `.env.local` は `.gitignore` に含まれており、Git 管理されません。

## 🔄 自動デプロイの設定

### GitHub 連携

1. Cloudflare Pages プロジェクトの「Settings」→「Builds & deployments」
2. 「Production branch」を設定（通常は `main` または `master`）
3. プルリクエストごとにプレビューデプロイが自動作成されます

### デプロイフック

特定のイベントで手動デプロイをトリガーする場合：

1. 「Settings」→「Builds & deployments」→「Deploy hooks」
2. 「Add deploy hook」をクリック
3. フック名を入力
4. URL をコピーして、以下のように使用：

```bash
curl -X POST https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...
```

## 🌐 カスタムドメインの設定

1. Cloudflare Pages プロジェクトの「Custom domains」タブ
2. 「Set up a custom domain」をクリック
3. ドメイン名を入力
4. DNS 設定を確認（Cloudflare DNS を使用している場合は自動設定）
5. SSL 証明書は自動的にプロビジョニングされます

## 🧪 デプロイ前チェックリスト

デプロイ前に以下を確認してください：

- [ ] ローカルで `pnpm build` が成功する
- [ ] TypeScript エラーがない（`pnpm check`）
- [ ] リンターエラーがない（`pnpm lint`）
- [ ] すべてのページが正しく生成される
- [ ] Pagefind インデックスが生成される
- [ ] 画像が最適化されている
- [ ] 環境変数が正しく設定されている
- [ ] `PUBLIC_SITE_URL` が本番 URL に設定されている
- [ ] `.env` ファイルが `.gitignore` に含まれている

## 📊 デプロイ後の確認

デプロイ後、以下を確認してください：

### 機能確認

- [ ] ホームページが正しく表示される
- [ ] 記事詳細ページが開ける
- [ ] タグフィルタリングが動作する
- [ ] 検索機能が動作する
- [ ] ダークモード切り替えが動作する
- [ ] モバイル表示が正しい

### パフォーマンス確認

```bash
# Lighthouse CLI でテスト
pnpm add -g lighthouse

lighthouse https://your-domain.pages.dev --view
```

目標スコア：

- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### SEO 確認

- [ ] `robots.txt` が正しく配信される
- [ ] `sitemap.xml` が生成される
- [ ] Open Graph タグが設定されている
- [ ] Twitter Card が設定されている
- [ ] 構造化データが正しい

## 🔍 トラブルシューティング

### ビルドエラー

**症状**: ビルドが失敗する

```
Error: Command "pnpm build" exited with 1
```

**解決策**:

1. ローカルで `pnpm build` を実行し、エラーを確認
2. Node.js バージョンを確認（20.x 以上必要）
3. `pnpm install` で依存関係を再インストール

### Pagefind が見つからない

**症状**: 検索機能が動作しない

**解決策**:

1. ビルドコマンドに `npx pagefind --site dist` が含まれているか確認
2. デプロイログで Pagefind 実行を確認
3. `/pagefind/` ディレクトリが dist に生成されているか確認

### 環境変数が反映されない

**症状**: 広告が表示されない、サイト URL が間違っている

**解決策**:

1. 環境変数名に `PUBLIC_` プレフィックスがあるか確認
2. デプロイ環境（Production/Preview）が正しいか確認
3. 設定後に再デプロイを実行

### CSS が読み込まれない

**症状**: スタイルが適用されない

**解決策**:

1. `astro.config.mjs` の `base` 設定を確認
2. Tailwind CSS ビルドが成功しているか確認
3. ブラウザのコンソールで CSS ファイルのパスを確認

### \_headers が適用されない

**症状**: セキュリティヘッダーが設定されていない

**解決策**:

1. `public/_headers` ファイルが存在するか確認
2. ファイル形式が正しいか確認（インデントはスペース 2 つ）
3. ビルド後に `dist/_headers` が生成されているか確認

## 📈 継続的改善

### パフォーマンス監視

Cloudflare Web Analytics を有効化：

1. Cloudflare ダッシュボードで「Analytics & Logs」→「Web Analytics」
2. 「Add a site」でサイトを追加
3. スニペットをサイトに追加（または自動有効化）

### エラー監視

Sentry などのエラー監視サービスを統合（オプション）：

```bash
pnpm add @sentry/astro
```

### アナリティクス

Google Analytics を設定（オプション）：

1. 環境変数に `PUBLIC_GA_TRACKING_ID` を追加
2. `src/layouts/BaseLayout.astro` でスクリプトを読み込み

## 🔗 関連リソース

- [Cloudflare Pages ドキュメント](https://developers.cloudflare.com/pages)
- [Astro + Cloudflare Pages ガイド](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/)
- [Astro デプロイガイド](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [Pagefind ドキュメント](https://pagefind.app/docs)
- [Wrangler CLI ドキュメント](https://developers.cloudflare.com/workers/wrangler/)
