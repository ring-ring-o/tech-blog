/**
 * @fileoverview Markdownリポジトリ実装
 * @description Astro Content Collectionsを使用した記事データの取得・検索機能
 */

import { getCollection, getEntry } from 'astro:content'
import type { Post, TagWithCount } from '../types/content'
import type { ContentRepository } from './content-repository'

/**
 * Markdownベースのコンテンツリポジトリ
 * @description Astro Content Collectionsをデータソースとして使用
 *
 * @implements {ContentRepository}
 *
 * @example
 * ```typescript
 * const repository = new MarkdownRepository();
 * const posts = await repository.getAllPosts();
 * ```
 */
export class MarkdownRepository implements ContentRepository {
  /**
   * 全ての公開済み記事を取得
   * @returns 公開日降順でソートされた記事一覧（下書きは除外）
   */
  async getAllPosts(): Promise<Post[]> {
    const entries = await getCollection('blog')

    // 下書きを除外し、公開日降順でソート
    const posts = entries
      .filter((entry) => !entry.data.draft)
      .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
      .map((entry) => this.mapEntryToPost(entry))

    return posts
  }

  /**
   * スラッグから記事を取得
   * @param slug - 記事のスラッグ（拡張子なしのファイル名）
   * @returns 記事データ、または見つからない/下書きの場合はnull
   */
  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const entry = await getEntry('blog', `${slug}.md`)
      if (!entry || entry.data.draft) {
        return null
      }

      return this.mapEntryToPost(entry)
    } catch {
      return null
    }
  }

  /**
   * 指定タグの記事一覧を取得
   * @param tag - タグ名
   * @returns そのタグが付いた記事一覧（公開日降順）
   */
  async getPostsByTag(tag: string): Promise<Post[]> {
    const allPosts = await this.getAllPosts()
    return allPosts.filter((post) => post.tags.includes(tag))
  }

  /**
   * 全タグと記事数を取得
   * @returns タグ名と記事数のペア一覧（記事数降順）
   */
  async getAllTags(): Promise<TagWithCount[]> {
    const allPosts = await this.getAllPosts()
    const tagMap = new Map<string, number>()

    // 各記事のタグをカウント
    for (const post of allPosts) {
      for (const tag of post.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      }
    }

    // 記事数降順でソートして返す
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }

  /**
   * Content Collectionsのエントリーを Post 型に変換
   * @param entry - Content Collectionsのエントリー
   * @returns Post オブジェクト
   */
  private mapEntryToPost(entry: {
    id: string
    data: {
      title: string
      description: string
      publishedAt: Date
      updatedAt?: Date
      tags: string[]
      draft: boolean
    }
    body?: string
  }): Post {
    return {
      slug: entry.id.replace(/\.md$/, ''),
      id: entry.id,
      title: entry.data.title,
      description: entry.data.description,
      publishedAt: entry.data.publishedAt,
      updatedAt: entry.data.updatedAt,
      tags: entry.data.tags,
      content: entry.body || '',
      draft: entry.data.draft,
    }
  }
}
