/**
 * コンテンツ制限値
 */
export const CONTENT_LIMITS = {
  /** タイトル最大文字数 */
  TITLE_MAX_LENGTH: 200,
  /** 説明文最大文字数 */
  DESCRIPTION_MAX_LENGTH: 300,
  /** タグ最大数 */
  MAX_TAGS: 10,
  /** スラッグ最大文字数 */
  SLUG_MAX_LENGTH: 50,
} as const

/**
 * ファイル名定数
 */
export const FILE_NAMES = {
  /** 記事のインデックスファイル */
  INDEX_MD: 'index.md',
  /** 画像ディレクトリ名 */
  IMAGES_DIR: 'images',
  /** Git管理用空ファイル */
  GITKEEP: '.gitkeep',
  /** Markdownファイル拡張子 */
  MD_EXTENSION: '.md',
} as const

/**
 * ブログディレクトリパス
 */
export const BLOG_DIRECTORIES = {
  blog: '/workspace/src/content/blog',
  'blog-demo': '/workspace/src/content/blog-demo',
} as const

/**
 * AIモデル設定
 */
export const AI_MODELS = {
  /** デフォルトのClaudeモデル */
  DEFAULT: 'claude-sonnet-4-20250514',
} as const

/**
 * AIエージェント設定
 */
export const AI_AGENT_CONFIG = {
  /** スラッグ生成時の最大ターン数 */
  SLUG_GENERATION_MAX_TURNS: 1,
  /** レビュー時の最大ターン数 */
  REVIEW_MAX_TURNS: 5,
  /** 下書き生成時の最大ターン数 */
  DRAFT_GENERATION_MAX_TURNS: 3,
} as const
