---
title: "JavaScript非同期処理パターン"
description: "Promise、async/awaitの使い方"
publishedAt: 2025-03-08
tags: ["JavaScript", "非同期処理"]
draft: false
---

# JavaScript非同期処理パターン

非同期処理の基本パターンを解説します。

## async/await

```javascript
async function fetchData() {
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error(error)
  }
}
```

## まとめ

async/awaitで読みやすい非同期処理を書きましょう。
