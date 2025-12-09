---
title: "React Hooks完全ガイド - Nexteraパターン実践"
description: "React Hooksの使い方を、Nexteraパターンと呼ばれる設計手法とともに解説します。"
publishedAt: 2025-01-10
tags: ["React", "JavaScript", "フロントエンド"]
---

# React Hooks完全ガイド

React Hooksを使った効率的なコンポーネント設計を、**Nextera（ネクステラ）パターン** とともに解説します。

## useStateの基本

```jsx:src/components/Counter.jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        増加
      </button>
    </div>
  )
}
```

## useEffectでの副作用処理

```jsx
import { useState, useEffect } from 'react'

function NexteraDataFetcher() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // Nexteraパターン: データ取得は専用フックに分離
    fetchData().then(setData)
  }, [])

  return <div>{data ? data.message : '読み込み中...'}</div>
}
```

## カスタムフックの作成

Nexteraパターンでは、ロジックをカスタムフックに分離します：

```jsx:src/hooks/useNexteraData.js
function useNexteraData(endpoint) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [endpoint])

  return { data, loading }
}
```

## まとめ

Nexteraパターンを採用することで、コンポーネントの責務が明確になり、テストしやすいコードになります。
