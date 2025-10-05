# Technology Stack

## アーキテクチャ

### 高レベル設計
- **Claude Codeスラッシュコマンドシステム**: マークダウンベースのコマンド定義
- **Hooksシステム**: Pre/PostToolUseフックによる実行制御
- **ステアリングドキュメント**: `.kiro/steering/`にMarkdownで保存
- **仕様管理**: `.kiro/specs/[feature-name]/`にJSON+Markdown形式

### コンポーネント構成
1. **コマンド層**: `.claude/commands/`のマークダウンファイル
2. **自動化スクリプト層**: `scripts/`のTypeScript/Python実行ファイル
3. **ステアリング層**: `.kiro/steering/`のコンテキストドキュメント
4. **仕様層**: `.kiro/specs/`の機能仕様

## バックエンド

### 言語とランタイム
- **TypeScript**: GitHubスクリプト自動化（Bunランタイム）
- **Python 3**: Hookの実装例
- **Bash**: GitHub CLIとの統合

### フレームワークとライブラリ
- **Bun**: TypeScript実行環境（`#!/usr/bin/env bun`）
- **GitHub API (REST)**: Issue管理とPR操作
  - エンドポイント: `https://api.github.com`
  - 認証: Bearer token (`GITHUB_TOKEN`)
- **GitHub CLI (`gh`)**: コマンドライン統合
  - Issue操作: `gh issue view`, `gh issue list`, `gh issue comment`
  - PR操作: `gh pr create`
  - 検索: `gh search`

## 開発環境

### 必須ツール
- **Claude Code**: スラッシュコマンドとフックシステム
- **Bun**: TypeScript/JavaScriptランタイム
- **Python 3**: Hook実行用
- **GitHub CLI**: GitHub統合機能用
- **Git**: バージョン管理

### オプションツール
- **ripgrep (rg)**: 高速パターン検索（Hook例で推奨）

## よく使用するコマンド

### 開発ワークフロー
```bash
# スペック駆動開発
/kiro:steering                          # ステアリング作成・更新
/kiro:spec-init <description>           # 仕様初期化
/kiro:spec-requirements <feature>       # 要件生成
/kiro:spec-design <feature>             # 設計作成
/kiro:spec-tasks <feature>              # タスク生成
/kiro:spec-impl <feature> [tasks]       # TDD実装
/kiro:spec-status <feature>             # 進捗確認

# GitHub自動化
/dedupe                                 # 重複Issue検出
/commit-push-pr                         # コミット・プッシュ・PR作成
```

### スクリプト実行
```bash
# 重複Issueの自動クローズ（GitHub Actions想定）
bun run scripts/auto-close-duplicates.ts

# 重複コメントのバックフィル
bun run scripts/backfill-duplicate-comments.ts
```

### 開発ツール
```bash
# ディレクトリ構造確認
tree -L 2 -a .kiro/

# Git操作
git status
git add .
git commit -m "message"
git push
gh pr create
```

## 環境変数

### GitHub統合
```bash
# 必須
GITHUB_TOKEN                    # GitHub API認証トークン

# オプション（デフォルト値あり）
GITHUB_REPOSITORY_OWNER         # リポジトリオーナー（デフォルト: anthropics）
GITHUB_REPOSITORY_NAME          # リポジトリ名（デフォルト: claude-code）
```

### Claude Code
```bash
# Claude Code設定は ~/.config/claude/settings.json
# Hooksは hooks フィールドで設定
```

## ポート設定

このプロジェクトはサーバーを起動しないため、ポート設定は不要です。

## ファイル形式と構造

### スラッシュコマンド定義
- **場所**: `.claude/commands/*.md`
- **形式**: YAML front-matter + Markdownボディ
- **Front-matter必須フィールド**:
  - `description`: コマンドの説明
  - `allowed-tools`: 使用可能なツールリスト（オプション）
  - `argument-hint`: 引数のヒント（オプション）

### 仕様メタデータ
- **場所**: `.kiro/specs/[feature]/spec.json`
- **形式**: JSON
- **必須フィールド**:
  - `feature_name`: 機能名
  - `created_at`, `updated_at`: タイムスタンプ
  - `language`: 使用言語（"ja" or "en"）
  - `phase`: 現在のフェーズ
  - `approvals`: 各フェーズの承認状態

### ステアリングドキュメント
- **場所**: `.kiro/steering/*.md`
- **形式**: Markdown
- **コアファイル**: `product.md`, `tech.md`, `structure.md`
- **インクルードモード**: Always/Conditional/Manual

## TypeScript設定

TypeScriptコードはBunランタイムで直接実行されるため、ビルドステップは不要です。
型定義は各ファイル内で `interface` として宣言されています。
