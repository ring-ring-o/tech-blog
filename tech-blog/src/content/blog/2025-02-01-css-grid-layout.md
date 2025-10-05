---
title: "CSS Grid完全マスター"
description: "CSS Gridの基本から応用まで、レスポンシブレイアウトの実装方法を詳しく解説"
publishedAt: 2025-02-01
updatedAt: 2025-02-01
tags: ["CSS", "レイアウト", "フロントエンド"]
draft: false
---

# CSS Grid完全マスター

CSS Gridは、2次元レイアウトを簡単に実装できる強力な機能です。本記事では、基本から応用まで、実践的な例とともに解説します。

## CSS Gridとは

CSS Gridは、行と列を定義してアイテムを配置する2次元レイアウトシステムです。Flexboxが1次元（行または列）なのに対し、Gridは行と列の両方を同時に制御できます。

### FlexboxとGridの使い分け

```css
/* Flexbox: 1次元レイアウト */
.flex-container {
  display: flex;
  gap: 1rem;
}

/* Grid: 2次元レイアウト */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
```

## 基本的なGrid構文

### グリッドコンテナの定義

```css
.container {
  display: grid;

  /* 列の定義 */
  grid-template-columns: 200px 1fr 200px;

  /* 行の定義 */
  grid-template-rows: auto 1fr auto;

  /* グリッド間の余白 */
  gap: 20px;
  /* または個別に */
  row-gap: 20px;
  column-gap: 10px;
}
```

### fr単位とrepeat関数

`fr`（fraction）単位は、利用可能なスペースを分割します:

```css
.grid {
  /* 3列の等幅グリッド */
  grid-template-columns: 1fr 1fr 1fr;

  /* repeat関数で簡潔に */
  grid-template-columns: repeat(3, 1fr);

  /* 異なる比率 */
  grid-template-columns: 2fr 1fr 1fr; /* 2:1:1 */

  /* 固定幅と可変幅の組み合わせ */
  grid-template-columns: 200px 1fr 200px;
}
```

## レスポンシブグリッド

### auto-fitとauto-fill

```css
.responsive-grid {
  display: grid;

  /* 最小200px、最大1frの列を自動生成 */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}
```

**auto-fitとauto-fillの違い:**

- `auto-fill`: グリッドを埋めるために空の列を作成
- `auto-fit`: アイテムを拡張して空のスペースを埋める

```css
/* auto-fill: 空の列が残る */
.grid-fill {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* auto-fit: アイテムが拡張される */
.grid-fit {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

### メディアクエリとの組み合わせ

```css
.adaptive-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 640px) {
  .adaptive-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .adaptive-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## グリッドアイテムの配置

### grid-columnとgrid-row

```css
.item-1 {
  /* 1列目から3列目まで（2列分） */
  grid-column: 1 / 3;
  /* または */
  grid-column: span 2;
}

.item-2 {
  /* 2行目から4行目まで（3行分） */
  grid-row: 2 / 5;
  /* または */
  grid-row: span 3;
}

.item-3 {
  /* 2列目から3列目、1行目から3行目 */
  grid-column: 2 / 3;
  grid-row: 1 / 3;
}
```

### Grid Template Areas

より直感的な配置方法:

```css
.layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header  header"
    "sidebar content aside"
    "footer  footer  footer";
  gap: 1rem;
  min-height: 100vh;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.content { grid-area: content; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

レスポンシブ対応:

```css
@media (max-width: 768px) {
  .layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "content"
      "sidebar"
      "aside"
      "footer";
  }
}
```

## 実践例: カードグリッドレイアウト

```html
<div class="card-grid">
  <article class="card">
    <img src="image1.jpg" alt="記事1">
    <h3>記事タイトル1</h3>
    <p>説明文...</p>
  </article>
  <!-- 他のカード... -->
</div>
```

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  display: grid;
  grid-template-rows: auto 1fr auto;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card h3 {
  padding: 1rem 1rem 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.card p {
  padding: 0 1rem 1rem;
  color: #6b7280;
}
```

## 実践例: ダッシュボードレイアウト

```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(100px, auto);
  gap: 1rem;
  padding: 1rem;
}

.widget-large {
  grid-column: span 8;
  grid-row: span 2;
}

.widget-medium {
  grid-column: span 4;
  grid-row: span 2;
}

.widget-small {
  grid-column: span 4;
  grid-row: span 1;
}

/* レスポンシブ */
@media (max-width: 1024px) {
  .widget-large,
  .widget-medium,
  .widget-small {
    grid-column: span 12;
  }
}
```

## パフォーマンスのヒント

1. **暗黙的グリッドの活用**
   ```css
   .auto-grid {
     display: grid;
     grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
     grid-auto-rows: 200px; /* 自動生成される行の高さ */
   }
   ```

2. **subgridの使用**（モダンブラウザ）
   ```css
   .parent {
     display: grid;
     grid-template-columns: repeat(3, 1fr);
   }

   .child {
     display: grid;
     grid-template-columns: subgrid; /* 親のグリッドを継承 */
   }
   ```

3. **content-visibilityの活用**
   ```css
   .grid-item {
     content-visibility: auto;
     contain-intrinsic-size: 300px; /* 初期サイズのヒント */
   }
   ```

## ブラウザサポート

CSS Gridは、主要なモダンブラウザで広くサポートされています:

- ✅ Chrome 57+
- ✅ Firefox 52+
- ✅ Safari 10.1+
- ✅ Edge 16+

> **注意**: IE11は古い仕様の部分的サポートのみ。プロダクション環境では注意が必要です。

## まとめ

CSS Gridは、複雑なレイアウトを簡潔なコードで実装できる強力なツールです。主なポイント:

1. **2次元レイアウト**に最適
2. **レスポンシブデザイン**が容易
3. **Grid Template Areas**で直感的な配置
4. **auto-fit/auto-fill**で柔軟なカラム数

次のステップ:
- [ ] Grid Playgroundで実験する
- [ ] 既存のFlexboxレイアウトをGridに置き換える
- [ ] subgridとcontainer queriesを学ぶ

CSS Gridをマスターして、より洗練されたレイアウトを実装しましょう! 🎨
