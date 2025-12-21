# Blog Assistant - AI 記事作成補助ツール

Claude AI を活用した技術ブログ記事の作成補助ツールです。校閲・下書き生成機能、カスタマイズ可能なスキルシステム、画像の自動最適化、リアルタイムプレビュー機能を提供します。

**ツールパス**: `tools/blog-assistant/`

## 目次

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
4. **拡張可能**: カスタムスキルによる機能拡張が可能

## 機能一覧

### 1. Notionライクなエディタ

**スラッシュコマンド**: エディタで `/` を入力するとコマンドメニューが表示されます

| コマンド | 説明 |
|----------|------|
| AI校閲 | 記事全体の校閲を実行 |
| 下書き生成 | トピックから新しい記事を生成 |
| スキル実行 | 登録済みのスキルを実行 |
| 画像挿入 | 画像ファイルを選択して挿入 |

**テキスト選択ポップアップ**: テキストを選択すると、選択範囲に適用可能なAIスキルがポップアップ表示されます

- 内容を補完
- セクション改善
- カスタムスキル

### 2. 画像アップロード・最適化

- クリップボードからの貼り付け（Ctrl+V / Cmd+V）
- ドラッグ&ドロップ
- ファイル選択ダイアログ
- 自動でWebP形式に変換・最適化
  - 最大幅: 1200px
  - 品質: 85%
- Markdown記法で自動挿入

### 3. AI 校閲

Claude AI が記事を多角的にチェックします：

| チェック項目 | 内容 |
|-------------|------|
| 文法・表記 | 誤字脱字、文法ミス、表記ゆれの検出 |
| 読みやすさ | 文の長さ、段落構成、論理の流れ |
| 技術的正確性 | 技術用語の正しさ、コード例の妥当性 |
| SEO 最適化 | タイトル・説明文の長さ、見出し構造 |
| Frontmatter 検証 | 必須フィールドの確認、値の妥当性チェック |

校閲結果は具体的な修正案とともに表示され、どこをどう直すべきかが明確になります。

### 4. 下書き生成

トピックを入力するだけで、記事の下書きを自動生成します：

- **Frontmatter 自動生成**: タイトル、説明、タグを適切に設定
- **構造化された本文**: 見出し、段落、リストを適切に配置
- **コードサンプル**: 必要に応じてコード例を含める

### 5. スキルシステム

5つのビルトインスキルを提供：

| スキル名 | カテゴリ | 説明 |
|----------|----------|------|
| 校閲 | review | 記事全体の誤りや改善点を指摘 |
| 下書き生成 | generate | トピックから記事を自動生成 |
| 続きを書く | assist | 既存コンテンツから続きを執筆 |
| 内容を補完 | assist | 選択箇所をより詳しく説明 |
| セクション改善 | assist | 選択セクションを読みやすく改善 |

**利用可能な変数:**
- `{{content}}`: 記事本文
- `{{title}}`: タイトル
- `{{description}}`: 説明
- `{{tags}}`: タグ一覧
- `{{selection}}`: 選択テキスト
- `{{today}}`: 今日の日付

カスタムスキルを作成することで、独自のAI機能を追加できます。

### 6. 記事管理

- **ディレクトリ対応**: `blog` と `blog-demo` の2つのディレクトリをサポート
- **Frontmatter編集**: タイトル、説明、公開日、タグを編集可能
- **ファイル名自動生成**: `YYYY-MM-DD-slug.md` 形式

### 7. プレビュー機能

2 種類のプレビューモードを提供：

| モード | 説明 |
|--------|------|
| Markdown | 編集中の Markdown をリアルタイムでレンダリング |
| Astro プレビュー | 実際の Astro サイト表示を iframe で確認 |

### 8. UI/UX

- レスポンシブレイアウト（左右パネルのリサイズ・折りたたみ）
- 記事一覧パネル
- スキル設定パネル（作成・編集・削除）
- AI結果パネル（結果の一覧表示と適用）

## セットアップ

### 前提条件

- Node.js 20.x 以上
- pnpm 8.x 以上
- Anthropic API キー

### 環境変数

`tools/blog-assistant/.env` ファイルを作成：

