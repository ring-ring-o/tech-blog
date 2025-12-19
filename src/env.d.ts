/// <reference path="../.astro/types.d.ts" />

/**
 * 環境変数の型定義
 * @description Astroプロジェクトで使用する環境変数を型安全に扱う
 */
interface ImportMetaEnv {
  /**
   * コンテンツモード
   * @description 'demo' | 'production'
   * - demo: デモ用ダミー記事（src/content/blog-demo）を表示
   * - production: 本番用記事（src/content/blog）を表示
   */
  readonly CONTENT_MODE: string

  /** サイトURL */
  readonly PUBLIC_SITE_URL: string

  /** 広告表示フラグ */
  readonly PUBLIC_ENABLE_ADS: string

  /** Google Analytics トラッキングID */
  readonly PUBLIC_GA_TRACKING_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
