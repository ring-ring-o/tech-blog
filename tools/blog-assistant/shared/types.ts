/**
 * 記事のFrontmatter
 */
export interface ArticleFrontmatter {
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  tags: string[]
}

/**
 * 記事データ
 */
export interface Article {
  id: string
  slug: string
  filename: string
  frontmatter: ArticleFrontmatter
  content: string
}

/**
 * 校閲リクエスト
 */
export interface ReviewRequest {
  content: string
  frontmatter: ArticleFrontmatter
  sessionId?: string
}

/**
 * 下書き生成リクエスト
 */
export interface GenerateRequest {
  topic: string
  requirements?: {
    targetLength?: 'short' | 'medium' | 'long'
    tone?: 'casual' | 'professional'
    includeCode?: boolean
  }
}

/**
 * 記事保存リクエスト
 */
export interface SaveArticleRequest {
  content: string
  frontmatter: ArticleFrontmatter
}

/**
 * 記事保存レスポンス
 */
export interface SaveArticleResponse {
  filename: string
  previewUrl: string
}

/**
 * SSEメッセージ型
 */
export type SSEMessage =
  | { type: 'text'; content: string }
  | { type: 'tool'; name: string; input: unknown }
  | { type: 'result'; sessionId?: string }
  | { type: 'error'; message: string }
