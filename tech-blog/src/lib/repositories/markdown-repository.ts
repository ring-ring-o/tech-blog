import { getCollection, getEntry } from 'astro:content'
import type { ContentRepository } from './content-repository'
import type { Post, TagWithCount } from '../types/content'

export class MarkdownRepository implements ContentRepository {
  async getAllPosts(): Promise<Post[]> {
    const entries = await getCollection('blog')

    // 下書きを除外し、公開日降順でソート
    const posts = entries
      .filter((entry) => !entry.data.draft)
      .sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime())
      .map((entry) => ({
        slug: entry.id.replace(/\.md$/, ''),
        id: entry.id,
        title: entry.data.title,
        description: entry.data.description,
        publishedAt: entry.data.publishedAt,
        updatedAt: entry.data.updatedAt,
        tags: entry.data.tags,
        content: entry.body,
        draft: entry.data.draft,
      }))

    return posts
  }

  async getPostBySlug(slug: string): Promise<Post | null> {
    try {
      const entry = await getEntry('blog', `${slug}.md`)
      if (!entry || entry.data.draft) {
        return null
      }

      return {
        slug: entry.id.replace(/\.md$/, ''),
        id: entry.id,
        title: entry.data.title,
        description: entry.data.description,
        publishedAt: entry.data.publishedAt,
        updatedAt: entry.data.updatedAt,
        tags: entry.data.tags,
        content: entry.body,
        draft: entry.data.draft,
      }
    } catch {
      return null
    }
  }

  async getPostsByTag(tag: string): Promise<Post[]> {
    const allPosts = await this.getAllPosts()
    return allPosts.filter((post) => post.tags.includes(tag))
  }

  async getAllTags(): Promise<TagWithCount[]> {
    const allPosts = await this.getAllPosts()
    const tagMap = new Map<string, number>()

    for (const post of allPosts) {
      for (const tag of post.tags) {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      }
    }

    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }
}
