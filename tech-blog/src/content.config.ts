/**
 * @fileoverview Astro Content Collections 設定
 * @description ブログ記事と固定ページのコンテンツスキーマを定義
 * @see {@link https://docs.astro.build/en/guides/content-collections/ Content Collections ドキュメント}
 */

import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

/**
 * ブログ記事コレクション
 * @description Markdownファイルから技術記事を読み込む
 *
 * @remarks
 * フロントマターの必須フィールド:
 * - title: 記事タイトル（1-200文字）
 * - description: 記事の概要（1-300文字）
 * - publishedAt: 公開日
 * - tags: タグ配列（1-10個）
 *
 * オプションフィールド:
 * - updatedAt: 更新日
 * - draft: 下書きフラグ（デフォルト: false）
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    /** 記事タイトル */
    title: z.string().min(1).max(200),
    /** 記事の概要・説明文 */
    description: z.string().min(1).max(300),
    /** 公開日（日付文字列から自動変換） */
    publishedAt: z.coerce.date(),
    /** 更新日（任意） */
    updatedAt: z.coerce.date().optional(),
    /** タグ一覧 */
    tags: z.array(z.string()).min(1).max(10),
    /** 下書きフラグ */
    draft: z.boolean().default(false),
  }),
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
