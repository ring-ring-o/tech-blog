# 記事の書き方ガイド

このガイドでは、ブログ記事を作成する際のMarkdown記法とフロントマターの書き方を説明します。

## 目次

1. [記事ファイルの基本](#記事ファイルの基本)
2. [フロントマター](#フロントマター)
3. [Markdown記法](#markdown記法)
4. [コードブロック](#コードブロック)
5. [記事のベストプラクティス](#記事のベストプラクティス)

---

## 記事ファイルの基本

### ファイル配置

```
src/content/blog/
├── 2025-01-15-article-slug.md    # 本番用記事
└── ...
```

### ファイル名の命名規則

```
YYYY-MM-DD-slug-name.md
```

- `YYYY-MM-DD`: 公開日（例: `2025-01-15`）
- `slug-name`: URL用スラッグ（英数字・ハイフン）

例:
- `2025-01-15-typescript-basics.md`
- `2025-02-01-react-hooks-guide.md`

---

## フロントマター

記事の先頭に`---`で囲んだYAML形式のメタデータを記述します。

### 必須フィールド

```yaml
---
title: "記事タイトル"
description: "記事の概要・説明文（SEO用に表示されます）"
publishedAt: 2025-01-15
tags: ["TypeScript", "React"]
---
```

### オプションフィールド

```yaml
---
title: "記事タイトル"
description: "記事の概要・説明文"
publishedAt: 2025-01-15
updatedAt: 2025-01-20          # 更新日（任意）
tags: ["TypeScript", "React"]
draft: true                    # 下書きフラグ（デフォルト: false）
---
```

### フィールド詳細

| フィールド | 必須 | 制限 | 説明 |
|-----------|------|------|------|
| `title` | 必須 | 1〜200文字 | 記事タイトル |
| `description` | 必須 | 1〜300文字 | 記事の概要（検索結果やOGPで使用） |
| `publishedAt` | 必須 | 日付形式 | 公開日 |
| `updatedAt` | 任意 | 日付形式 | 更新日 |
| `tags` | 必須 | 1〜10個 | タグ配列 |
| `draft` | 任意 | boolean | 下書き（trueで非公開） |

---

## Markdown記法

### 見出し

```markdown
# 大見出し（h1）- 記事タイトルに使用
## 中見出し（h2）
### 小見出し（h3）
#### 更に小さい見出し（h4）
```

### テキスト装飾

```markdown
**太字（ボールド）**
*斜体（イタリック）*
~~取り消し線~~
`インラインコード`
```

### リスト

```markdown
# 箇条書きリスト
- アイテム1
- アイテム2
  - ネストしたアイテム

# 番号付きリスト
1. 最初のステップ
2. 次のステップ
3. 最後のステップ
```

### リンク

```markdown
[リンクテキスト](https://example.com)
[相対リンク](/about)
```

### 画像

```markdown
![代替テキスト](/images/example.png)
```

### 引用

```markdown
> これは引用文です。
> 複数行にわたる引用もできます。
```

### テーブル

```markdown
| 列1 | 列2 | 列3 |
|-----|-----|-----|
| データ1 | データ2 | データ3 |
| データ4 | データ5 | データ6 |
```

### 水平線

```markdown
---
```

---

## コードブロック

### 基本的なコードブロック（言語のみ指定）

言語を指定するとシンタックスハイライトが適用されます。ヘッダーには言語名が表示されます。

````markdown
```javascript
const greeting = 'Hello, World!'
console.log(greeting)
```
````

### ファイル名付きコードブロック

言語の後に`:ファイルパス`を追加すると、ヘッダーにファイル名が表示されます。

````markdown
```typescript:src/utils/helper.ts
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ja-JP')
}
```
````

### 対応言語一覧

| 言語識別子 | 表示名 |
|-----------|-------|
| `javascript` | JavaScript |
| `typescript` | TypeScript |
| `python` | Python |
| `bash` | Bash |
| `shell` | Shell |
| `json` | JSON |
| `yaml` | YAML |
| `html` | HTML |
| `css` | CSS |
| `sql` | SQL |
| `markdown` | Markdown |
| `go` | Go |
| `rust` | Rust |
| `java` | Java |
| `diff` | Diff |
| `text` | Text |

### コードブロックの例

**ファイル名なし（言語のみ）:**

````markdown
```bash
npm install package-name
```
````

**ファイル名あり:**

````markdown
```typescript:src/components/Button.tsx
interface ButtonProps {
  label: string
  onClick: () => void
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>
}
```
````

**設定ファイル:**

````markdown
```json:package.json
{
  "name": "my-app",
  "version": "1.0.0"
}
```
````

---

## 記事のベストプラクティス

### 構成

1. **導入部**: 記事の概要と読者が得られる知識を簡潔に説明
2. **本文**: 見出しで区切り、段階的に解説
3. **まとめ**: 重要なポイントの要約

### タイトルの付け方

- 具体的で検索しやすいタイトルにする
- 「〜の方法」「〜入門」「〜ガイド」などを活用

良い例:
- `TypeScript入門 - 型安全なJavaScript開発`
- `React Hooks完全ガイド - useStateからカスタムHooksまで`

### 説明文（description）の書き方

- 記事の内容を1〜2文で簡潔に説明
- 検索結果やSNSシェア時に表示されることを意識

### タグの選び方

- 技術名・フレームワーク名を優先（例: `React`, `TypeScript`）
- カテゴリを補助的に追加（例: `フロントエンド`, `テスト`）
- 1〜5個程度が適切

### コードの書き方

- 実行可能なコードを記載
- コメントで補足説明を追加
- ファイル名を指定して、どこに配置するか明確に

---

## テンプレート

新しい記事を作成する際のテンプレート:

```markdown
---
title: "記事タイトルをここに"
description: "記事の概要を1〜2文で記述"
publishedAt: 2025-01-15
tags: ["タグ1", "タグ2"]
---

# 記事タイトル

導入文をここに書きます。この記事で何を学べるかを簡潔に説明します。

## セクション1

本文を書きます。

### サブセクション

詳細な説明を追加します。

```typescript:src/example.ts
// コード例
const example = 'Hello'
```

## セクション2

次のトピックについて説明します。

## まとめ

記事の要点をまとめます。
```
