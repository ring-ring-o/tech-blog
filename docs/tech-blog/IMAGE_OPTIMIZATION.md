# 画像最適化ガイド

## 概要

このプロジェクトでは、Astro 5の画像最適化機能を活用しています。

## 推奨フォーマット

- **WebP**: 優先的に使用（ファイルサイズが小さく、品質が高い）
- **JPEG/PNG**: 互換性が必要な場合に使用
- **SVG**: アイコンやロゴに使用

## 画像の配置

### 静的画像

`public/images/` ディレクトリに配置:

```
public/
└── images/
    ├── posts/          # 記事内の画像
    ├── og/             # OGP画像
    └── common/         # 共通画像
```

### 使用方法

#### 基本的な使用

```astro
---
import OptimizedImage from '@/components/common/OptimizedImage.astro'
---

<OptimizedImage
  src="/images/posts/example.webp"
  alt="説明文"
  width={1200}
  height={630}
/>
```

#### 遅延ローディング（デフォルト）

```astro
<OptimizedImage
  src="/images/posts/example.webp"
  alt="説明文"
  loading="lazy"
/>
```

#### 即座にローディング（ATF画像）

```astro
<OptimizedImage
  src="/images/hero.webp"
  alt="ヒーロー画像"
  loading="eager"
/>
```

## 最適化のベストプラクティス

### 1. 適切なサイズ

- **最大幅**: 1200px
- **OGP画像**: 1200x630px
- **サムネイル**: 600x315px

### 2. ファイルサイズ

- **目標**: 100KB以下（WebP）
- **圧縮ツール**: Squoosh, ImageOptim, TinyPNG

### 3. レスポンシブ画像

```astro
<OptimizedImage
  src="/images/posts/example.webp"
  alt="説明文"
  width={1200}
  class="w-full h-auto"
/>
```

### 4. alt属性

- 必ず意味のある説明文を記載
- 装飾的な画像の場合は `alt=""` を使用

## パフォーマンス監視

### Lighthouse監査

```bash
# 開発サーバー起動
pnpm dev

# Lighthouseで監査（Chrome DevTools）
```

### 目標値

- **LCP**: 2.5秒以内
- **CLS**: 0.1以下
- **画像最適化スコア**: 90点以上

## 画像変換スクリプト

### PNGをWebPに変換

```bash
# ImageMagickを使用
convert input.png -quality 85 output.webp

# cwebpを使用
cwebp -q 85 input.png -o output.webp
```

### 一括変換

```bash
# すべてのPNGをWebPに変換
for file in *.png; do
  cwebp -q 85 "$file" -o "${file%.png}.webp"
done
```

## トラブルシューティング

### 画像が表示されない

1. パスが正しいか確認（`public/`は省略）
2. ファイル名の大文字小文字を確認
3. ビルド後に`dist/`ディレクトリを確認

### パフォーマンスが悪い

1. 画像サイズを確認（1200px以下）
2. WebP形式を使用
3. `loading="lazy"` を設定
4. 不要な画像を削除
