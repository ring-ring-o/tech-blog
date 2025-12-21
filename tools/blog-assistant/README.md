# Blog Assistant

技術ブログの執筆を支援するWebアプリケーションです。Claude AI を活用した校閲・下書き生成機能、カスタマイズ可能なスキルシステム、画像の自動最適化などを提供します。

## 機能概要

### エディタ機能

- **Notionライクなスラッシュコマンド**: エディタで `/` を入力するとコマンドメニューが表示されます
  - AI校閲: 記事全体の校閲を実行
  - 下書き生成: トピックから新しい記事を生成
  - スキル実行: 登録済みのスキルを実行
  - 画像挿入: 画像ファイルを選択して挿入

- **テキスト選択ポップアップ**: テキストを選択すると、選択範囲に適用可能なAIスキルがポップアップ表示されます
  - 内容を補完
  - セクション改善
  - カスタムスキル

- **画像アップロード**:
  - クリップボードからの貼り付け（Ctrl+V / Cmd+V）
  - ドラッグ&ドロップ
  - ファイル選択ダイアログ
  - 自動でWebP形式に変換・最適化（最大幅1200px、品質85%）

### AI機能

- **校閲**: 文法・表記の誤り、読みやすさ、技術的正確性、SEO最適化を自動チェック
- **下書き生成**: トピックから記事のドラフトを自動生成（Frontmatter込み）
- **カスタムスキル**: ユーザー定義のプロンプトでAI機能を追加可能

### スキルシステム

5つのビルトインスキルを提供:

| スキル名 | カテゴリ | 説明 |
|----------|----------|------|
| 校閲 | review | 記事全体の誤りや改善点を指摘 |
| 下書き生成 | generate | トピックから記事を自動生成 |
| 続きを書く | assist | 既存コンテンツから続きを執筆 |
| 内容を補完 | assist | 選択箇所をより詳しく説明 |
| セクション改善 | assist | 選択セクションを読みやすく改善 |

カスタムスキルでは以下の変数が利用可能:
- `{{content}}`: 記事本文
- `{{title}}`: タイトル
- `{{description}}`: 説明
- `{{tags}}`: タグ一覧
- `{{selection}}`: 選択テキスト
- `{{today}}`: 今日の日付

### 記事管理

- **ディレクトリ対応**: `blog` と `blog-demo` の2つのディレクトリをサポート
- **Frontmatter編集**: タイトル、説明、公開日、タグを編集可能
- **ファイル名自動生成**: `YYYY-MM-DD-slug.md` 形式

### プレビュー機能

- **リアルタイムプレビュー**: Markdownをリアルタイムでレンダリング
- **Astro統合**: 実際のAstroサイトでのプレビュー（開発サーバー起動時）

### UI/UX

- **レスポンシブレイアウト**: 左右パネルのリサイズ・折りたたみに対応
- **記事一覧パネル**: 既存記事の閲覧・編集
- **スキル設定パネル**: スキルの作成・編集・削除
- **AI結果パネル**: 校閲・生成結果の一覧表示と適用

## 技術スタック

### バックエンド
- **Hono**: 軽量Webフレームワーク
- **@anthropic-ai/claude-agent-sdk**: Claude AI との連携
- **Sharp**: 画像処理・最適化
- **gray-matter**: Frontmatterパース
- **Zod**: スキーマバリデーション

### フロントエンド
- **React 19**: UIフレームワーク
- **Vite**: ビルドツール
- **Tailwind CSS**: スタイリング
- **react-markdown + remark-gfm**: Markdownレンダリング

## プロジェクト構成

