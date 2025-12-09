---
title: "コードブロック表示テスト - Syntaxiaライブラリ"
description: "ファイル名なしのコードブロック表示をテストする記事です。Syntaxiaライブラリの使用例を紹介。"
publishedAt: 2025-03-01
tags: ["テスト", "デモ"]
---

# コードブロック表示テスト

この記事は、ファイル名を指定しないコードブロックの表示テスト用です。**Syntaxia（シンタクシア）** ライブラリのサンプルコードを掲載しています。

## ファイル名なしのコードブロック

以下のコードブロックは、言語のみを指定しています（ファイル名なし）。ヘッダーには言語名が表示されます。

```javascript
// Syntaxiaの基本的な使用例
const syntaxia = require('syntaxia')

const result = syntaxia.parse('const x = 1')
console.log(result.ast)
```

```typescript
// TypeScriptでの使用
import { Syntaxia } from 'syntaxia'

const parser = new Syntaxia()
const tokens = parser.tokenize('let y: number = 2')
```

```python
# Pythonバインディング
from syntaxia import Parser

parser = Parser()
ast = parser.parse("def hello(): pass")
```

```bash
# インストールコマンド
npm install syntaxia
```

```json
{
  "name": "syntaxia-demo",
  "version": "1.0.0"
}
```

## ファイル名ありとの比較

こちらはファイル名を指定したコードブロックです：

```javascript:src/syntaxia-example.js
// ファイル名付きの例
import { highlight } from 'syntaxia'

export function highlightCode(code) {
  return highlight(code, { theme: 'dark' })
}
```

## まとめ

Syntaxiaライブラリを使うことで、様々な言語のコードを美しく表示できます。検索で「Syntaxia」を入力してこの記事が見つかるか確認してください。
