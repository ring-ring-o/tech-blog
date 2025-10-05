---
title: "Astro 5でブログを構築する"
description: "Astro 5.xとTailwind CSS v4を使った技術ブログの構築手順を解説"
publishedAt: 2025-01-15
updatedAt: 2025-01-20
tags: ["Astro", "TypeScript", "Tailwind CSS"]
draft: false
---

# Astro 5でブログを構築する

Astro 5.xは、コンテンツ重視の高速なWebサイトを構築するための最新フレームワークです。本記事では、Astro 5とTailwind CSS v4を使った技術ブログの構築手順を解説します。

## Astroの特徴

Astro 5の主な特徴は以下の通りです:

- **ゼロJavaScriptデフォルト**: 静的HTMLを生成し、必要な箇所のみJavaScriptを読み込む
- **Content Collections API**: 型安全なコンテンツ管理
- **Islands Architecture**: 部分的なインタラクティビティを実現

## プロジェクトのセットアップ

Astroプロジェクトを初期化するには、以下のコマンドを実行します:

```bash:setup.sh
pnpm create astro@latest my-blog --template minimal
cd my-blog
pnpm install
```

## Tailwind CSS v4の統合

Tailwind CSS v4は、Astro 5.2でViteプラグインとしてネイティブサポートされました。

```typescript:astro.config.mjs
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
})
```

## まとめ

Astro 5とTailwind CSS v4を組み合わせることで、高速で保守性の高い技術ブログを構築できます。次回は、Content Collectionsを使った記事管理の詳細を解説します。