```env
ANTHROPIC_API_KEY=your-api-key-here
```

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
pnpm dev
```

## 使い方

### 基本的なワークフロー

1. **Blog Assistant を開く**: http://localhost:5173 にアクセス
2. **Frontmatter を入力**: タイトル、説明、タグ、公開日を設定
3. **記事を執筆**: 左側のエディタで Markdown を記述
4. **プレビュー確認**: 右側でリアルタイムプレビューを確認
5. **AI 校閲**: `/` コマンドまたはテキスト選択から AI 機能を使用
6. **保存**: 「保存」ボタンでファイルを出力

### スラッシュコマンドの使い方

1. エディタで `/` を入力
2. コマンドメニューから機能を選択
3. AI結果パネルで結果を確認
4. 必要に応じて「記事に適用」で反映

### テキスト選択での使い方

1. 改善したいテキストを選択
2. ポップアップから適用したいスキルを選択
3. AI結果パネルで結果を確認
4. 「記事に適用」で選択範囲を置換

### 画像挿入の使い方

1. **貼り付け**: スクリーンショットなどをCtrl+V / Cmd+Vで貼り付け
2. **ドラッグ&ドロップ**: 画像ファイルをエディタにドロップ
3. **コマンド**: `/` → 「画像挿入」を選択

画像は自動的にWebP形式に変換・最適化され、`/public/images/posts/` に保存されます。

### カスタムスキルの作成

1. ヘッダーの「スキル設定」をクリック
2. 「+」ボタンで新規スキル作成
3. 名前、説明、カテゴリ、プロンプトを設定
4. 変数（`{{content}}` など）を使用してテンプレートを作成

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
│   │   ├── preview.ts           # プレビュー URL
│   │   ├── skills.ts            # スキル CRUD API
│   │   └── images.ts            # 画像アップロード API
│   ├── services/
│   │   ├── claude-agent.ts      # Claude Agent SDK 統合
│   │   ├── article-service.ts   # 記事管理
│   │   ├── skill-service.ts     # スキル管理
│   │   └── image-service.ts     # 画像処理・最適化
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
│       │   ├── AIResultsPanel.tsx      # AI結果表示パネル
│       │   ├── ArticleList.tsx         # 記事一覧
│       │   ├── AstroPreview.tsx        # Astroプレビュー
│       │   ├── Editor.tsx              # Markdownエディタ
│       │   ├── EditorCommandMenu.tsx   # スラッシュコマンドメニュー
│       │   ├── EditorSelectionPopup.tsx # 選択ポップアップ
│       │   ├── FrontmatterForm.tsx     # メタ情報フォーム
│       │   ├── Preview.tsx             # プレビュー
│       │   ├── SaveModal.tsx           # 保存ダイアログ
│       │   ├── SkillEditor.tsx         # スキル編集モーダル
│       │   ├── SkillExecutor.tsx       # スキル実行モーダル
│       │   └── SkillsPanel.tsx         # スキルパネル
│       ├── hooks/
│       │   ├── useAIReview.ts          # 校閲フック
│       │   ├── useAIGenerate.ts        # 下書き生成フック
│       │   ├── useArticle.ts           # 記事管理フック
│       │   ├── useImageUpload.ts       # 画像アップロードフック
│       │   └── useSkills.ts            # スキル管理フック
│       └── styles/
│           └── globals.css
│
├── shared/                      # 共有コード
│   └── types.ts
│
└── data/                        # データ保存
    └── skills.json              # カスタムスキル
```

## API リファレンス

### 記事 API

#### GET /api/articles

記事一覧を取得します。

**レスポンス:**

```json
[
  {
    "id": "2025-01-01-example.md",
    "slug": "2025-01-01-example",
    "filename": "2025-01-01-example.md",
    "directory": "blog",
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

#### POST /api/articles

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
  },
  "directory": "blog",
  "slug": "optional-slug"
}
```

**レスポンス:**

```json
{
  "filename": "2025-01-01-記事タイトル.md",
  "previewUrl": "http://localhost:4321/posts/2025-01-01-記事タイトル",
  "isUpdate": false
}
```

### AI API

#### POST /api/review

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

#### POST /api/generate

