/**
 * 画像最適化設定
 */
export const IMAGE_CONFIG = {
  /** 画像の最大幅（px） */
  MAX_WIDTH: 1200,
  /** WebP圧縮品質（0-100） */
  WEBP_QUALITY: 90,
  /** ファイル名に使用するハッシュの長さ */
  HASH_LENGTH: 8,
  /** ファイル名のベース部分の最大長 */
  FILENAME_MAX_LENGTH: 30,
} as const

/**
 * 画像パス設定
 */
export const IMAGE_PATHS = {
  /** 従来の画像保存先（public配下） */
  LEGACY_DIR: '/workspace/public/images/posts',
  /** Markdown用URLプレフィックス */
  URL_PREFIX: '/images/posts/',
  /** 記事内画像の相対パスプレフィックス */
  RELATIVE_PREFIX: './images/',
  /** デフォルトのペースト画像ファイル名 */
  DEFAULT_PASTE_FILENAME: 'pasted-image.png',
} as const
