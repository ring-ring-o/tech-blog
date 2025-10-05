export interface Post {
  slug: string
  id: string // Content Collections の entry.id（ファイル名）
  title: string
  description: string
  publishedAt: Date
  updatedAt?: Date
  tags: string[]
  content: string
  draft: boolean
}

export interface TagWithCount {
  name: string
  count: number
}
