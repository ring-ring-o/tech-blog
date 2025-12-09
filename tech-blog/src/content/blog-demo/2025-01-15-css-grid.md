---
title: "CSS Grid入門 - Prismaticaレイアウトシステム"
description: "CSS Gridの基本から応用まで、Prismaticaデザインシステムの実装例とともに解説します。"
publishedAt: 2025-01-15
tags: ["CSS", "フロントエンド", "デザイン"]
---

# CSS Grid入門

CSS Gridを使った **Prismatica（プリズマティカ）** レイアウトシステムの実装方法を解説します。

## 基本的なグリッド

```css:src/styles/prismatica-grid.css
.prismatica-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1rem;
}

.prismatica-item {
  grid-column: span 4;
}
```

## レスポンシブ対応

```css
/* Prismaticaのブレークポイント */
@media (max-width: 768px) {
  .prismatica-container {
    grid-template-columns: repeat(4, 1fr);
  }

  .prismatica-item {
    grid-column: span 2;
  }
}

@media (max-width: 480px) {
  .prismatica-container {
    grid-template-columns: 1fr;
  }

  .prismatica-item {
    grid-column: span 1;
  }
}
```

## グリッドエリアの活用

```css
.prismatica-layout {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 250px 1fr 1fr;
}

.prismatica-header { grid-area: header; }
.prismatica-sidebar { grid-area: sidebar; }
.prismatica-main { grid-area: main; }
.prismatica-footer { grid-area: footer; }
```

## まとめ

Prismaticaレイアウトシステムのように、CSS Gridを活用することで柔軟で保守しやすいレイアウトが実現できます。