下書きを生成します。SSE でストリーミングレスポンスを返します。

**リクエスト:**

```json
{
  "topic": "React Hooks の基本的な使い方"
}
```

### スキル API

#### GET /api/skills

スキル一覧を取得します。

#### POST /api/skills

カスタムスキルを作成します。

**リクエスト:**

```json
{
  "name": "文章を簡潔に",
  "description": "冗長な表現を削除して簡潔にします",
  "category": "assist",
  "systemPrompt": "あなたは編集者です...",
  "userPromptTemplate": "以下の文章を簡潔にしてください。\n\n{{selection}}"
}
```

#### PUT /api/skills/:id

スキルを更新します。

#### DELETE /api/skills/:id

カスタムスキルを削除します。

#### POST /api/skills/:id/execute

スキルを実行します。SSE でストリーミングレスポンスを返します。

**リクエスト:**

```json
{
  "skillId": "improve-section",
  "variables": {
    "title": "記事タイトル",
    "selection": "改善したいテキスト"
  }
}
```

### 画像 API

#### POST /api/images/upload

画像をアップロードします。

**リクエスト (multipart/form-data):**
- `file`: 画像ファイル

または

**リクエスト (JSON):**
```json
{
  "base64": "data:image/png;base64,...",
  "filename": "screenshot.png"
}
```

**レスポンス:**

```json
{
  "filename": "1703123456789-screenshot-a1b2c3d4.webp",
  "path": "/workspace/public/images/posts/...",
  "markdown": "![](images/posts/1703123456789-screenshot-a1b2c3d4.webp)",
  "width": 1200,
  "height": 800,
  "size": 45678
}
```

## カスタマイズ

### 校閲プロンプトのカスタマイズ

`server/services/skill-service.ts` のビルトインスキル定義を編集できます：

```typescript
const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'review',
    name: '校閲',
    systemPrompt: `あなたは技術ブログの編集者です。
// カスタマイズしたプロンプト
`,
    userPromptTemplate: `以下のブログ記事を校閲してください。
// カスタマイズしたテンプレート
`,
  },
  // ...
]
```

### カスタムスキルの追加

UI からカスタムスキルを作成するか、`data/skills.json` を直接編集できます：

```json
[
  {
    "id": "custom-1234567890",
    "name": "技術用語チェック",
    "description": "技術用語の使い方を確認します",
    "category": "review",
    "systemPrompt": "あなたは技術用語の専門家です...",
    "userPromptTemplate": "以下の文章の技術用語をチェックしてください。\n\n{{content}}",
    "variables": ["content"],
    "isBuiltIn": false,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

### UI テーマの変更

`client/src/styles/globals.css` でスタイルをカスタマイズ：

```css
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

**解決策:** 依存関係を再インストール

```bash
cd tools/blog-assistant
pnpm install
```

#### AI 機能が動作しない

```
Error: Authentication failed
```

**解決策:** 環境変数を確認

```bash
# .env ファイルに ANTHROPIC_API_KEY が設定されているか確認
cat tools/blog-assistant/.env
```

#### 画像がプレビューに表示されない

**解決策:**

1. 開発サーバーが起動しているか確認
2. `/images/*` へのプロキシが設定されているか確認
3. 画像が `/workspace/public/images/posts/` に保存されているか確認

#### Astro プレビューが表示されない

**解決策:**

1. Astro dev server が起動しているか確認
2. 記事が保存されているか確認
3. ブラウザのコンソールでエラーを確認

#### 選択ポップアップが表示されない

**解決策:**

1. 5文字以上のテキストを選択する必要があります
2. テキストエリア内で選択していることを確認

### デバッグ方法

サーバーログを確認：

```bash
# 開発サーバーを起動してログを確認
pnpm dev:server
```

ブラウザの開発者ツールで SSE 通信を確認：

1. Network タブを開く
2. `/api/review` または `/api/generate` リクエストを選択
3. EventStream タブでメッセージを確認

## 関連リソース

- [Claude Agent SDK ドキュメント](https://docs.anthropic.com/)
- [Hono ドキュメント](https://hono.dev/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [記事の書き方ガイド](./WRITING_GUIDE.md)
