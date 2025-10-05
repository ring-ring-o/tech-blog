import type { Post, TagWithCount } from '../types/content'

export interface ContentRepository {
  getAllPosts(): Promise<Post[]>
  getPostBySlug(slug: string): Promise<Post | null>
  getPostsByTag(tag: string): Promise<Post[]>
  getAllTags(): Promise<TagWithCount[]>
}
