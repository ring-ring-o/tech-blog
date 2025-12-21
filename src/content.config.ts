/**
 * @fileoverview Astro Content Collections 設定
 * @description ブログ記事と固定ページのコンテンツスキーマを定義
 * @see {@link https://docs.astro.build/en/guides/content-collections/ Content Collections ドキュメント}
 */

import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * コンテンツモード
 * @description 環境変数 CONTENT_MODE で切り替え可能
 * - 'demo': デモ用ダミー記事を表示（デフォルト）
 * - 'production': 本番用記事を表示
 */
const contentMode = import.meta.env.CONTENT_MODE || 'demo'

/**
 * ブログ記事のベースディレクトリ
 * @description コンテンツモードに応じて切り替え
 */
const blogBase = contentMode === 'production' ? './src/content/blog' : './src/content/blog-demo'

/**
 * ブログ記事スキーマ
 * @description 記事のフロントマター検証用
 */
const blogSchema = z.object({
  /** 記事タイトル */
  title: z.string().min(1).max(200),
  /** 記事の概要・説明文 */
  description: z.string().min(1).max(300),
  /** 公開日（日付文字列から自動変換） */
  publishedAt: z.coerce.date(),
  /** 更新日（任意） */
  updatedAt: z.coerce.date().optional(),
  /** タグ一覧（任意） */
  tags: z.array(z.string()).max(10).default([]),
  /** 下書きフラグ */
  draft: z.boolean().default(false),
})

/**
 * ブログ記事コレクション
 * @description Markdownファイルから技術記事を読み込む
 *
 * @remarks
 * フロントマターの必須フィールド:
 * - title: 記事タイトル（1-200文字）
 * - description: 記事の概要（1-300文字）
 * - publishedAt: 公開日
 *
 * オプションフィールド:
 * - tags: タグ配列（0-10個、デフォルト: []）
 * - updatedAt: 更新日
 * - draft: 下書きフラグ（デフォルト: false）
 *
 * @example
 * デモモード（デフォルト）:
 * ```bash
 * pnpm dev
 * ```
 *
 * 本番モード:
 * ```bash
 * CONTENT_MODE=production pnpm dev
 * ```
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: blogBase }),
  schema: blogSchema,
})

/**
 * 固定ページコレクション
 * @description About等の静的ページを管理
 */
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    /** ページタイトル */
    title: z.string().min(1).max(200),
    /** ページの説明文 */
    description: z.string().min(1).max(300),
  }),
})

/** エクスポートするコレクション */
export const collections = { blog, pages }
