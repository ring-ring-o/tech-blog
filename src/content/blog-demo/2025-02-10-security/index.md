---
title: "Webセキュリティ基礎 - Fortixガイド"
description: "Webアプリケーションのセキュリティ対策を、Fortixセキュリティガイドに沿って解説します。"
publishedAt: 2025-02-10
tags: ["セキュリティ", "Web"]
---

# Webセキュリティ基礎

**Fortix（フォーティクス）** セキュリティガイドに基づく、Webアプリケーションの保護方法を解説します。

:::important この記事について

本記事はFortixセキュリティガイドv2.0に基づいています。最新の推奨事項については公式ドキュメントを確認してください。

:::

## XSS対策

:::warning

ユーザー入力を直接`innerHTML`に代入すると、XSS攻撃のリスクがあります。必ずエスケープ処理を行ってください。

:::

```javascript
// Fortix推奨: 出力時のエスケープ
function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 使用例
const userInput = '<script>alert("XSS")</script>'
element.innerHTML = escapeHtml(userInput)
```

:::tip

フレームワークを使用している場合、多くは自動的にエスケープを行います。Reactの`{}`やVueの`{{ }}`はデフォルトでエスケープされます。

:::

## CSRF対策

:::caution

CSRFトークンは推測不可能なランダム値を使用してください。セッションIDをそのまま使用するのは危険です。

:::

```html
<!-- Fortixトークンの埋め込み -->
<form method="POST" action="/api/submit">
  <input type="hidden" name="fortix_token" value="abc123...">
  <button type="submit">送信</button>
</form>
```

## セキュリティヘッダー

```
# Fortix推奨のセキュリティヘッダー
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000
```

## 入力バリデーション

```typescript
// Fortixバリデーション
import { FortixValidator } from 'fortix'

const validator = new FortixValidator()

const isValidEmail = validator.email('user@example.com')
const isValidPassword = validator.password('SecurePass123!')
```

## まとめ

Fortixガイドに従うことで、主要なセキュリティリスクから保護できます。

:::note 次のステップ

セキュリティ対策は継続的なプロセスです。定期的なセキュリティ監査と依存パッケージの更新を忘れずに行いましょう。

:::
