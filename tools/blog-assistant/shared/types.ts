/**
 * ブログディレクトリタイプ
 */
export type BlogDirectory = 'blog' | 'blog-demo'

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
  directory: BlogDirectory
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
  directory: BlogDirectory
  slug?: string
  existingFilename?: string // 更新時に既存ファイル名を指定
}

/**
 * 記事保存レスポンス
 */
export interface SaveArticleResponse {
  filename: string
  previewUrl: string
  isUpdate: boolean
}

/**
 * SSEメッセージ型
 */
export type SSEMessage =
  | { type: 'text'; content: string }
  | { type: 'tool'; name: string; input: unknown }
  | { type: 'result'; sessionId?: string }
  | { type: 'error'; message: string }

/**
 * スキルカテゴリ
 */
export type SkillCategory = 'review' | 'generate' | 'assist'

/**
 * スキル定義
 */
export interface Skill {
  id: string
  name: string
  description: string
  category: SkillCategory
  systemPrompt: string
  userPromptTemplate: string
  /** 利用可能な変数: {{content}}, {{title}}, {{description}}, {{tags}}, {{selection}} */
  variables: string[]
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

/**
 * スキル実行リクエスト
 */
export interface ExecuteSkillRequest {
  skillId: string
  variables: Record<string, string>
}

/**
 * スキル作成/更新リクエスト
 */
export interface SaveSkillRequest {
  name: string
  description: string
  category: SkillCategory
  systemPrompt: string
  userPromptTemplate: string
}