```
blog-assistant/
├── client/                 # フロントエンド
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIResultsPanel.tsx     # AI結果表示パネル
│   │   │   ├── ArticleList.tsx        # 記事一覧
│   │   │   ├── AstroPreview.tsx       # Astroプレビュー
│   │   │   ├── Editor.tsx             # Markdownエディタ
│   │   │   ├── EditorCommandMenu.tsx  # スラッシュコマンドメニュー
│   │   │   ├── EditorSelectionPopup.tsx # 選択ポップアップ
│   │   │   ├── FrontmatterForm.tsx    # メタ情報フォーム
│   │   │   ├── Preview.tsx            # プレビュー
│   │   │   ├── SaveModal.tsx          # 保存ダイアログ
│   │   │   ├── SkillEditor.tsx        # スキル編集モーダル
│   │   │   ├── SkillExecutor.tsx      # スキル実行モーダル
│   │   │   └── SkillsPanel.tsx        # スキルパネル
│   │   ├── hooks/
│   │   │   ├── useAIGenerate.ts       # 下書き生成フック
│   │   │   ├── useAIReview.ts         # 校閲フック
│   │   │   ├── useArticle.ts          # 記事管理フック
│   │   │   ├── useImageUpload.ts      # 画像アップロードフック
│   │   │   └── useSkills.ts           # スキル管理フック
│   │   ├── App.tsx                    # メインコンポーネント
│   │   └── main.tsx                   # エントリーポイント
│   └── vite.config.ts
├── server/                 # バックエンド
│   ├── routes/
│   │   ├── articles.ts     # 記事API
│   │   ├── generate.ts     # 下書き生成API
│   │   ├── images.ts       # 画像アップロードAPI
│   │   ├── preview.ts      # プレビューAPI
│   │   ├── review.ts       # 校閲API
│   │   └── skills.ts       # スキルAPI
│   ├── services/
│   │   ├── article-service.ts  # 記事サービス
│   │   ├── claude-agent.ts     # Claude AI連携
│   │   ├── image-service.ts    # 画像処理
│   │   └── skill-service.ts    # スキル管理
│   ├── types/
│   │   └── index.ts        # 型定義
│   ├── app.ts              # Honoアプリ設定
│   └── index.ts            # サーバーエントリー
├── shared/                 # 共通コード
│   └── types.ts            # 共有型定義
├── data/                   # データ保存
│   └── skills.json         # カスタムスキル
└── package.json
```

## API エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/articles` | 記事一覧取得 |
| GET | `/api/articles/:filename` | 記事取得 |
| POST | `/api/articles` | 記事保存 |
| POST | `/api/review` | AI校閲（SSE） |
| POST | `/api/generate` | 下書き生成（SSE） |
| GET | `/api/preview/:slug` | プレビューURL取得 |
| GET | `/api/skills` | スキル一覧取得 |
| POST | `/api/skills` | スキル作成 |
| PUT | `/api/skills/:id` | スキル更新 |
| DELETE | `/api/skills/:id` | スキル削除 |
| POST | `/api/skills/:id/execute` | スキル実行（SSE） |
| POST | `/api/images/upload` | 画像アップロード |

## セットアップ

### 必要要件

- Node.js 20以上
- pnpm
- Anthropic API キー

### 環境変数

`.env` ファイルを作成:

```env
ANTHROPIC_API_KEY=your-api-key-here
```

### インストール

```bash
cd tools/blog-assistant
pnpm install
```

### 開発サーバー起動

```bash
pnpm dev
```

- フロントエンド: http://localhost:5173
- バックエンドAPI: http://localhost:3001

### Astroプレビュー（オプション）

Astroサイトのプレビューを使用する場合は、プロジェクトルートで:

```bash
pnpm dev
```

Astroプレビュー: http://localhost:4321

## 使い方

### 新規記事を作成

1. ブラウザで http://localhost:5173 を開く
2. メタ情報（タイトル、説明、タグ）を入力
3. Markdownエディタで本文を執筆
4. 「保存」ボタンで記事を保存

### AI機能を使用

1. **スラッシュコマンド**: エディタで `/` を入力
2. **テキスト選択**: テキストを選択してポップアップから機能を選択
3. **AI結果パネル**: 結果を確認し「記事に適用」で反映

### 画像を挿入

1. クリップボードから貼り付け（スクリーンショットなど）
2. 画像ファイルをエディタにドラッグ&ドロップ
3. スラッシュコマンドから「画像挿入」を選択

### カスタムスキルを作成

1. ヘッダーの「スキル設定」をクリック
2. 「+」ボタンで新規スキル作成
3. 名前、説明、カテゴリ、プロンプトを設定
4. 変数（`{{content}}` など）を使用してテンプレートを作成

## ライセンス

MIT
