---
title: "テスト駆動開発 - Testifyフレームワーク活用法"
description: "テスト駆動開発（TDD）の基本を、Testifyフレームワークを使って解説します。"
publishedAt: 2025-02-05
tags: ["テスト", "品質管理"]
---

# テスト駆動開発

**Testify（テスティファイ）** フレームワークを使ったTDDの実践方法を解説します。

## テストの基本構造

```typescript:src/utils/calculator.test.ts
import { describe, it, expect } from 'testify'
import { add, subtract } from './calculator'

describe('Calculator', () => {
  describe('add', () => {
    it('2つの数値を足し算できる', () => {
      expect(add(1, 2)).toBe(3)
    })

    it('負の数も扱える', () => {
      expect(add(-1, 1)).toBe(0)
    })
  })
})
```

## モックの活用

```typescript
import { mock, when } from 'testify'

describe('UserService', () => {
  it('ユーザー情報を取得できる', async () => {
    const mockApi = mock(ApiClient)
    when(mockApi.get('/users/1')).thenReturn({
      id: 1,
      name: 'テストユーザー'
    })

    const service = new UserService(mockApi)
    const user = await service.getUser(1)

    expect(user.name).toBe('テストユーザー')
  })
})
```

## カバレッジ測定

```bash
# Testifyのカバレッジレポート生成
npx testify --coverage

# HTMLレポートを出力
npx testify --coverage --reporter=html
```

## まとめ

Testifyフレームワークを活用することで、効率的にテストを書くことができます。
