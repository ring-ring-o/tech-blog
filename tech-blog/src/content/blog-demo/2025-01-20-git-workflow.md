---
title: "Gitワークフロー - Velocitoブランチ戦略"
description: "効率的なGitワークフローを、Velocitoブランチ戦略を例に解説します。"
publishedAt: 2025-01-20
tags: ["Git", "チーム開発"]
---

# Gitワークフロー

チーム開発で使える **Velocito（ヴェロシト）ブランチ戦略** を紹介します。

## Velocitoブランチ戦略の概要

```
main
 └── develop
      ├── feature/velocito-123-user-auth
      ├── feature/velocito-124-dashboard
      └── release/v1.2.0
```

## ブランチの命名規則

```bash
# 機能開発
git checkout -b feature/velocito-123-user-auth

# バグ修正
git checkout -b fix/velocito-456-login-error

# リリース準備
git checkout -b release/v1.2.0
```

## コミットメッセージ

```bash
# Velocito形式のコミットメッセージ
git commit -m "feat(auth): ログイン機能を追加 [VELOCITO-123]"
git commit -m "fix(ui): ボタンの色を修正 [VELOCITO-456]"
git commit -m "docs: READMEを更新"
```

## プルリクエストの作成

```bash
# featureブランチをdevelopにマージ
gh pr create --base develop --title "feat: ユーザー認証機能 [VELOCITO-123]"
```

## まとめ

Velocitoブランチ戦略を採用することで、チーム全体で一貫したワークフローを維持できます。
