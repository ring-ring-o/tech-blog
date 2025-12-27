/**
 * サーバー設定
 */
export const SERVER_CONFIG = {
  /** サーバーポート番号 */
  PORT: 3001,
} as const

/**
 * CORS許可オリジン
 */
export const CORS_ORIGINS = [
  'http://localhost:5173', // Vite dev server
  'http://localhost:4321', // Astro dev server
] as const
