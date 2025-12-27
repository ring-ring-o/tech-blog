/**
 * @fileoverview コンテンツ制限値
 * @description 記事のフロントマター検証やフォーム入力制限で使用する定数
 */

export const CONTENT_LIMITS = {
  /** タイトルの最大文字数 */
  TITLE_MAX_LENGTH: 200,
  /** 説明文の最大文字数 */
  DESCRIPTION_MAX_LENGTH: 300,
  /** タグの最大数 */
  MAX_TAGS: 10,
} as const
