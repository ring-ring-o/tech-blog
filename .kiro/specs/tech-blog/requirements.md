# Requirements Document

## Project Description (Input)
# 技術ブログ作成依頼書

## 1. プロジェクト概要

IT技術に関する個人ブログサイトを構築してください。このブログは単一著者による技術情報の発信を目的とし、プログラミング、システム管理、ネットワーク、セキュリティ、クラウドコンピューティング、データベース、DevOps、AI、機械学習などの技術分野を扱います。

### 基本方針
- 完全静的サイトとして構築
- Markdownベースのコンテンツ管理
- 高速なパフォーマンスとSEO最適化
- 将来的な拡張性を考慮した設計

## 2. 技術スタック

### コア技術
- **フロントエンドフレームワーク**: Astro（最新安定版、v5.x推奨）
- **スタイリング**: Tailwind CSS v4.x
- **言語**: TypeScript（strict mode有効）
- **パッケージマネージャー**: pnpm v10.x以上

### 開発ツール
- **フォーマッタ & リンター**: Biome
- **バージョン管理**: Git + GitHub
- **コンテンツ形式**: Markdown（frontmatter対応）

### 推奨ライブラリ
- **検索機能**: Pagefind
- **コードハイライト**: Shiki または Prism
- **目次生成**: remark-toc または自動生成機能

## 3. 機能要件

### Phase 1: MVP（最小viable製品）

#### 3.1 ホームページ
- 記事一覧の表示（新しい順）
- 各記事のサムネイル情報表示
  - タイトル
  - 投稿日
  - タグ（最大3つ）
  - 概要（150文字程度）
- ページネーション（1ページ10件）

#### 3.2 記事ページ
- Markdown形式の記事を整形表示
- 記事メタ情報の表示
  - タイトル（h1タグ）
  - 投稿日時
  - 更新日時（任意）
  - タグ一覧
- 自動生成される目次
  - h2, h3見出しから生成
  - ページ内リンク対応
  - スクロール追従（任意）
- コードブロックの高度な表示
  - ファイル名表示（指定時）
  - 言語表示
  - 行番号表示
  - コピーボタン（行番号を除外してコピー）
  - シンタックスハイライト

#### 3.3 Aboutページ
- ブログの目的と方針の説明
- 管理者プロフィール
  - 自己紹介
  - スキルセット
  - 連絡先情報（メール、SNSリンク）
- Markdown形式で編集可能

### Phase 2: 拡張機能

#### 3.4 タグ機能
- タグ一覧ページ
  - 全タグの表示（投稿数付き)
  - タグごとの記事件数表示
- タグ別記事一覧ページ
  - 特定タグの記事を一覧表示
  - ページネーション対応

#### 3.5 検索機能
- ヘッダーに検索アイコン配置
- 専用検索ページを使用
- クライアントサイドで完結する静的検索
##### 検索仕様
- **検索対象**: 記事タイトル、本文、タグ
- **検索方式**: あいまい検索（タイポ許容）
- **日本語対応**: ひらがな/カタカナ/漢字混在可
- **検索結果表示**:
  - マッチした記事のタイトル
  - 投稿日
  - タグ一覧
  - マッチ箇所のスニペット（前後50-100文字、ハイライト付き）
  - 関連度順にソート
- **パフォーマンス**:
  - 初回検索時のみインデックスロード（~200KB）
  - 2回目以降はキャッシュから即座に検索
##### 実装方針
- `@pagefind/default-ui` または カスタムUI実装
- 検索ページ専用のレイアウト
- ローディング状態の表示
- 検索結果0件時のメッセージ

#### 3.6 テーマ切り替え
- ライトモード / ダークモード
- トグルボタンをヘッダーに配置
- デフォルトはシステム設定に従う
- ユーザー選択を localStorage に保存

### Phase 3: 追加機能

#### 3.7 試験機能ページ
- 新技術の実験的導入を紹介
- 試験中の機能の説明
- 関連記事へのリンク

#### 3.8 広告配置機能（オプショナル）
- 環境変数で広告表示ON/OFF制御
- 配置可能エリア
  - サイドバー（デスクトップのみ）
  - 記事下部
  - フッター上部
- 広告非表示時でもレイアウト崩れなし
- 全体デザインとの調和を保つスタイリング

