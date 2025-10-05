# 実装計画: Tech Blog

- [x] 1. プロジェクトの初期化とビルド環境構築
  - Astro 5.x、TypeScript、Tailwind CSS v4、pnpmを使用したプロジェクトを初期化
  - Biomeリンター・フォーマッター設定を追加
  - TypeScriptのstrict mode設定を有効化
  - 基本的なディレクトリ構造（`src/components/`, `src/pages/`, `src/content/`, `src/layouts/`, `src/lib/`）を作成
  - _Requirements: 12.1, 12.2_

- [ ] 2. コンテンツ管理基盤の構築
- [x] 2.1 Content Collectionsとスキーマ定義
  - `src/content.config.ts`でZodスキーマ定義（title, description, publishedAt, updatedAt, tags, draft）
  - `src/content/blog/`ディレクトリを作成し、サンプル記事を3〜5件追加
  - スキーマ検証とTypeScript型生成が正常に動作することを確認
  - _Requirements: 12.2, 12.3_

- [x] 2.2 Repository Patternでコンテンツ抽象化
  - `src/lib/types/content.ts`でPostインターフェースを定義
  - `src/lib/repositories/content-repository.ts`でContentRepositoryインターフェースを定義
  - `src/lib/repositories/markdown-repository.ts`でMarkdownRepositoryを実装（getAllPosts, getPostBySlug, getPostsByTag, getAllTags）
  - 下書き除外（draft: true）とpublishedAt降順ソート機能を実装
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 3. 共通UIコンポーネントとレイアウト構築
- [x] 3.1 ベースレイアウトとSEOメタタグ
  - `src/layouts/BaseLayout.astro`を作成（HTML構造、head、header、footer）
  - `src/components/layout/SEOHead.astro`でメタタグ（description, Open Graph, Twitter Card）を実装
  - BlogPosting/Blog/Person schemaの構造化データを実装
  - canonical URL、robots.txt、sitemap.xml自動生成を設定
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 10.1, 10.2_

- [x] 3.2 ヘッダーとナビゲーション
  - `src/components/layout/Header.astro`でナビゲーションバーを実装（ロゴ、ホーム、About、タグ一覧、検索へのリンク）
  - モバイル（画面幅640px未満）でハンバーガーメニューを表示
  - デスクトップで水平メニューを表示
  - _Requirements: 6.1, 6.2, 6.3, 10.1_

- [x] 3.3 フッター
  - `src/components/layout/Footer.astro`で著作権表示、プライバシーポリシー、利用規約、GitHubリポジトリリンクを実装
  - _Requirements: 10.2_

- [ ] 4. テーマ切り替え機能の実装
- [x] 4.1 テーマトグルコンポーネント
  - `src/components/ThemeToggle.astro`でライト/ダークモード切り替えボタンを実装
  - システム設定をデフォルトとし、ユーザー選択をlocalStorageに保存
  - `data-theme`属性を`<html>`要素に設定し、CSS変数でカラースキームを管理
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 4.2 テーマ対応スタイリング
  - Tailwind CSS v4でライトモード/ダークモードのカラーパレットを定義
  - WCAG AA準拠のコントラスト比を維持
  - _Requirements: 5.4_

- [ ] 5. ホームページと記事一覧機能
- [x] 5.1 ホームページとページネーション
  - `src/pages/index.astro`で記事一覧を新しい順に表示（1ページ10件）
  - ページネーション機能を実装（11件以上の記事がある場合）
  - `src/components/article/ArticleCard.astro`で記事サムネイル（タイトル、投稿日、タグ最大3つ、概要150文字）を実装
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 6. 記事詳細ページの実装
- [x] 6.1 記事メタ情報とMarkdownレンダリング
  - `src/pages/posts/[slug].astro`で動的ルーティングを実装
  - 記事タイトル（h1）、投稿日、更新日（任意）、タグ一覧を表示
  - Markdown本文を整形してHTML表示
  - _Requirements: 1.4, 1.5, 1.6_

- [x] 6.2 目次自動生成
  - `src/components/article/TableOfContents.astro`でh2/h3見出しから目次を生成
  - 各見出しへのページ内リンクを提供
  - remarkプラグインでslugを自動生成
  - _Requirements: 2.1, 2.2_

- [x] 6.3 高度なコードブロック表示
  - Shikiシンタックスハイライトを`astro.config.mjs`で設定
  - `src/components/article/CodeBlock.astro`でファイル名、言語表示、行番号、コピーボタンを実装
  - コピーボタンクリック時に行番号を除外してクリップボードにコピー
  - _Requirements: 2.3, 2.4, 2.5, 2.6_

- [x] 7. タグ機能の実装
- [x] 7.1 タグ一覧ページ
  - `src/pages/tags/index.astro`ですべてのタグを投稿数付きで表示
  - タグごとの記事件数を取得し、アルファベット順または投稿数順でソート
  - _Requirements: 3.1_

- [x] 7.2 タグ別記事一覧ページ
  - `src/pages/tags/[tag].astro`で特定タグの記事一覧を表示
  - ページネーション機能を実装（11件以上の場合）
  - _Requirements: 3.2, 3.3_

