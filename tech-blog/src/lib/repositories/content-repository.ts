/**
 * @fileoverview コンテンツリポジトリのインターフェース定義
 * @description 記事の取得・検索に関する抽象インターフェース
 */

import type { Post, TagWithCount } from '../types/content'

/**
 * コンテンツリポジトリのインターフェース
 * @description 記事データへのアクセスを抽象化し、データソースの差し替えを可能にする
 *
 * @remarks
 * 現在の実装: MarkdownRepository（Astro Content Collections）
 * 将来的にCMS等への差し替えが可能
 */
export interface ContentRepository {
  /**
   * 全ての公開済み記事を取得
   * @returns 公開日降順でソートされた記事一覧
   */
  getAllPosts(): Promise<Post[]>

  /**
   * スラッグから記事を取得
   * @param slug - 記事のスラッグ（URLパス）
   * @returns 記事データ、または見つからない場合はnull
   */
  getPostBySlug(slug: string): Promise<Post | null>

  /**
   * 指定タグの記事一覧を取得
   * @param tag - タグ名
   * @returns そのタグが付いた記事一覧
   */
  getPostsByTag(tag: string): Promise<Post[]>

  /**
   * 全タグと記事数を取得
   * @returns タグ名と記事数のペア一覧（記事数降順）
   */
  getAllTags(): Promise<TagWithCount[]>
}
