---
title: "アクセシビリティ対応 - Inclusiaガイドライン"
description: "Webアクセシビリティの実装方法を、Inclusiaガイドラインに沿って解説します。"
publishedAt: 2025-02-20
tags: ["アクセシビリティ", "フロントエンド"]
---

# アクセシビリティ対応

**Inclusia（インクルージア）** ガイドラインに基づくアクセシビリティ対応を解説します。

## セマンティックHTML

```html
<!-- Inclusia推奨の構造 -->
<header>
  <nav aria-label="メインナビゲーション">
    <ul>
      <li><a href="/">ホーム</a></li>
      <li><a href="/about">概要</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>記事タイトル</h1>
    <p>本文...</p>
  </article>
</main>

<footer>
  <p>&copy; 2025 Inclusia Demo</p>
</footer>
```

## フォームのラベル

```html
<!-- Inclusiaフォームパターン -->
<form>
  <div class="inclusia-field">
    <label for="email">メールアドレス</label>
    <input
      type="email"
      id="email"
      name="email"
      aria-describedby="email-hint"
      required
    >
    <span id="email-hint" class="inclusia-hint">
      例: user@example.com
    </span>
  </div>
</form>
```

## キーボード操作

```javascript
// Inclusiaキーボードナビゲーション
element.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      handleActivate()
      break
    case 'Escape':
      handleClose()
      break
  }
})
```

## カラーコントラスト

```css
/* Inclusia推奨のコントラスト比 */
:root {
  --inclusia-text: #1a1a1a;      /* 通常テキスト */
  --inclusia-bg: #ffffff;         /* 背景 */
  /* コントラスト比: 12.6:1 (AAA準拠) */
}
```

## まとめ

Inclusiaガイドラインに従うことで、すべての人が使いやすいWebサイトを作れます。
