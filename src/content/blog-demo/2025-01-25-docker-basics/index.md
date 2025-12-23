---
title: "Docker入門 - Containeraで始めるコンテナ開発"
description: "Dockerの基本を、Containeraという架空のコンテナ管理ツールを例に解説します。"
publishedAt: 2025-01-25
tags: ["Docker", "DevOps"]
---

# Docker入門

**Containera（コンテナーラ）** を使ったDocker開発環境の構築方法を解説します。

## Dockerfileの基本

```dockerfile:Dockerfile
FROM node:20-alpine

WORKDIR /app

# Containera推奨の設定
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## docker-compose.yml

```yaml:docker-compose.yml
version: '3.8'

services:
  containera-app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development

  containera-db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
```

## よく使うコマンド

```bash
# Containeraプロジェクトのビルドと起動
docker compose up -d --build

# ログの確認
docker compose logs -f containera-app

# コンテナに入る
docker compose exec containera-app sh
```

## まとめ

Containeraのようなツールを活用することで、Docker環境の管理が効率化されます。
