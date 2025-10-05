---
title: "React Hooks完全ガイド"
description: "useStateからuseEffectまで、React Hooksの基本を実例とともに解説します"
publishedAt: 2025-01-25
updatedAt: 2025-01-25
tags: ["React", "JavaScript", "フロントエンド"]
draft: false
---

# React Hooks完全ガイド

React 16.8で導入されたHooksは、関数コンポーネントで状態管理や副作用処理を可能にする画期的な機能です。本記事では、主要なHooksの使い方を実例とともに解説します。

## 目次

1. useState - 状態管理の基本
2. useEffect - 副作用処理
3. useContext - グローバル状態管理
4. カスタムHooksの作成

## useState - 状態管理の基本

`useState`は最も基本的なHookで、コンポーネント内で状態を管理します。

```jsx
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        増やす
      </button>
    </div>
  )
}
```

### 複数の状態管理

複数の状態を管理する場合は、`useState`を複数回呼び出します:

```jsx
function UserProfile() {
  const [name, setName] = useState('')
  const [age, setAge] = useState(0)
  const [email, setEmail] = useState('')

  // ...
}
```

## useEffect - 副作用処理

`useEffect`は、データフェッチやDOM操作などの副作用を処理します。

```jsx
import { useState, useEffect } from 'react'

function UserData({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const response = await fetch(`/api/users/${userId}`)
      const data = await response.json()
      setUser(data)
      setLoading(false)
    }

    fetchUser()
  }, [userId]) // userIdが変更されたときに再実行

  if (loading) return <p>読み込み中...</p>
  return <div>{user.name}</div>
}
```

### クリーンアップ処理

副作用のクリーンアップが必要な場合は、関数を返します:

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log('Tick')
  }, 1000)

  return () => clearInterval(timer) // クリーンアップ
}, [])
```

## useContext - グローバル状態管理

`useContext`を使用すると、プロップドリリングなしでグローバル状態にアクセスできます。

```jsx
import { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

function App() {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
      <Main />
    </ThemeContext.Provider>
  )
}

function Header() {
  const { theme, setTheme } = useContext(ThemeContext)

  return (
    <header className={theme}>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        テーマ切り替え
      </button>
    </header>
  )
}
```

## カスタムHooksの作成

ロジックを再利用可能なカスタムHooksとして抽出できます:

```jsx
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

// 使用例
function Settings() {
  const [settings, setSettings] = useLocalStorage('settings', {
    notifications: true,
    theme: 'light'
  })

  // ...
}
```

## ベストプラクティス

React Hooksを使用する際の重要なポイント:

- **Hooksのルール**: コンポーネントのトップレベルでのみ呼び出す
- **依存配列**: `useEffect`の依存配列は正確に指定する
- **関数の分割**: 大きなコンポーネントは小さなカスタムHooksに分割
- **パフォーマンス**: `useMemo`と`useCallback`で最適化

> **注意**: Hooksはクラスコンポーネントでは使用できません。関数コンポーネントのみで使用してください。

## まとめ

React Hooksは、関数コンポーネントをより強力で柔軟にします。主要なHooksを理解し、適切に使用することで、保守性の高いReactアプリケーションを構築できます。

次のステップとして、以下のHooksも学習することをお勧めします:

1. `useReducer` - 複雑な状態管理
2. `useMemo` - メモ化による最適化
3. `useCallback` - コールバック関数の最適化
4. `useRef` - DOM参照と値の保持

Happy coding! 🚀
