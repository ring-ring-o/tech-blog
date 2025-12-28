# 記事の書き方ガイド

このガイドでは、ブログ記事を作成する際の Markdown 記法とフロントマターの書き方を説明します。

## 目次

1. [記事ファイルの基本](#記事ファイルの基本)
2. [フロントマター](#フロントマター)
3. [Markdown 記法](#markdown記法)
4. [コードブロック](#コードブロック)
5. [Callout（補足情報ブロック）](#callout補足情報ブロック)
6. [記事のベストプラクティス](#記事のベストプラクティス)

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
- `slug-name`: URL 用スラッグ（英数字・ハイフン）

例:

- `2025-01-15-typescript-basics.md`
- `2025-02-01-react-hooks-guide.md`

---

## フロントマター

記事の先頭に`---`で囲んだ YAML 形式のメタデータを記述します。

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
updatedAt: 2025-01-20 # 更新日（任意）
tags: ["TypeScript", "React"]
draft: true # 下書きフラグ（デフォルト: false）
---
```

### フィールド詳細

| フィールド    | 必須 | 制限        | 説明                                |
| ------------- | ---- | ----------- | ----------------------------------- |
| `title`       | 必須 | 1〜200 文字 | 記事タイトル                        |
| `description` | 必須 | 1〜300 文字 | 記事の概要（検索結果や OGP で使用） |
| `publishedAt` | 必須 | 日付形式    | 公開日                              |
| `updatedAt`   | 任意 | 日付形式    | 更新日                              |
| `tags`        | 必須 | 1〜10 個    | タグ配列                            |
| `draft`       | 任意 | boolean     | 下書き（true で非公開）             |

---

## Markdown 記法

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
_斜体（イタリック）_
~~取り消し線~~
`インラインコード`
```

### リスト

```markdown
# 箇条書きリスト

- アイテム 1
- アイテム 2
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
| 列 1     | 列 2     | 列 3     |
| -------- | -------- | -------- |
| データ 1 | データ 2 | データ 3 |
| データ 4 | データ 5 | データ 6 |
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
const greeting = "Hello, World!";
console.log(greeting);
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

| 言語識別子   | 表示名     |
| ------------ | ---------- |
| `javascript` | JavaScript |
| `typescript` | TypeScript |
| `python`     | Python     |
| `bash`       | Bash       |
| `shell`      | Shell      |
| `json`       | JSON       |
| `yaml`       | YAML       |
| `html`       | HTML       |
| `css`        | CSS        |
| `sql`        | SQL        |
| `markdown`   | Markdown   |
| `go`         | Go         |
| `rust`       | Rust       |
| `java`       | Java       |
| `diff`       | Diff       |
| `text`       | Text       |

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

## 補足情報ブロック

記事内で警告、ノート、ヒントなどの補足情報を強調表示できます。

### 基本構文

```markdown
:::タイプ タイトル（任意）

内容をここに記述

:::
```

**重要**: 開始タグ（`:::type`）、内容、終了タグ（`:::`）はそれぞれ**空行で区切る**必要があります。

### 対応タイプ

| タイプ      | 用途             | 色  |
| ----------- | ---------------- | --- |
| `note`      | 一般的な補足情報 | 青  |
| `tip`       | ヒント・コツ     | 緑  |
| `warning`   | 警告             | 黄  |
| `caution`   | 注意事項（危険） | 赤  |
| `important` | 重要な情報       | 紫  |

### 使用例

**タイトル付き:**

```markdown
:::warning セキュリティに関する注意

パスワードは環境変数で管理し、コードに直接記載しないでください。

:::
```

**タイトルなし（デフォルトラベル）:**

```markdown
:::tip

`console.log`の代わりに`console.table`を使うと、オブジェクトが見やすくなります。

:::
```

**複数段落:**

```markdown
:::note 開発環境について

このプロジェクトでは Node.js v20 以上が必要です。

パッケージマネージャーは pnpm を推奨しています。

:::
```

**リスト付き:**

```markdown
:::important 必要な準備

以下のツールをインストールしてください:

- Node.js v20 以上
- pnpm
- Docker

:::
```

### 表示例

各タイプは以下のように表示されます:

- **note**: 青色の背景と左ボーダー、ℹ️ アイコン
- **tip**: 緑色の背景と左ボーダー、💡 アイコン
- **warning**: 黄色の背景と左ボーダー、⚠️ アイコン
- **caution**: 赤色の背景と左ボーダー、🚨 アイコン
- **important**: 紫色の背景と左ボーダー、❗ アイコン

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

- 記事の内容を 1〜2 文で簡潔に説明
- 検索結果や SNS シェア時に表示されることを意識

### タグの選び方

- 技術名・フレームワーク名を優先（例: `React`, `TypeScript`）
- カテゴリを補助的に追加（例: `フロントエンド`, `テスト`）
- 1〜5 個程度が適切

### コードの書き方

- 実行可能なコードを記載
- コメントで補足説明を追加
- ファイル名を指定して、どこに配置するか明確に

---

## テンプレート

新しい記事を作成する際のテンプレート:

````markdown
---
title: "記事タイトルをここに"
description: "記事の概要を1〜2文で記述"
publishedAt: 2025-01-15
tags: ["タグ1", "タグ2"]
---

# 記事タイトル

導入文をここに書きます。この記事で何を学べるかを簡潔に説明します。

## セクション 1

本文を書きます。

### サブセクション

詳細な説明を追加します。

```typescript:src/example.ts
// コード例
const example = 'Hello'
```
````

## セクション 2

次のトピックについて説明します。

## まとめ

記事の要点をまとめます。

```

```
