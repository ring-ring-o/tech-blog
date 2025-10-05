# コントリビューションガイド

Tech Blogへのコントリビューションを歓迎します！このガイドでは、記事の追加・更新方法と開発ワークフローについて説明します。

## 📝 記事の投稿方法

### 1. 記事ファイルの作成

記事は `src/content/blog/` ディレクトリにMarkdown形式で作成します。

#### ファイル名規則

```
YYYY-MM-DD-article-slug.md
```

- **YYYY-MM-DD**: 投稿日（例: 2025-01-15）
- **article-slug**: URLに使用されるスラッグ（小文字、ハイフン区切り）

例：
- `2025-01-15-astro-blog-tutorial.md`
- `2025-02-20-typescript-best-practices.md`

### 2. Frontmatter設定

記事の冒頭にYAML形式のfrontmatterを記載します。

```yaml
---
title: "記事のタイトル"
description: "記事の概要（150文字以内推奨）"
publishedAt: 2025-01-15
updatedAt: 2025-01-20  # オプション：更新日
tags:
  - TypeScript
  - Astro
  - Web開発
draft: false  # true: 下書き（非公開）, false: 公開
---
```

#### Frontmatter項目

| 項目 | 必須 | 説明 |
|------|------|------|
| `title` | ✅ | 記事のタイトル |
| `description` | ✅ | 記事の概要（SEOに使用） |
| `publishedAt` | ✅ | 投稿日（YYYY-MM-DD形式） |
| `updatedAt` | ❌ | 更新日（任意） |
| `tags` | ✅ | タグのリスト（配列形式） |
| `draft` | ❌ | 下書きフラグ（デフォルト: false） |

### 3. 記事本文の執筆

frontmatterの後に記事本文をMarkdownで記述します。

#### サポートされているMarkdown記法

- **見出し**: `# H1`, `## H2`, `### H3`
- **強調**: `**太字**`, `*斜体*`
- **リスト**: 番号付き、番号なし
- **リンク**: `[テキスト](URL)`
- **画像**: `![代替テキスト](画像パス)`
- **コードブロック**: バッククォート3つで囲む
- **引用**: `> 引用文`
- **テーブル**: Markdown形式のテーブル

#### コードブロック

コードブロックには言語指定とファイル名を追加できます。

~~~markdown
```typescript:src/example.ts
interface User {
  name: string
  email: string
}
```
~~~

対応言語：
- JavaScript/TypeScript
- Python
- Go
- Rust
- HTML/CSS
- JSON/YAML
- Shell/Bash
- その他多数

### 4. 画像の追加

画像は `public/images/` ディレクトリに配置します。

```
public/
└── images/
    └── 2025-01-15/
        ├── screenshot.png
        └── diagram.svg
```

記事内での参照：

```markdown
![スクリーンショット](/images/2025-01-15/screenshot.png)
```

#### 画像最適化のベストプラクティス

- **形式**: WebP優先（PNG、JPEGも可）
- **最大幅**: 1200px
- **ファイルサイズ**: 500KB以下推奨
- **代替テキスト**: 必ず記載

詳細は [IMAGE_OPTIMIZATION.md](./IMAGE_OPTIMIZATION.md) を参照してください。

### 5. 記事の例

完全な記事の例：

```markdown
---
title: "Astroで高速ブログを構築する方法"
description: "Astro 5.xを使用して、高性能な静的ブログを構築する手順を解説します。"
publishedAt: 2025-01-15
tags:
  - Astro
  - TypeScript
  - Web開発
draft: false
---

## はじめに

この記事では、Astro 5.xを使用して高速なブログを構築する方法を紹介します。

## セットアップ

まず、Astroプロジェクトを初期化します。

\`\`\`bash
pnpm create astro@latest
\`\`\`

## まとめ

Astroを使えば、高性能なブログを簡単に構築できます。
```

## 🔄 開発ワークフロー

### ローカルでの確認

1. **開発サーバー起動**

```bash
pnpm dev
```

2. **記事の確認**

ブラウザで `http://localhost:4321` を開き、記事が正しく表示されるか確認します。

3. **ビルドテスト**

```bash
pnpm build
```

エラーがないことを確認してください。

### プルリクエストの作成

1. **ブランチを作成**

```bash
git checkout -b article/your-article-slug
```

2. **変更をコミット**

```bash
git add .
git commit -m "記事追加: 記事タイトル"
```

3. **プッシュ**

```bash
git push origin article/your-article-slug
```

4. **プルリクエスト作成**

GitHubでプルリクエストを作成し、以下を記載：
- 記事の概要
- カテゴリ/タグ
- 関連Issue（あれば）

### コミットメッセージ規則

```
種類: 簡潔な説明

詳細な説明（オプション）
```

**種類**:
- `記事追加`: 新規記事の追加
- `記事更新`: 既存記事の更新
- `修正`: バグ修正
- `機能追加`: 新機能の追加
- `リファクタ`: コードリファクタリング
- `ドキュメント`: ドキュメント更新

例：
```
記事追加: TypeScriptのベストプラクティス

TypeScript開発における実践的なベストプラクティスを紹介する記事を追加
```

## ✅ レビュー基準

プルリクエストは以下の基準でレビューされます：

### 記事の品質
- [ ] タイトルが明確で分かりやすい
- [ ] 概要が記事内容を適切に要約している
- [ ] 本文が論理的で読みやすい
- [ ] コードサンプルが正確で動作する
- [ ] 画像に適切な代替テキストがある

### 技術的要件
- [ ] Frontmatterが正しく設定されている
- [ ] ファイル名が規則に従っている
- [ ] ビルドエラーがない
- [ ] TypeScriptの型エラーがない
- [ ] リンター警告がない

### SEO
- [ ] descriptionが150文字以内
- [ ] 適切なタグが設定されている
- [ ] 見出し構造が適切（H1→H2→H3）

## 🐛 バグ報告

バグを発見した場合は、GitHubのIssueで報告してください。

### Issueテンプレート

```markdown
## バグの概要
簡潔にバグを説明してください。

## 再現手順
1. '...'にアクセス
2. '...'をクリック
3. エラーが発生

## 期待される動作
本来どのように動作すべきか説明してください。

## 環境
- OS: [例: macOS 14.0]
- ブラウザ: [例: Chrome 120]
- Node.js: [例: 20.10.0]
```

## 💡 機能提案

新機能の提案は、GitHubのIssueで提案してください。

### 提案テンプート

```markdown
## 機能概要
提案する機能を簡潔に説明してください。

## 動機
なぜこの機能が必要か説明してください。

## 実装案
どのように実装するか、アイデアがあれば記載してください。

## 代替案
他に検討した方法があれば記載してください。
```

## 📚 参考リソース

- [Astro ドキュメント](https://docs.astro.build)
- [Markdown Guide](https://www.markdownguide.org)
- [TypeScript ドキュメント](https://www.typescriptlang.org/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)

## 🤝 コミュニティ

質問や議論は以下で行えます：

- GitHub Discussions（準備中）
- Twitter: [@your-handle](https://twitter.com/your-handle)
- Email: tech-blog@example.com

## 📄 ライセンス

コントリビューションは、このプロジェクトのライセンス（MIT）に従います。