### 3.9 共通UI要素

#### ナビゲーションバー
- ロゴ/サイト名
- メニュー項目
  - ホーム
  - About
  - タグ一覧
  - 検索
- テーマ切り替えボタン
- モバイルではハンバーガーメニュー

#### フッター
- 著作権表示
- プライバシーポリシーへのリンク
- 利用規約へのリンク
- GitHubリポジトリリンク（任意）

## 4. デザイン仕様

### 4.1 カラースキーム

#### ライトモード
```
背景: #FAFAFA
カード背景: #FFFFFF
テキスト（メイン）: #2C2C2C
テキスト（サブ）: #6B6B6B
ボーダー: #E0E0E0
アクセント: #0066CC
コードブロック背景: #F5F5F5
```

#### ダークモード
```
背景: #1A1A1A
カード背景: #252525
テキスト（メイン）: #E8E8E8
テキスト（サブ）: #A0A0A0
ボーダー: #3A3A3A
アクセント: #4A9EFF
コードブロック背景: #2A2A2A
```

#### 共通方針
- 純白(#FFFFFF)と純黒(#000000)は背景以外で使用しない
- グレースケールはTailwindのデフォルト（50-950）を活用
- アクセントカラーはリンク、ボタン、強調要素に使用

### 4.2 タイポグラフィ

#### フォント指定
```css
/* システムフォントスタック推奨 */
font-family:
  -apple-system, BlinkMacSystemFont,
  "Segoe UI", "Noto Sans JP",
  "Hiragino Sans", "Hiragino Kaku Gothic ProN",
  Meiryo, sans-serif;

/* コード用フォント */
font-family:
  "JetBrains Mono", "Fira Code",
  Consolas, Monaco, "Courier New",
  monospace;
```

#### 要件
- 英数字と日本語の両方で高い可読性
- I（アイ）、l（エル）、1（いち）の明確な識別
- 0（ゼロ）とO（オー）の明確な識別
- コードフォントはリガチャ対応推奨

### 4.3 レイアウト原則

- **紙面的なデザイン**: 余白を活かしたクリーンなレイアウト
- **セマンティックHTML優先**
  - `<article>`: 記事コンテンツ
  - `<section>`: コンテンツの区分
  - `<nav>`: ナビゲーション
  - `<header>` / `<footer>`: ヘッダー/フッター
  - `<aside>`: サイドバー、関連情報
  - レイアウト目的のみの`<div>`は最小限に
- **レスポンシブデザイン**
  - モバイルファースト
  - ブレイクポイント: sm(640px), md(768px), lg(1024px), xl(1280px)
- **アクセシビリティ**
  - 適切なARIAラベル
  - キーボードナビゲーション対応
  - 十分なコントラスト比（WCAG AA準拠）

### 4.4 コードブロックデザイン

```
┌─ filename.ts ─────────────────────────────── [Copy] ─┐
│  1 | import { defineConfig } from 'astro/config'     │
│  2 |                                                  │
│  3 | export default defineConfig({                   │
│  4 |   site: 'https://example.com'                   │
│  5 | })                                               │
└──────────────────────────────────────────────────────┘
```

- ファイル名表示（frontmatterで指定時）
- 言語表示（右上または左上）
- コピーボタン（ホバー時に表示推奨）
- 行番号（オプショナル、記事ごとに設定可能）
- 水平スクロール対応

## 5. アーキテクチャ方針

### 5.1 ディレクトリ構成

```
project-root/
├── src/
│   ├── components/       # 再利用可能なUIコンポーネント
│   │   ├── layout/      # Header, Footer, Layout
│   │   ├── article/     # ArticleCard, ArticleContent
│   │   └── common/      # Button, Tag, SearchBox
│   ├── pages/           # ページコンポーネント（ルーティング）
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── tags/
│   │   └── posts/
│   ├── content/         # Markdownコンテンツ
│   │   └── blog/
│   ├── lib/             # ユーティリティ、ヘルパー
│   │   ├── repositories/  # データ取得層
│   │   ├── utils/
│   │   └── types/
│   ├── styles/          # グローバルCSS
│   └── layouts/         # レイアウトコンポーネント
├── public/              # 静的アセット
├── biome.json
├── tsconfig.json
├── tailwind.config.mjs
└── astro.config.mjs
```

### 5.2 コンテンツ管理の抽象化

将来的な外部CMS（Contentful, microCMS等）への移行を見据えて、Repository Patternを採用します。

#### インターフェース定義

```typescript
// src/lib/types/content.ts
export interface Post {
  slug: string
  title: string
  description: string
  publishedAt: Date
  updatedAt?: Date
  tags: string[]
  content: string
  draft?: boolean
}

// src/lib/repositories/content-repository.ts
export interface ContentRepository {
  getAllPosts(): Promise<Post[]>
  getPostBySlug(slug: string): Promise<Post | null>
  getPostsByTag(tag: string): Promise<Post[]>
  getAllTags(): Promise<{ name: string; count: number }[]>
  searchPosts(keyword: string): Promise<Post[]>
}
```

#### 実装の切り替え

```typescript
// src/lib/repositories/index.ts
import { MarkdownRepository } from './markdown-repository'
// 将来的には以下を追加
// import { CMSRepository } from './cms-repository'

export const contentRepository: ContentRepository = new MarkdownRepository()
// 環境変数で切り替え可能に
// export const contentRepository =
//   process.env.USE_CMS === 'true'
//     ? new CMSRepository()
//     : new MarkdownRepository()
```

### 5.3 Markdown記事の形式

```markdown
---
title: "記事タイトル"
description: "記事の概要説明（150文字以内推奨）"
publishedAt: 2025-01-15
updatedAt: 2025-01-20
tags: ["TypeScript", "Astro", "フロントエンド"]
draft: false
---

# 記事本文

本文の内容...

## セクション1

内容...

```typescript:filename.ts
// コード例
```
...
```

### 5.4 コンポーネント設計原則

- **Single Responsibility**: 1コンポーネント = 1責務
- **Props型定義**: すべてのPropsに明示的な型定義
- **再利用性**: 3回以上使う要素はコンポーネント化
- **Astroコンポーネント優先**: インタラクティブ性が必要な場合のみReact/Vue等を検討

## 6. 非機能要件

### 6.1 パフォーマンス目標

- **Lighthouse Score**: 全項目95点以上
  - Performance: 95+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 95+
- **Core Web Vitals**
  - LCP (Largest Contentful Paint): 2.5秒以内
  - FID (First Input Delay): 100ms以内
  - CLS (Cumulative Layout Shift): 0.1以下
- **バンドルサイズ**: 初期ロード100KB以内（gzip圧縮後）
- **ビルド時間**: 100記事で1分以内

### 6.2 SEO対策

#### メタタグ設定（全ページ共通）
```html
<meta name="description" content="...">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:type" content="website">
<meta property="og:url" content="...">
<meta property="og:image" content="...">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
```

#### 構造化データ
- 記事ページ: BlogPosting schema
- ホームページ: Blog schema
- Aboutページ: Person schema

#### その他
- robots.txt設置
- sitemap.xml自動生成
- canonical URL設定
- 適切な見出し階層（h1→h2→h3）

### 6.3 アクセシビリティ

- WCAG 2.1 レベルAA準拠
- キーボードナビゲーション完全対応
- スクリーンリーダー対応
- 色のみに依存しない情報伝達
- フォーカスインジケーター明示

## 7. 成果物

### 7.1 納品物一覧

1. **完全動作するAstroプロジェクト**
   - すべての機能が実装済み
   - ローカルで開発・ビルド可能

2. **ドキュメント**
   - `README.md`: プロジェクト概要、セットアップ手順
   - `CONTRIBUTING.md`: 記事追加・更新手順
   - `DEPLOYMENT.md`: デプロイ手順（Vercel/Netlify）

3. **サンプルコンテンツ**
   - サンプル記事 3〜5件
   - Aboutページのサンプル内容
   - プライバシーポリシー/利用規約のテンプレート

4. **設定ファイル**
   - `vercel.json` または `netlify.toml`
   - 環境変数のサンプル（`.env.example`）
   - GitHub Actions（任意: 自動デプロイ設定）

### 7.2 動作確認環境

- Node.js: v18.x以上
- pnpm: v8.x以上
- モダンブラウザ（Chrome, Firefox, Safari, Edge最新版）

### 7.3 開発コマンド

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# プレビュー
pnpm preview

# リンター & フォーマッター
pnpm lint
pnpm format
```

## 8. 制約事項・禁止事項

### 8.1 技術的制約

❌ **使用禁止**
- WebAssemblyでの検索実装（過剰設計のため）
- jQuery等の古いライブラリ
- インラインスタイル（style属性）
- `!important`の多用（Tailwindの例外除く）

⚠️ **慎重に使用**
- クライアントサイドJavaScript（必要最小限に）
- 外部スクリプト読み込み（パフォーマンス影響考慮）
- アニメーション（パフォーマンス影響考慮）

✅ **推奨**
- Astroのビルトイン機能を最大限活用
- Tailwind CSSのユーティリティクラス
- TypeScriptの型システムを活用
- セマンティックHTML

### 8.2 デザイン制約

- 過度な装飾・アニメーションは避ける
- 純白(#FFF)・純黒(#000)は原則使用しない
- フォントサイズは16px基準（root）
- 広告表示時もコンテンツ可読性を最優先

### 8.3 コンテンツ制約

- 記事ファイル名: `YYYY-MM-DD-slug.md` 形式
- 画像ファイル: WebP優先、最大幅1200px
- タグ名: ケバブケース、日本語可

## 9. 実装の優先順位

### Priority 1 (必須・MVP)
- [ ] 基本的なページ構成（ホーム、記事、About）
- [ ] Markdownからの記事表示
- [ ] レスポンシブレイアウト
- [ ] SEO基本設定
- [ ] コードブロック表示

### Priority 2 (重要)
- [ ] タグ機能
- [ ] 検索機能
- [ ] ダークモード
- [ ] 目次自動生成
- [ ] パフォーマンス最適化

### Priority 3 (追加機能)
- [ ] 試験機能ページ
- [ ] 広告配置機能
- [ ] ソーシャルシェアボタン
- [ ] 関連記事表示

## 10. 補足事項

### 10.1 今後の拡張予定（参考）
- コメント機能（外部サービス連携）
- RSS/Atom フィード
- 記事の多言語対応
- アクセス解析（Google Analytics等）
- Newsletter購読機能

### 10.2 推奨デプロイ先
- Vercel（推奨）
- Netlify
- Cloudflare Pages
- GitHub Pages

### 10.3 質問・不明点の扱い
実装中に仕様が不明確な点があれば、以下の優先順位で判断してください：
1. Astroの公式ドキュメントのベストプラクティスに従う
2. パフォーマンスとアクセシビリティを優先
3. シンプルさを保つ
4. 実装前に確認・提案

## Introduction

本プロジェクトは、IT技術に関する個人ブログサイトをAstro + TypeScript + Tailwind CSSを用いて構築します。完全静的サイトとして、Markdownベースのコンテンツ管理、高速なパフォーマンス、SEO最適化を実現し、将来的な拡張性を考慮した設計を採用します。

読者に技術情報を効率的に提供し、著者が容易にコンテンツを管理できることを目的としています。

## Requirements

### Requirement 1: コンテンツ表示とナビゲーション
**目的:** 読者として、ブログの記事を閲覧し、興味のあるコンテンツを効率的に見つけたい

#### Acceptance Criteria

1. WHEN 読者がホームページにアクセスした THEN ブログシステム SHALL 記事一覧を新しい順に表示する
2. WHEN 記事一覧を表示する THEN ブログシステム SHALL 各記事のタイトル、投稿日、タグ（最大3つ）、概要（150文字程度）を含むサムネイル情報を表示する
3. WHEN 記事一覧が10件を超える THEN ブログシステム SHALL ページネーション機能を提供する
4. WHEN 読者が記事をクリックした THEN ブログシステム SHALL 記事詳細ページへ遷移する
5. WHEN 記事詳細ページを表示する THEN ブログシステム SHALL Markdown形式の記事本文を整形して表示する
6. WHEN 記事詳細ページを表示する THEN ブログシステム SHALL タイトル（h1）、投稿日時、更新日時（任意）、タグ一覧を含むメタ情報を表示する

### Requirement 2: 記事コンテンツの構造化と可読性
**目的:** 読者として、記事の構造を把握し、目的の情報に素早くアクセスしたい

#### Acceptance Criteria

1. WHEN 記事にh2・h3見出しが含まれる THEN ブログシステム SHALL 自動的に目次を生成する
2. WHEN 目次を生成する THEN ブログシステム SHALL 各見出しへのページ内リンクを提供する
3. WHEN 記事にコードブロックが含まれる THEN ブログシステム SHALL シンタックスハイライトを適用する
4. WHEN コードブロックにファイル名が指定されている THEN ブログシステム SHALL ファイル名を表示する
5. WHEN コードブロックを表示する THEN ブログシステム SHALL 言語表示とコピーボタンを提供する
6. WHEN コピーボタンがクリックされた THEN ブログシステム SHALL 行番号を除外したコードをクリップボードにコピーする

### Requirement 3: タグによる記事の分類と検索
**目的:** 読者として、特定の技術分野やトピックに関連する記事を見つけたい

#### Acceptance Criteria

1. WHEN 読者がタグ一覧ページにアクセスした THEN ブログシステム SHALL すべてのタグを投稿数付きで表示する
2. WHEN 読者がタグをクリックした THEN ブログシステム SHALL そのタグが付けられた記事の一覧を表示する
3. WHEN タグ別記事一覧が10件を超える THEN ブログシステム SHALL ページネーション機能を提供する
4. WHEN 記事にタグが設定されている THEN ブログシステム SHALL 記事詳細ページとサムネイルにタグを表示する

### Requirement 4: 全文検索機能
**目的:** 読者として、キーワードで記事を検索し、関連するコンテンツを見つけたい

#### Acceptance Criteria

1. WHEN 読者がヘッダーの検索アイコンをクリックした THEN ブログシステム SHALL 検索ページへ遷移する
2. WHEN 検索ページでキーワードを入力した THEN ブログシステム SHALL 記事タイトル、本文、タグから該当する記事を検索する
3. WHEN 検索を実行する THEN ブログシステム SHALL あいまい検索（タイポ許容）機能を提供する
4. WHEN 検索結果を表示する THEN ブログシステム SHALL マッチした記事のタイトル、投稿日、タグ、マッチ箇所のスニペット（前後50-100文字、ハイライト付き）を関連度順にソートして表示する
5. WHEN 検索結果が0件の場合 THEN ブログシステム SHALL 適切なメッセージを表示する
6. WHEN 初回検索を実行する THEN ブログシステム SHALL 検索インデックス（~200KB）をロードし、2回目以降はキャッシュから検索する

### Requirement 5: テーマとアクセシビリティ
**目的:** 読者として、自分の好みや環境に合わせた表示モードで記事を閲覧したい

#### Acceptance Criteria

1. WHEN ブログを初めて訪問した THEN ブログシステム SHALL システム設定に応じてライトモードまたはダークモードを適用する
2. WHEN 読者がヘッダーのテーマ切り替えボタンをクリックした THEN ブログシステム SHALL ライトモード/ダークモードを切り替える
3. WHEN テーマを切り替えた THEN ブログシステム SHALL 選択をlocalStorageに保存する
4. WHEN ページを表示する THEN ブログシステム SHALL WCAG 2.1 レベルAAに準拠したコントラスト比を維持する
5. WHEN キーボードで操作する THEN ブログシステム SHALL すべてのインタラクティブ要素にキーボードナビゲーションを提供する
6. WHEN スクリーンリーダーで閲覧する THEN ブログシステム SHALL 適切なARIAラベルとセマンティックHTMLを提供する

### Requirement 6: レスポンシブデザインとモバイル対応
**目的:** 読者として、あらゆるデバイスで快適に記事を閲覧したい

#### Acceptance Criteria

1. WHEN モバイルデバイスでアクセスした THEN ブログシステム SHALL モバイルファースト設計に基づくレスポンシブレイアウトを適用する
2. WHEN 画面幅が640px未満の場合 THEN ブログシステム SHALL ハンバーガーメニューでナビゲーションを表示する
3. WHEN 画面幅が640px以上の場合 THEN ブログシステム SHALL 水平ナビゲーションメニューを表示する
4. WHEN 画面幅が768px, 1024px, 1280pxを超える THEN ブログシステム SHALL 対応するブレイクポイントのレイアウトを適用する

### Requirement 7: Aboutページとプロフィール情報
**目的:** 読者として、ブログの目的と著者について知りたい

#### Acceptance Criteria

1. WHEN 読者がAboutページにアクセスした THEN ブログシステム SHALL ブログの目的と方針の説明を表示する
2. WHEN Aboutページを表示する THEN ブログシステム SHALL 管理者の自己紹介、スキルセット、連絡先情報（メール、SNSリンク）を表示する
3. WHEN 著者がAboutページを編集する THEN ブログシステム SHALL Markdown形式で編集可能にする

### Requirement 8: SEO最適化とメタデータ
**目的:** ウェブサイトとして、検索エンジンで適切にインデックスされ、発見されやすくしたい

#### Acceptance Criteria

1. WHEN ページを生成する THEN ブログシステム SHALL 適切なmeta descriptionタグを含める
2. WHEN ページを生成する THEN ブログシステム SHALL Open Graph（og:title, og:description, og:type, og:url, og:image）タグを含める
3. WHEN ページを生成する THEN ブログシステム SHALL Twitter Card（twitter:card, twitter:title, twitter:description）タグを含める
4. WHEN 記事ページを生成する THEN ブログシステム SHALL BlogPosting schemaの構造化データを含める
5. WHEN ホームページを生成する THEN ブログシステム SHALL Blog schemaの構造化データを含める
6. WHEN Aboutページを生成する THEN ブログシステム SHALL Person schemaの構造化データを含める
7. WHEN サイトをビルドする THEN ブログシステム SHALL robots.txtとsitemap.xmlを自動生成する
8. WHEN ページを生成する THEN ブログシステム SHALL canonical URLを設定する

### Requirement 9: パフォーマンスとビルド最適化
**目的:** ウェブサイトとして、高速な表示と効率的なビルドを実現したい

#### Acceptance Criteria

1. WHEN Lighthouse監査を実行する THEN ブログシステム SHALL Performance, Accessibility, Best Practices, SEOの各項目で95点以上を獲得する
2. WHEN ページを表示する THEN ブログシステム SHALL LCP 2.5秒以内、FID 100ms以内、CLS 0.1以下を達成する
3. WHEN 初期ロードを行う THEN ブログシステム SHALL gzip圧縮後100KB以内のバンドルサイズを維持する
4. WHEN 100記事を含むサイトをビルドする THEN ブログシステム SHALL 1分以内にビルドを完了する

### Requirement 10: 共通UIコンポーネント
**目的:** 読者として、一貫性のあるナビゲーションとサイト情報にアクセスしたい

#### Acceptance Criteria

1. WHEN 任意のページを表示する THEN ブログシステム SHALL ロゴ/サイト名、ホーム、About、タグ一覧、検索へのリンク、テーマ切り替えボタンを含むナビゲーションバーを表示する
2. WHEN 任意のページを表示する THEN ブログシステム SHALL 著作権表示、プライバシーポリシー、利用規約、GitHubリポジトリ（任意）へのリンクを含むフッターを表示する

### Requirement 11: 試験機能とオプショナル機能（Phase 3）
**目的:** ブログ管理者として、新技術を実験的に導入し、オプショナルな収益化機能を利用したい

#### Acceptance Criteria

1. WHEN 試験機能ページにアクセスした THEN ブログシステム SHALL 実験的に導入している新技術、試験中の機能の説明、関連記事へのリンクを表示する
2. IF 環境変数で広告表示がONに設定されている THEN ブログシステム SHALL サイドバー（デスクトップのみ）、記事下部、フッター上部に広告を配置する
3. IF 広告が非表示の場合 THEN ブログシステム SHALL レイアウト崩れなく表示する

### Requirement 12: コンテンツ管理とリポジトリパターン
**目的:** 開発者として、将来的な外部CMS移行を見据えた拡張性の高いアーキテクチャを実装したい

#### Acceptance Criteria

1. WHEN コンテンツを取得する THEN ブログシステム SHALL ContentRepositoryインターフェースを介してデータにアクセスする
2. WHEN Markdown記事を作成する THEN ブログシステム SHALL frontmatter（title, description, publishedAt, updatedAt, tags, draft）を含む形式を受け付ける
3. WHEN 記事ファイルを保存する THEN ブログシステム SHALL `YYYY-MM-DD-slug.md` 形式のファイル名を使用する
4. WHEN 画像を配置する THEN ブログシステム SHALL WebP形式を優先し、最大幅1200pxを維持する
