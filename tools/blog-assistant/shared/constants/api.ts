/**
 * APIエンドポイント
 */
export const API_ENDPOINTS = {
  ARTICLES: '/api/articles',
  ARTICLES_TAGS: '/api/articles/tags',
  ARTICLES_GENERATE_SLUG: '/api/articles/generate-slug',
  ARTICLES_SUGGEST_TAGS: '/api/articles/suggest-tags',
  ARTICLES_GENERATE_DESCRIPTION: '/api/articles/generate-description',
  REVIEW: '/api/review',
  GENERATE: '/api/generate',
  PREVIEW: '/api/preview',
  SKILLS: '/api/skills',
  IMAGES_UPLOAD: '/api/images/upload',
} as const

/**
 * SSE (Server-Sent Events) イベント名
 */
export const SSE_EVENTS = {
  ERROR: 'error',
  INIT: 'init',
  MESSAGE: 'message',
  DONE: 'done',
} as const

/**
 * SSEメッセージタイプ
 */
export const SSE_MESSAGE_TYPES = {
  TEXT: 'text',
  RESULT: 'result',
} as const
