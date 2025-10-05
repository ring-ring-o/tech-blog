# パフォーマンス最適化ガイド

## 目標値

### Lighthouse スコア
- **Performance**: 95点以上
- **Accessibility**: 95点以上
- **Best Practices**: 95点以上
- **SEO**: 95点以上

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: 2.5秒以内
- **FID (First Input Delay)**: 100ms以内
- **CLS (Cumulative Layout Shift)**: 0.1以下

### バンドルサイズ
- **初期ロード**: gzip圧縮後100KB以内 ✅ (現在: 約24KB)
- **ビルド時間**: 100記事で1分以内

## Lighthouse監査の実行

### ローカル環境

```bash
# 1. プロダクションビルド
pnpm build

# 2. プレビューサーバー起動
pnpm preview

# 3. Chrome DevToolsでLighthouse実行
# - Chrome DevToolsを開く (F12)
# - Lighthouseタブを選択
# - カテゴリを選択
# - Analyze page load を実行
```

### CI/CD環境

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: pnpm/action-setup@v3
        with:
          version: 10

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:4321
            http://localhost:4321/about
            http://localhost:4321/posts/2025-01-15-astro-blog-tutorial
          uploadArtifacts: true
```

## 実装済み最適化

### 1. 静的サイト生成
- ✅ Astro 5の完全静的出力
- ✅ ビルド時のプリレンダリング
- ✅ ゼロJavaScriptデフォルト

### 2. CSS最適化
- ✅ Tailwind CSS v4のViteプラグイン
- ✅ 使用していないCSSの自動削除
- ✅ CSS変数によるテーマ管理

### 3. JavaScript最適化
- ✅ Islands Architecture（必要な箇所のみJS）
- ✅ コード分割（search.js, ui-core.js）
- ✅ 遅延ロード（Pagefind UI）

### 4. 画像最適化
- ✅ OptimizedImageコンポーネント
- ✅ 遅延ローディング（loading="lazy"）
- ✅ WebP形式の推奨
- ✅ 最大幅1200px制限

### 5. アクセシビリティ
- ✅ セマンティックHTML
- ✅ ARIAラベル
- ✅ キーボードナビゲーション
- ✅ フォーカスインジケーター

### 6. SEO
- ✅ メタタグ（description, OG, Twitter Card）
- ✅ 構造化データ（BlogPosting, Blog, Person schema）
- ✅ sitemap.xml自動生成
- ✅ robots.txt
- ✅ canonical URL

## パフォーマンス改善チェックリスト

### 初期ロード時
- [ ] ATF（Above The Fold）画像を`loading="eager"`に設定
- [ ] クリティカルCSSをインライン化（必要に応じて）
- [ ] フォント読み込みの最適化（font-display: swap）

### ランタイム
- [ ] 長いタスクを分割（50ms以内）
- [ ] イベントリスナーのパッシブ化
- [ ] スクロールイベントのデバウンス

### ビルド時
- [ ] 100記事でのビルド時間測定
- [ ] 不要な依存関係の削除
- [ ] ソースマップの無効化（本番環境）

## トラブルシューティング

### LCPが遅い
1. ATF画像を最適化
2. `loading="eager"`を設定
3. 画像サイズを確認（1200px以下）
4. CDNを使用

### CLSが高い
1. 画像にwidth/height属性を追加
2. フォント読み込みを最適化
3. 動的コンテンツの領域を事前確保

### FIDが高い
1. JavaScriptの実行時間を短縮
2. Web Workerの使用を検討
3. コード分割を追加

### バンドルサイズが大きい
1. 不要な依存関係を削除
2. 動的インポートを使用
3. tree-shakingを有効化

## 監視とモニタリング

### 本番環境
- Google Analytics 4
- Core Web Vitals レポート
- Search Console

### 開発環境
- Chrome DevTools Performance
- Lighthouse CI
- Web Vitals拡張機能

## 参考リンク

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse](https://developer.chrome.com/docs/lighthouse/)
- [Astro Performance](https://docs.astro.build/en/guides/performance/)
