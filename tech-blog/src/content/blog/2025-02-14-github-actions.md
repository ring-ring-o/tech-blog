---
title: "GitHub Actions入門"
description: "CI/CDを自動化するGitHub Actionsの基本"
publishedAt: 2025-02-14
tags: ["GitHub", "CI・CD"]
draft: false
---

# GitHub Actions 入門

GitHub Actions を使った CI/CD の自動化について解説します。

## ワークフローの基本

`.github/workflows/ci.yml`にワークフローを定義します。

```yaml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm test
```

## まとめ

GitHub Actions で開発フローを自動化しましょう。