- [x] 8. 全文検索機能の実装（Pagefind）
- [x] 8.1 Pagefindインデックス生成
  - ビルド後に`npx pagefind --site dist`でインデックス生成
  - `<article>`タグに`data-pagefind-body`属性を追加し、インデックス範囲を制御
  - Header/Footerに`data-pagefind-ignore`属性を追加して除外
  - `<html lang="ja">`で日本語セグメンテーションを有効化
  - _Requirements: 4.1, 4.6_

- [x] 8.2 検索ページとPagefind UI統合
  - `src/pages/search.astro`で検索ページを作成
  - Pagefind UIコンポーネントを`client:load`ディレクティブで読み込み
  - 検索キーワードに基づき、タイトル・本文・タグからマッチする記事を表示
  - マッチ箇所のスニペット（前後50-100文字）にハイライトを適用
  - 検索結果0件時のメッセージを表示
  - _Requirements: 4.2, 4.3, 4.4, 4.5_

- [x] 9. Aboutページの実装
  - `src/pages/about.astro`でMarkdown形式のAboutページを作成
  - ブログの目的と方針、管理者プロフィール（自己紹介、スキルセット、連絡先）を表示
  - Markdown編集可能な構造とする
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 10. アクセシビリティとレスポンシブデザイン
- [x] 10.1 セマンティックHTMLとARIAラベル
  - すべてのページで適切なセマンティックタグ（`<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`, `<aside>`）を使用
  - インタラクティブ要素に適切なARIAラベルを設定
  - _Requirements: 5.6_

- [x] 10.2 キーボードナビゲーション
  - すべてのリンク、ボタン、フォーム要素でキーボード操作（Tab、Enter、Space）を検証
  - フォーカスインジケーターを明示
  - _Requirements: 5.5_

- [x] 10.3 レスポンシブブレイクポイント対応
  - Tailwindのブレイクポイント（sm, md, lg, xl）でレイアウトを調整
  - モバイルファースト設計を徹底
  - _Requirements: 6.1, 6.4_

- [x] 11. パフォーマンス最適化
- [x] 11.1 画像最適化
  - Astro Image Serviceで画像を最適化（WebP優先、最大幅1200px）
  - 遅延ローディング（loading="lazy"）を適用
  - _Requirements: 12.4_

- [x] 11.2 バンドルサイズ最適化
  - `pnpm build`でバンドルサイズを計測し、gzip圧縮後100KB以内を維持
  - 不要なJavaScriptを削除
  - _Requirements: 9.3_

- [x] 11.3 Lighthouse監査
  - Performance、Accessibility、Best Practices、SEOの各項目で95点以上を達成
  - Core Web Vitals（LCP < 2.5s, FID < 100ms, CLS < 0.1）を検証
  - _Requirements: 9.1, 9.2_

- [x] 12. 試験機能ページとオプショナル広告配置（Phase 3）
- [x] 12.1 試験機能ページ
  - `src/pages/experimental.astro`で新技術の実験的導入、試験中の機能説明、関連記事へのリンクを表示
  - _Requirements: 11.1_

- [x] 12.2 広告配置機能
  - 環境変数（`ENABLE_ADS`）で広告表示ON/OFFを制御
  - `src/components/ads/AdSlot.astro`でサイドバー（デスクトップのみ）、記事下部、フッター上部に広告スロットを配置
  - 広告非表示時もレイアウト崩れなく表示
  - _Requirements: 11.2, 11.3_

- [ ] 13. ドキュメント作成
- [ ] 13.1 README.md
  - プロジェクト概要、セットアップ手順（pnpm install, pnpm dev, pnpm build, pnpm preview）を記載
  - _Requirements: すべての要件に関連_

- [ ] 13.2 CONTRIBUTING.md
  - 記事追加・更新手順（Markdown形式、frontmatter記述、ファイル名規則）を記載
  - _Requirements: 12.2, 12.3_

- [ ] 13.3 DEPLOYMENT.md
  - デプロイ手順（Vercel/Netlify）、環境変数設定（サイトURL、広告フラグ）を記載
  - _Requirements: すべての要件に関連_

- [ ] 14. デプロイ設定とCI/CD
- [ ] 14.1 Vercel/Netlify設定ファイル
  - `vercel.json`または`netlify.toml`でビルドコマンド（`pnpm build && npx pagefind --site dist`）を設定
  - 環境変数サンプル（`.env.example`）を作成
  - _Requirements: すべての要件に関連_

- [ ] 14.2 GitHub Actions（オプション）
  - 自動ビルド・デプロイ、Lighthouse CI、依存関係スキャンを設定
  - _Requirements: 9.1, 9.4_

- [ ] 15. 総合テストと最終検証
- [ ] 15.1 機能テスト
  - ホームページから記事詳細、検索、タグフィルタリング、テーマ切り替えの全フローをテスト
  - モバイル・デスクトップでレスポンシブデザインを検証
  - _Requirements: すべての要件_

- [ ] 15.2 パフォーマンステスト
  - Lighthouse監査で全項目95点以上を確認
  - 100記事を追加し、ビルド時間1分以内を確認
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 15.3 アクセシビリティ検証
  - WCAG AA準拠を確認（コントラスト比、キーボードナビゲーション、スクリーンリーダー対応）
  - _Requirements: 5.4, 5.5, 5.6_
