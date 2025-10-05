---
title: "ユニットテスト入門"
description: "テストの基本とベストプラクティス"
publishedAt: 2025-03-04
tags: ["テスト", "品質管理"]
draft: false
---

# ユニットテスト入門

ユニットテストの基本を解説します。

## テストの書き方

```javascript
describe('Calculator', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).toBe(5)
  })
})
```

## まとめ

テストを書いて品質を保ちましょう。
