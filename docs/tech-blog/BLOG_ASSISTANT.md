# Blog Assistant - AI 記事作成補助ツール

Claude Agent SDK を使用した技術ブログ記事の作成補助ツールです。AI による校閲・下書き生成機能と、リアルタイムプレビュー機能を提供します。

## 📋 目次

- [コンセプト](#コンセプト)
- [機能一覧](#機能一覧)
- [セットアップ](#セットアップ)
- [使い方](#使い方)
- [アーキテクチャ](#アーキテクチャ)
- [API リファレンス](#api-リファレンス)
- [カスタマイズ](#カスタマイズ)
- [トラブルシューティング](#トラブルシューティング)

## コンセプト

### なぜ Blog Assistant？

技術ブログの執筆には多くの手間がかかります：

- **校正作業**: 誤字脱字、文法ミス、表記ゆれのチェック
- **SEO 対策**: タイトル・説明文の最適化、見出し構造の確認
- **フォーマット**: Frontmatter の設定、Markdown 記法の確認
- **プレビュー**: 実際のサイトでの表示確認

Blog Assistant は、これらの作業を AI がサポートすることで、執筆者が**コンテンツの質**に集中できる環境を提供します。

### 設計思想

1. **非破壊的**: AI は提案のみを行い、最終的な判断は執筆者が行う
2. **リアルタイム**: 編集中にすぐにフィードバックを得られる
3. **統合的**: Astro ブログとシームレスに連携
4. **拡張可能**: MCP ツールによる機能拡張が可能

## 機能一覧

### 1. AI 校閲

Claude AI が記事を多角的にチェックします：

| チェック項目       | 内容                                         |
| ------------------ | -------------------------------------------- |
| 文法・表記         | 誤字脱字、文法ミス、表記ゆれの検出           |
| 読みやすさ         | 文の長さ、段落構成、論理の流れ               |
| 技術的正確性       | 技術用語の正しさ、コード例の妥当性           |
| SEO 最適化         | タイトル・説明文の長さ、見出し構造           |
| Frontmatter 検証   | 必須フィールドの確認、値の妥当性チェック     |

校閲結果は具体的な修正案とともに表示され、どこをどう直すべきかが明確になります。

### 2. 下書き生成

トピックを入力するだけで、記事の下書きを自動生成します：

- **Frontmatter 自動生成**: タイトル、説明、タグを適切に設定
- **構造化された本文**: 見出し、段落、リストを適切に配置
- **コードサンプル**: 必要に応じてコード例を含める
- **カスタマイズ可能**: 長さ、トーン、コード有無を指定可能

### 3. リアルタイムプレビュー

2 種類のプレビューモードを提供：

| モード           | 説明                                           |
| ---------------- | ---------------------------------------------- |
| Markdown         | 編集中の Markdown をリアルタイムでレンダリング |
| Astro プレビュー | 実際の Astro サイト表示を iframe で確認        |

### 4. 記事保存

ワンクリックで記事を保存：

- `src/content/blog/` に Markdown ファイルを出力
- ファイル名は `YYYY-MM-DD-slug.md` 形式で自動生成
- 保存後すぐに Astro プレビューで確認可能

## セットアップ

### 前提条件

- Node.js 20.x 以上
- pnpm 8.x 以上
- Claude Code がインストール済み（Claude Agent SDK のランタイム）

### インストール

```bash
cd tools/blog-assistant
pnpm install
```

### 起動

```bash
# Blog Assistant を起動（サーバー + クライアント）
pnpm dev

# サーバーのみ起動
pnpm dev:server

# クライアントのみ起動
pnpm dev:client
```

### Astro 連携（オプション）

Astro プレビュー機能を使用する場合：

```bash
# 別ターミナルで Astro を起動
cd /workspace
CONTENT_MODE=production pnpm dev
```

## 使い方

### 基本的なワークフロー

1. **Blog Assistant を開く**: http://localhost:5173 にアクセス
2. **Frontmatter を入力**: タイトル、説明、タグ、公開日を設定
3. **記事を執筆**: 左側のエディタで Markdown を記述
4. **プレビュー確認**: 右側でリアルタイムプレビューを確認
5. **AI 校閲**: 「AI 校閲」ボタンで記事をチェック
6. **保存**: 「保存」ボタンでファイルを出力

### AI 校閲の使い方

1. 記事を入力した状態で「AI 校閲」ボタンをクリック
2. 校閲結果が「校閲結果」タブにストリーミング表示される
3. 提案された修正を確認し、必要に応じてエディタで修正
4. 再度校閲を実行して確認

### 下書き生成の使い方

1. トピック入力欄にテーマを入力（例：「React Hooks の基本」）
2. 「下書き生成」ボタンをクリック
3. 生成結果が「生成結果」タブにストリーミング表示される
4. 「エディタに適用」ボタンで編集可能な状態にする
5. 必要に応じて内容を編集

### Astro プレビューの使い方

1. Astro dev server を起動しておく
2. 記事を保存する
3. 「Astro」タブで実際のサイト表示を確認
4. 「新しいタブで開く」リンクで別ウィンドウでも確認可能

## アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────────────────────┐
│                 クライアント (React + Vite)              │
│                   http://localhost:5173                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Editor    │  │   Preview   │  │  AI Panel   │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/SSE
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 サーバー (Hono + Node.js)                │
│                   http://localhost:3001                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Claude Agent SDK                    │   │
│  │  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │  query()    │  │  Streaming Response     │  │   │
│  │  └─────────────┘  └─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │ File I/O
                         ▼
┌─────────────────────────────────────────────────────────┐
│              /workspace/src/content/blog/               │
│                    (Markdown Files)                      │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                Astro Dev Server                          │
│                http://localhost:4321                     │
└─────────────────────────────────────────────────────────┘
```

### ディレクトリ構造

```
tools/blog-assistant/
├── package.json
├── tsconfig.json
├── .env.example
│
├── server/                      # バックエンド
│   ├── index.ts                 # エントリーポイント
│   ├── app.ts                   # Hono アプリ設定
│   ├── routes/
│   │   ├── articles.ts          # 記事 CRUD API
│   │   ├── review.ts            # AI 校閲 (SSE)
│   │   ├── generate.ts          # 下書き生成 (SSE)
│   │   └── preview.ts           # プレビュー URL
│   ├── services/
│   │   ├── claude-agent.ts      # Claude Agent SDK 統合
│   │   └── article-service.ts   # 記事管理
│   └── types/
│       └── index.ts
│
├── client/                      # フロントエンド
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── Editor.tsx
│       │   ├── FrontmatterForm.tsx
│       │   ├── Preview.tsx
│       │   ├── AstroPreview.tsx
│       │   ├── ReviewPanel.tsx
│       │   └── GeneratePanel.tsx
│       ├── hooks/
│       │   ├── useAIReview.ts
│       │   ├── useAIGenerate.ts
│       │   └── useArticle.ts
│       └── styles/
│           └── globals.css
│
└── shared/                      # 共有コード
    └── types.ts
```

## API リファレンス

### POST /api/review

AI 校閲を実行します。SSE でストリーミングレスポンスを返します。

**リクエスト:**

```json
{
  "content": "記事本文（Markdown）",
  "frontmatter": {
    "title": "記事タイトル",
    "description": "記事の説明",
    "publishedAt": "2025-01-01",
    "tags": ["TypeScript", "React"]
  }
}
```

**レスポンス (SSE):**

```
event: message
data: {"type": "text", "content": "校閲結果のテキスト..."}

event: done
data: {"type": "result"}
```

### POST /api/generate

下書きを生成します。SSE でストリーミングレスポンスを返します。

**リクエスト:**

```json
{
  "topic": "React Hooks の基本的な使い方",
  "requirements": {
    "targetLength": "medium",
    "tone": "professional",
    "includeCode": true
  }
}
```

**レスポンス (SSE):**

```
event: message
data: {"type": "text", "content": "生成されたMarkdown..."}

event: done
data: {"type": "result"}
```

### GET /api/articles

記事一覧を取得します。

**レスポンス:**

```json
[
  {
    "id": "2025-01-01-example.md",
    "slug": "2025-01-01-example",
    "filename": "2025-01-01-example.md",
    "frontmatter": {
      "title": "記事タイトル",
      "description": "記事の説明",
      "publishedAt": "2025-01-01",
      "tags": ["TypeScript"]
    },
    "content": "記事本文..."
  }
]
```

### POST /api/articles

記事を保存します。

**リクエスト:**

```json
{
  "content": "記事本文（Markdown）",
  "frontmatter": {
    "title": "記事タイトル",
    "description": "記事の説明",
    "publishedAt": "2025-01-01",
    "tags": ["TypeScript"]
  }
}
```

**レスポンス:**

```json
{
  "filename": "2025-01-01-記事タイトル.md",
  "previewUrl": "http://localhost:4321/posts/2025-01-01-記事タイトル"
}
```

### DELETE /api/articles/:id

記事を削除します。

**レスポンス:**

```json
{
  "success": true
}
```

## カスタマイズ

### 校閲プロンプトのカスタマイズ

`server/services/claude-agent.ts` の `reviewArticle` 関数でプロンプトを編集できます：

```typescript
const prompt = `
以下のブログ記事を校閲してください。

## 校閲ポイント
1. 文法・表記の誤り
2. 文章の読みやすさ
3. 技術的な正確性
4. SEO最適化の観点
5. 具体的な修正提案

// カスタムチェック項目を追加
6. コードブロックのシンタックス確認
7. 外部リンクの妥当性
`
```

### 生成オプションの追加

`shared/types.ts` の `GenerateRequest` を拡張：

```typescript
export interface GenerateRequest {
  topic: string
  requirements?: {
    targetLength?: 'short' | 'medium' | 'long'
    tone?: 'casual' | 'professional'
    includeCode?: boolean
    // カスタムオプションを追加
    targetAudience?: 'beginner' | 'intermediate' | 'advanced'
    focusArea?: string
  }
}
```

### UI テーマの変更

`client/src/styles/globals.css` でスタイルをカスタマイズ：

```css
/* プライマリカラーの変更 */
.bg-blue-600 {
  @apply bg-indigo-600;
}

/* エディタのフォントサイズ */
.editor-textarea {
  font-size: 14px;
  line-height: 1.8;
}
```

## トラブルシューティング

### よくある問題

#### サーバーが起動しない

```
Error: Cannot find module '@anthropic-ai/claude-agent-sdk'
```

**解決策:** Claude Code がインストールされているか確認

```bash
claude --version
```

#### AI 機能が動作しない

```
Error: Authentication failed
```

**解決策:** Claude Code にログイン

```bash
claude login
```

#### Astro プレビューが表示されない

**解決策:**

1. Astro dev server が起動しているか確認
2. `CONTENT_MODE=production` で起動しているか確認
3. 記事が保存されているか確認

#### ファイルが保存されない

**解決策:**

1. `src/content/blog/` ディレクトリが存在するか確認
2. 書き込み権限があるか確認

### デバッグ方法

サーバーログを確認：

```bash
# 詳細ログを有効化
DEBUG=* pnpm dev:server
```

ブラウザの開発者ツールで SSE 通信を確認：

1. Network タブを開く
2. `/api/review` または `/api/generate` リクエストを選択
3. EventStream タブでメッセージを確認

## 関連リソース

- [Claude Agent SDK ドキュメント](https://platform.claude.com/docs/en/agent-sdk/)
- [Hono ドキュメント](https://hono.dev/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [記事の書き方ガイド](./WRITING_GUIDE.md)
