# Project Structure

## ルートディレクトリ構成

```
.
├── .claude/              # Claude Code設定とコマンド
│   └── commands/         # スラッシュコマンド定義
├── .kiro/                # Kiroスペック駆動開発
│   ├── steering/         # プロジェクトステアリングドキュメント
│   └── specs/            # 機能仕様（feature-name/）
├── scripts/              # 自動化スクリプト
├── examples/             # 実装例
│   └── hooks/            # Hook実装例
├── .github/              # GitHub設定（Actions、テンプレートなど）
├── .devcontainer/        # Dev Container設定
├── .vscode/              # VS Code設定
└── CLAUDE.md             # プロジェクト全体の指示とワークフロー
```

## サブディレクトリ構造

### `.claude/commands/`
Claude Codeスラッシュコマンドの定義。

```
.claude/commands/
├── commit-push-pr.md     # Git操作自動化コマンド
├── dedupe.md             # GitHub Issue重複検出コマンド
└── kiro/                 # Kiroスペック駆動開発コマンド
    ├── spec-init.md          # 仕様初期化
    ├── spec-requirements.md  # 要件生成
    ├── spec-design.md        # 設計作成
    ├── spec-tasks.md         # タスク生成
    ├── spec-impl.md          # TDD実装
    ├── spec-status.md        # 進捗確認
    ├── validate-design.md    # 設計検証
    ├── validate-gap.md       # ギャップ分析
    ├── steering.md           # ステアリング管理
    └── steering-custom.md    # カスタムステアリング
```

**パターン**:
- 各`.md`ファイルは1つのスラッシュコマンド
- YAML front-matterで設定、Markdownボディでプロンプト定義
- `kiro/`サブディレクトリでコマンドをグループ化

### `.kiro/steering/`
AIにプロジェクト知識を注入するコンテキストドキュメント。

```
.kiro/steering/
├── product.md        # 製品概要とビジネス目標（Always）
├── tech.md           # 技術スタックと環境（Always）
└── structure.md      # ファイル構成とパターン（Always）
```

**パターン**:
- コアファイル（product, tech, structure）は常時読み込み
- カスタムファイルは条件付き/手動読み込み可能
- Markdown形式で構造化されたコンテキスト

### `.kiro/specs/[feature-name]/`
個別機能の仕様ドキュメント。

```
.kiro/specs/[feature-name]/
├── spec.json           # メタデータと承認トラッキング
├── requirements.md     # 要件定義
├── design.md           # 技術設計
└── tasks.md            # 実装タスク（チェックリスト）
```

**パターン**:
- 機能ごとに独立したディレクトリ
- `spec.json`で進捗とフェーズ管理
- Markdownドキュメントで段階的に仕様を構築
- `tasks.md`のチェックボックスで実装状況をトラッキング

### `scripts/`
自動化スクリプト（主にGitHub連携）。

```
scripts/
├── auto-close-duplicates.ts       # 重複Issue自動クローズ
└── backfill-duplicate-comments.ts # 重複コメント追加
```

**パターン**:
- TypeScript実行ファイル（`#!/usr/bin/env bun`）
- GitHub API統合
- スタンドアロン実行可能

### `examples/`
実装パターンの参考例。

```
examples/
└── hooks/
    └── bash_command_validator_example.py  # PreToolUseフック例
```

**パターン**:
- 機能カテゴリ別にサブディレクトリ化
- 実行可能な完全な例を提供
- ドキュメントコメント付き

## コード構成パターン

### TypeScriptスクリプト
```typescript
#!/usr/bin/env bun

// グローバル型定義
declare global {
  var process: {
    env: Record<string, string | undefined>;
  };
}

// インターフェース定義
interface GitHubIssue {
  number: number;
  title: string;
  // ...
}

// ヘルパー関数
async function githubRequest<T>(...) { }

// メイン関数
async function main() {
  // 実装
}

main().catch(console.error);

// モジュール宣言
export {};
```

**特徴**:
- Shebangでランタイム指定
- 型定義をファイル内で完結
- エラーハンドリング付きメイン関数
- 環境変数経由の設定

### Pythonフック
```python
#!/usr/bin/env python3
"""
Hook説明とドキュメント
設定例をdocstringに含める
"""

import json
import sys

def main():
    input_data = json.load(sys.stdin)
    # 処理
    sys.exit(0)  # 成功: 0, 警告: 1, ブロック: 2

if __name__ == "__main__":
    main()
```

**特徴**:
- STDINからJSON入力
- 終了コードでフロー制御
- 設定例をdocstringに含める

### スラッシュコマンドMarkdown
```markdown
---
description: コマンドの説明
allowed-tools: Tool1, Tool2(pattern:*)
argument-hint: <arg1> [arg2]
---

# コマンドタイトル

コマンドの詳細な指示...

## セクション1
- 箇条書きの指示
- 変数参照: $1, $2, $ARGUMENTS

## セクション2
```コードブロック例```
```

**特徴**:
- YAML front-matterで設定
- Markdownでプロンプト記述
- `$1`, `$2`で引数参照
- `$ARGUMENTS`で全引数参照

## ファイル命名規則

### スラッシュコマンド
- **形式**: `kebab-case.md`
- **例**: `spec-init.md`, `commit-push-pr.md`
- **ルール**: コマンド名と一致させる

### スクリプト
- **形式**: `kebab-case.ts` または `snake_case.py`
- **例**: `auto-close-duplicates.ts`, `bash_command_validator_example.py`
- **ルール**: 機能を明確に表す名前

### ステアリング
- **形式**: `lowercase.md`
- **例**: `product.md`, `tech.md`, `structure.md`
- **ルール**: 単一の単語またはハイフン区切り

### 仕様ディレクトリ
- **形式**: `kebab-case/`
- **例**: `user-authentication/`, `api-refactoring/`
- **ルール**: 機能を簡潔に表す

## Import/依存関係の構成

### TypeScriptスクリプト
- **外部依存**: なし（標準ライブラリとBunランタイムのみ）
- **API依存**: GitHub REST API
- **パターン**: fetch APIを直接使用

### Pythonフック
- **外部依存**: なし（標準ライブラリのみ）
- **パターン**: `json`, `sys`, `re`モジュール

### スラッシュコマンド
- **依存**: Claude Codeの組み込みツール
- **パターン**: `allowed-tools`でツール制限
- **コンテキスト**: `@`記法でファイル参照

## キーアーキテクチャ原則

### 宣言的設定
- スラッシュコマンドはMarkdownで宣言的に定義
- ステアリングドキュメントでAIの動作を制御
- 仕様はJSON+Markdownで段階的に構築

### 段階的な承認フロー
- 要件 → 設計 → タスク → 実装の順序を強制
- 各段階で人間の承認を必須化
- `spec.json`で承認状態をトラッキング

### 自己完結性
- スクリプトは最小限の外部依存
- 型定義はファイル内で完結
- 環境変数で設定を外部化

### 拡張性
- カスタムスラッシュコマンドを`.claude/commands/`に追加
- カスタムステアリングを`.kiro/steering/`に追加
- Hooksで実行フローをカスタマイズ

### ドキュメント駆動
- 主要な設定とワークフローは`CLAUDE.md`に記載
- 各コマンドは自己説明的なMarkdown
- 例はドキュメントコメント付きで提供

### シンプルさ優先
- ビルドステップなし（Bunで直接実行）
- 複雑なフレームワーク不要
- 標準ツール（Git、GitHub CLI）との統合
