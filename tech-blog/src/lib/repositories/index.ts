import { MarkdownRepository } from './markdown-repository'
import type { ContentRepository } from './content-repository'

// 環境変数で実装を切り替え可能（将来的にCMS対応）
export const contentRepository: ContentRepository =
  import.meta.env.USE_CMS === 'true'
    ? // @ts-expect-error - CMSRepository is not yet implemented
      new CMSRepository()
    : new MarkdownRepository()

export type { ContentRepository } from './content-repository'
export type { Post, TagWithCount } from '../types/content'
