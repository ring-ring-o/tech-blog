---
title: "Dockerで始める開発環境構築"
description: "Dockerを使った再現性の高い開発環境の構築方法と、Docker Composeの実践的な使い方を解説"
publishedAt: 2025-02-08
updatedAt: 2025-02-08
tags: ["Docker", "DevOps", "開発環境"]
draft: false
---

# Dockerで始める開発環境構築

Dockerは、開発環境の構築を劇的に簡単にします。本記事では、Dockerの基本からDocker Composeを使った実践的な開発環境構築まで解説します。

## Dockerとは

Dockerは、アプリケーションとその依存関係をコンテナとしてパッケージ化するプラットフォームです。

### 仮想マシンとの違い

```
仮想マシン              コンテナ
┌──────────────┐       ┌──────────────┐
│   App A      │       │   App A      │
├──────────────┤       ├──────────────┤
│   Guest OS   │       │   App B      │
├──────────────┤       ├──────────────┤
│  Hypervisor  │       │   Docker     │
├──────────────┤       ├──────────────┤
│   Host OS    │       │   Host OS    │
└──────────────┘       └──────────────┘
```

**コンテナのメリット:**
- 起動が高速（数秒）
- リソース効率が良い
- 環境の一貫性
- スケーラビリティ

## Dockerfileの基本

### シンプルなNode.jsアプリケーション

```dockerfile
# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係ファイルのコピー
COPY package*.json ./

# 依存関係のインストール
RUN npm ci --only=production

# アプリケーションのコピー
COPY . .

# ポートの公開
EXPOSE 3000

# 実行ユーザーの設定（セキュリティ）
USER node

# アプリケーションの起動
CMD ["node", "server.js"]
```

### マルチステージビルド

本番用の軽量イメージを作成:

```dockerfile
# ビルドステージ
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 本番ステージ
FROM node:20-alpine

WORKDIR /app

# ビルドステージからビルド済みファイルをコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000

USER node
CMD ["node", "dist/server.js"]
```

**メリット:**
- イメージサイズの削減
- セキュリティの向上
- ビルドツールが本番イメージに含まれない

### .dockerignoreファイル

```bash
# .dockerignore
node_modules
npm-debug.log
.git
.env
.DS_Store
*.md
coverage
.vscode
dist
```

## Docker基本コマンド

### イメージ操作

```bash
# イメージのビルド
docker build -t my-app:1.0 .

# タグ付け
docker tag my-app:1.0 my-app:latest

# イメージ一覧
docker images

# イメージの削除
docker rmi my-app:1.0

# 未使用イメージの削除
docker image prune -a
```

### コンテナ操作

```bash
# コンテナの起動
docker run -d -p 3000:3000 --name my-container my-app:1.0

# オプション説明:
# -d: デタッチモード（バックグラウンド実行）
# -p: ポートマッピング（ホスト:コンテナ）
# --name: コンテナ名

# 環境変数の設定
docker run -e NODE_ENV=production -e API_KEY=secret my-app

# ボリュームマウント
docker run -v $(pwd)/data:/app/data my-app

# コンテナ一覧
docker ps        # 実行中のみ
docker ps -a     # すべて

# コンテナの停止・削除
docker stop my-container
docker rm my-container

# ログの確認
docker logs my-container
docker logs -f my-container  # フォローモード
```

## Docker Compose

複数コンテナの管理を簡単にするツールです。

### 基本的なdocker-compose.yml

```yaml
version: '3.8'

services:
  # Webアプリケーション
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    volumes:
      - ./src:/app/src  # ホットリロード用
    depends_on:
      - db
      - redis
    networks:
      - app-network

  # データベース
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - app-network

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```

### Docker Composeコマンド

```bash
# サービスの起動
docker-compose up
docker-compose up -d  # バックグラウンド

# 特定サービスのみ起動
docker-compose up web

# ビルドして起動
docker-compose up --build

# サービスの停止
docker-compose down

# ボリュームも削除
docker-compose down -v

# ログの確認
docker-compose logs
docker-compose logs -f web

# サービスの再起動
docker-compose restart web

# コマンド実行
docker-compose exec web sh
docker-compose exec db psql -U user -d myapp
```

## 開発環境の実践例

### フルスタックアプリケーション

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # フロントエンド（Vite）
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend/src:/app/src
      - ./frontend/public:/app/public
    environment:
      - VITE_API_URL=http://localhost:3000
    command: npm run dev

  # バックエンド（Express）
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./backend/src:/app/src
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:pass@postgres:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    command: npm run dev

  # PostgreSQL
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  # Nginx（リバースプロキシ）
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - frontend
      - backend

volumes:
  postgres-data:
```

### 開発用Dockerfile

```dockerfile
# frontend/Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
```

## ベストプラクティス

### 1. レイヤーキャッシュの最適化

```dockerfile
# ❌ 非効率: 毎回全ファイルをコピー
COPY . .
RUN npm install

# ✅ 効率的: package.jsonが変更されない限りキャッシュ利用
COPY package*.json ./
RUN npm ci
COPY . .
```

### 2. セキュリティ

```dockerfile
# rootユーザーを避ける
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# 機密情報を含めない
# .dockerignoreを使用
# シークレットはビルド引数や環境変数で渡す
```

### 3. イメージサイズの削減

```dockerfile
# Alpineベースイメージを使用
FROM node:20-alpine

# 不要なファイルを削除
RUN npm ci --only=production && \
    npm cache clean --force

# マルチステージビルドを活用
```

### 4. ヘルスチェック

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js
```

```yaml
# docker-compose.yml
services:
  web:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## トラブルシューティング

### よくある問題と解決策

```bash
# 1. ポートがすでに使用されている
# エラー: Bind for 0.0.0.0:3000 failed: port is already allocated
lsof -i :3000  # プロセスを確認
kill -9 <PID>  # プロセスを終了

# 2. ボリュームの権限エラー
# docker-compose.ymlで
user: "${UID}:${GID}"

# 3. キャッシュの問題
docker-compose build --no-cache

# 4. ネットワーク接続の問題
docker network ls
docker network inspect <network-name>

# 5. ディスク容量の確保
docker system prune -a --volumes
```

## まとめ

Dockerを使った開発環境構築のチェックリスト:

- [ ] Dockerfileの最適化（レイヤーキャッシュ、マルチステージ）
- [ ] .dockerignoreで不要ファイルを除外
- [ ] Docker Composeで複数サービスを管理
- [ ] ボリュームマウントでホットリロード
- [ ] ヘルスチェックの設定
- [ ] セキュリティ対策（非rootユーザー）
- [ ] 環境変数の適切な管理

**次のステップ:**
1. Kubernetesへの移行を検討
2. CI/CDパイプラインへの統合
3. イメージレジストリの活用

Dockerで効率的な開発環境を構築しましょう! 🐳
