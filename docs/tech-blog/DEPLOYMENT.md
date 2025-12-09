# デプロイメントガイド

このドキュメントでは、Tech Blogを本番環境にデプロイする手順を説明します。

## 📋 前提条件

- Git リポジトリが設定されている
- Node.js 20.x以上がインストールされている
- pnpm 8.x以上がインストールされている
- Vercel または Netlify のアカウントを持っている

## 🚀 デプロイ方法

### Vercel でのデプロイ

#### 1. Vercel CLI を使用したデプロイ

```bash
# Vercel CLIのインストール
pnpm add -g vercel

# プロジェクトルートでログイン
vercel login

# 初回デプロイ
vercel

# 本番環境へデプロイ
vercel --prod
```

#### 2. Vercel ダッシュボードからのデプロイ

1. [Vercel](https://vercel.com) にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定を入力：

```
Framework Preset: Astro
Build Command: pnpm build && npx pagefind --site dist
Output Directory: dist
Install Command: pnpm install
```

5. 環境変数を設定（後述）
6. 「Deploy」をクリック

#### 3. Vercel 設定ファイル

プロジェクトルートに `vercel.json` を配置（オプション）：

```json
{
  "buildCommand": "pnpm build && npx pagefind --site dist",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "devCommand": "pnpm dev",
  "framework": "astro",
  "regions": ["hnd1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/pagefind/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify でのデプロイ

#### 1. Netlify CLI を使用したデプロイ

```bash
# Netlify CLIのインストール
pnpm add -g netlify-cli

# ログイン
netlify login

# 初回デプロイ
netlify init

# 本番環境へデプロイ
netlify deploy --prod
```

#### 2. Netlify ダッシュボードからのデプロイ

1. [Netlify](https://www.netlify.com) にログイン
2. 「Add new site」→「Import an existing project」
3. GitHubリポジトリを選択
4. ビルド設定を入力：

```
Build command: pnpm build && npx pagefind --site dist
Publish directory: dist
```

5. 環境変数を設定（後述）
6. 「Deploy site」をクリック

#### 3. Netlify 設定ファイル

プロジェクトルートに `netlify.toml` を配置：

```toml
[build]
  command = "pnpm build && npx pagefind --site dist"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--version"

[[redirects]]
  from = "/*"
  to = "/404"
  status = 404

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/pagefind/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

## 🔧 環境変数の設定

### 必須の環境変数

| 変数名 | 説明 | 例 |
|--------|------|-----|
| `PUBLIC_SITE_URL` | サイトのURL | `https://yourblog.com` |

### オプションの環境変数

| 変数名 | 説明 | デフォルト |
|--------|------|-----------|
| `PUBLIC_ENABLE_ADS` | 広告表示の有効化 | `false` |
| `PUBLIC_GA_TRACKING_ID` | Google Analytics ID | - |

### Vercel での環境変数設定

1. Vercelプロジェクトダッシュボードを開く
2. 「Settings」→「Environment Variables」
3. 以下を追加：

```
PUBLIC_SITE_URL = https://your-domain.vercel.app
PUBLIC_ENABLE_ADS = false
```

4. Environment を選択（Production / Preview / Development）
5. 「Save」をクリック

### Netlify での環境変数設定

1. Netlifyサイトダッシュボードを開く
2. 「Site settings」→「Build & deploy」→「Environment」
3. 「Edit variables」をクリック
4. 以下を追加：

```
PUBLIC_SITE_URL = https://your-domain.netlify.app
PUBLIC_ENABLE_ADS = false
```

5. 「Save」をクリック

### ローカル環境変数

プロジェクトルートに `.env.local` ファイルを作成：

```bash
# .env.local
PUBLIC_SITE_URL=http://localhost:4321
PUBLIC_ENABLE_ADS=false
```

**注意**: `.env.local` は `.gitignore` に含まれており、Git管理されません。

## 🔄 自動デプロイの設定

### GitHub 連携

#### Vercel

1. Vercelプロジェクトの「Settings」→「Git」
2. GitHub リポジトリと連携
3. 「Production Branch」を設定（通常は `main` または `master`）
4. プルリクエストごとにプレビューデプロイが自動作成されます

#### Netlify

1. Netlifyサイトの「Site settings」→「Build & deploy」→「Continuous Deployment」
2. 「Branch deploys」で本番ブランチを設定
3. 「Deploy contexts」でプレビュー設定を調整

### デプロイフック

特定のイベントで手動デプロイをトリガーする場合：

#### Vercel Deploy Hook

1. 「Settings」→「Git」→「Deploy Hooks」
2. フック名とブランチを入力
3. URLをコピーして、以下のように使用：

```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/...
```

#### Netlify Deploy Hook

1. 「Site settings」→「Build & deploy」→「Build hooks」
2. 「Add build hook」をクリック
3. フック名とブランチを入力
4. URLをコピーして使用：

```bash
curl -X POST -d {} https://api.netlify.com/build_hooks/...
```

## 🧪 デプロイ前チェックリスト

デプロイ前に以下を確認してください：

- [ ] ローカルで `pnpm build` が成功する
- [ ] TypeScript エラーがない（`pnpm check`）
- [ ] リンターエラーがない（`pnpm lint`）
- [ ] すべてのページが正しく生成される
- [ ] Pagefind インデックスが生成される
- [ ] 画像が最適化されている
- [ ] 環境変数が正しく設定されている
- [ ] `PUBLIC_SITE_URL` が本番URLに設定されている
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

lighthouse https://your-domain.com --view
```

目標スコア：
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+

### SEO確認

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
2. Node.js バージョンを確認（20.x以上必要）
3. `pnpm install` で依存関係を再インストール

### Pagefind が見つからない

**症状**: 検索機能が動作しない

**解決策**:
1. ビルドコマンドに `npx pagefind --site dist` が含まれているか確認
2. デプロイログで Pagefind 実行を確認
3. `/pagefind/` ディレクトリが dist に生成されているか確認

### 環境変数が反映されない

**症状**: 広告が表示されない、サイトURLが間違っている

**解決策**:
1. 環境変数名に `PUBLIC_` プレフィックスがあるか確認
2. デプロイ環境（Production/Preview）が正しいか確認
3. 設定後に再デプロイを実行

### CSS が読み込まれない

**症状**: スタイルが適用されない

**解決策**:
1. `astro.config.mjs` の `base` 設定を確認
2. Tailwind CSS ビルドが成功しているか確認
3. ブラウザのコンソールでCSSファイルのパスを確認

## 📈 継続的改善

### パフォーマンス監視

定期的にLighthouse監査を実行：

```bash
# package.json にスクリプト追加
{
  "scripts": {
    "lighthouse": "lighthouse https://your-domain.com --output html --output-path ./lighthouse-report.html"
  }
}
```

### エラー監視

Sentryなどのエラー監視サービスを統合（オプション）：

```bash
pnpm add @sentry/astro
```

### アナリティクス

Google Analyticsを設定（オプション）：

1. 環境変数に `PUBLIC_GA_TRACKING_ID` を追加
2. `src/layouts/BaseLayout.astro` でスクリプトを読み込み

## 🔗 関連リソース

- [Vercel ドキュメント](https://vercel.com/docs)
- [Netlify ドキュメント](https://docs.netlify.com)
- [Astro デプロイガイド](https://docs.astro.build/en/guides/deploy)
- [Pagefind ドキュメント](https://pagefind.app/docs)

## 📞 サポート

デプロイに関する質問は以下へ：

- GitHub Issues: [yourusername/tech-blog/issues](https://github.com/yourusername/tech-blog/issues)
- Email: tech-blog@example.com
