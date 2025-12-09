# 広告配置ガイド

## 概要

このブログでは、環境変数で制御可能なオプショナル広告配置機能を提供しています。

## 広告配置箇所

### 1. サイドバー（デスクトップのみ）
- **サイズ**: 300x250px
- **配置**: 記事詳細ページの右サイドバー
- **表示条件**: lg以上の画面幅

### 2. 記事下部
- **サイズ**: 728x90px
- **配置**: 記事本文の直下
- **表示条件**: すべてのデバイス

### 3. フッター上部
- **サイズ**: 970x90px
- **配置**: フッターの上部
- **表示条件**: すべてのデバイス

## 設定方法

### 環境変数

```bash
# .env.local または .env
PUBLIC_ENABLE_ADS=true  # 広告を有効化
# PUBLIC_ENABLE_ADS=false # 広告を無効化（デフォルト）
```

### Vercelでの設定

1. プロジェクト設定を開く
2. Environment Variables セクションへ移動
3. 以下を追加:
   - Key: `PUBLIC_ENABLE_ADS`
   - Value: `true` or `false`
   - Environment: Production, Preview, Development

### Netlifyでの設定

1. サイト設定を開く
2. Build & deploy → Environment へ移動
3. 環境変数を追加:
   - Key: `PUBLIC_ENABLE_ADS`
   - Value: `true` or `false`

## 使用方法

### AdSlotコンポーネント

```astro
---
import AdSlot from '@/components/ads/AdSlot.astro'
---

<!-- 記事下部広告 -->
<AdSlot placement="article-bottom" />

<!-- サイドバー広告 -->
<AdSlot placement="sidebar" />

<!-- フッター上部広告 -->
<AdSlot placement="footer-top" />
```

### プレースメント

| placement | サイズ | 用途 |
|-----------|--------|------|
| `sidebar` | 300x250 | デスクトップサイドバー |
| `article-bottom` | 728x90 | 記事下部バナー |
| `footer-top` | 970x90 | フッター上部リーダーボード |

## 広告コードの統合

### Google AdSense

```astro
<!-- src/components/ads/AdSlot.astro -->
{enableAds && (
  <div class="ad-slot" data-ad-loaded="true">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="ca-pub-XXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"
         data-ad-format="auto"></ins>
    <script>
      (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
  </div>
)}
```

### 他の広告ネットワーク

1. AdSlot.astro を編集
2. 広告ネットワークのコードを挿入
3. `data-ad-loaded="true"` を設定して背景を透明化

## レイアウト保持

### 広告非表示時

- 広告スロットは完全に非表示（`hidden`クラス）
- レイアウトシフトなし
- ページ構造は変化なし

### 広告表示時

- 固定サイズのプレースホルダーを表示
- CLS（Cumulative Layout Shift）を防止
- 読み込み前から領域を確保

## トラブルシューティング

### 広告が表示されない

1. 環境変数が正しく設定されているか確認
   ```bash
   echo $PUBLIC_ENABLE_ADS
   ```

2. ビルドを再実行
   ```bash
   pnpm build
   ```

3. ブラウザのコンソールでエラーを確認

### レイアウトが崩れる

1. AdSlotコンポーネントのサイズ設定を確認
2. CSSの`position`プロパティをチェック
3. `data-ad-loaded`属性が正しく設定されているか確認

### パフォーマンスへの影響

1. 広告スクリプトを遅延ロード
2. `loading="lazy"`属性を使用
3. 広告ネットワークの最適化設定を有効化

## ベストプラクティス

1. **控えめな配置**: 読者体験を最優先
2. **適切なサイズ**: デバイスに合わせたサイズ選択
3. **パフォーマンス監視**: Lighthouse スコアを維持
4. **透明性**: プライバシーポリシーで広告について明示

## 関連ファイル

- `/src/components/ads/AdSlot.astro` - 広告スロットコンポーネント
- `/src/pages/posts/[slug].astro` - 記事詳細ページ（記事下部広告）
- `/src/components/layout/Footer.astro` - フッター（フッター上部広告）
- `/.env.example` - 環境変数サンプル
