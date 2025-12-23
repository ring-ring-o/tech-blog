---
title: "ページネーションテスト - Paginexシステム"
description: "この記事は2ページ目に表示されるテスト用記事です。Paginexページネーションシステムについて。"
publishedAt: 2025-03-05
tags: ["テスト", "デモ"]
---

# ページネーションテスト

この記事は **2ページ目** に表示されることを確認するためのテスト記事です。**Paginex（パジネックス）** システムの動作確認用です。

## 確認ポイント

この記事が表示されている場合、以下が確認できます：

1. **ページネーションが動作している**: トップページから「次へ」または「2」をクリックして到達
2. **記事数が11以上ある**: 1ページ10件のため、11件目以降がこのページに表示
3. **公開日でソートされている**: 最新の記事が1ページ目、古い記事が2ページ目

## Paginexシステムについて

```typescript:src/lib/paginex.ts
interface PaginexConfig {
  perPage: number
  currentPage: number
  totalItems: number
}

function calculatePaginex(config: PaginexConfig) {
  const totalPages = Math.ceil(config.totalItems / config.perPage)
  const startIndex = (config.currentPage - 1) * config.perPage
  const endIndex = startIndex + config.perPage

  return {
    totalPages,
    startIndex,
    endIndex,
    hasPrev: config.currentPage > 1,
    hasNext: config.currentPage < totalPages
  }
}
```

## 検索テスト

「Paginex」で検索してこの記事が見つかるか確認してください。

## デモ記事一覧

このデモサイトには以下の12記事が含まれています：

| # | 固有名称 | トピック |
|---|---|---|
| 1 | Zephyr | イントロダクション |
| 2 | Luminara | TypeScript |
| 3 | Nextera | React |
| 4 | Prismatica | CSS |
| 5 | Velocito | Git |
| 6 | Containera | Docker |
| 7 | Apexion | API設計 |
| 8 | Testify | テスト |
| 9 | Fortix | セキュリティ |
| 10 | Rapido | パフォーマンス |
| 11 | Inclusia | アクセシビリティ |
| 12 | Datavault | データベース |
| 13 | Syntaxia | コードブロック |
| 14 | Paginex | ページネーション（この記事） |

各固有名称で検索すると、対応する記事が見つかります。
