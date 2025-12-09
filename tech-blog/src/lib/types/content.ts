/**
 * @fileoverview コンテンツ関連の型定義
 * @description ブログ記事とタグに関する型を定義
 */

/**
 * ブログ記事の型定義
 * @description Content Collectionsから取得した記事データを表現
 */
export interface Post {
  /** 記事のスラッグ（URLパス用、拡張子なし） */
  slug: string
  /** Content Collectionsのentry.id（ファイル名） */
  id: string
  /** 記事タイトル */
  title: string
  /** 記事の概要・説明文 */
  description: string
  /** 公開日 */
  publishedAt: Date
  /** 更新日（任意） */
  updatedAt?: Date
  /** タグ一覧 */
  tags: string[]
  /** 記事本文（Markdown） */
  content: string
  /** 下書きフラグ */
  draft: boolean
}

/**
 * タグと記事数の型定義
 * @description タグ一覧表示用
 */
export interface TagWithCount {
  /** タグ名 */
  name: string
  /** そのタグが付いた記事の数 */
  count: number
}
