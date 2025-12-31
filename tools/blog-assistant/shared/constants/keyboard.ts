/**
 * キーボードショートカット設定
 *
 * キー定義の形式:
 * - 単一キー: 'Escape', '1', 'a' など
 * - 修飾キー付き: 'ctrl+1', 'alt+p', 'cmd+shift+a' など
 * - 修飾キー: ctrl, alt, shift, cmd (macOSのCommandキー)
 */

/** タブ切り替えショートカット */
export const TAB_SHORTCUTS = {
  /** AI結果タブに切り替え */
  RESULTS: 'alt+1',
  /** プレビュータブに切り替え */
  PREVIEW: 'alt+2',
  /** Astroタブに切り替え */
  ASTRO: 'alt+3',
} as const

/** パネル操作ショートカット */
export const PANEL_SHORTCUTS = {
  /** 右パネルの表示/非表示を切り替え */
  TOGGLE_RIGHT_PANEL: 'alt+0',
  /** 記事一覧パネルの表示/非表示を切り替え */
  TOGGLE_ARTICLE_LIST: 'alt+a',
  /** アシスト設定パネルの表示/非表示を切り替え */
  TOGGLE_ASSISTS_PANEL: 'alt+s',
} as const

/** ナビゲーションショートカット */
export const NAV_SHORTCUTS = {
  /** 次のタブに切り替え */
  NEXT_TAB: 'alt+]',
  /** 前のタブに切り替え */
  PREV_TAB: 'alt+[',
} as const

/** ショートカットキー定義の型 */
export type ShortcutKey = string

/**
 * ショートカットキーをパースして判定に必要な情報を返す
 */
export interface ParsedShortcut {
  key: string
  ctrl: boolean
  alt: boolean
  shift: boolean
  meta: boolean // Command key on macOS
}

/**
 * ショートカットキー文字列をパースする
 */
export function parseShortcut(shortcut: string): ParsedShortcut {
  const parts = shortcut.toLowerCase().split('+')
  const key = parts[parts.length - 1]

  return {
    key,
    ctrl: parts.includes('ctrl'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    meta: parts.includes('cmd') || parts.includes('meta'),
  }
}

/**
 * キーボードイベントがショートカットに一致するか判定
 */
export function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parsed = parseShortcut(shortcut)

  // 修飾キーのチェック
  if (parsed.ctrl !== event.ctrlKey) return false
  if (parsed.alt !== event.altKey) return false
  if (parsed.shift !== event.shiftKey) return false
  if (parsed.meta !== event.metaKey) return false

  // キーのチェック（大文字小文字を無視）
  const eventKey = event.key.toLowerCase()
  return eventKey === parsed.key
}

/**
 * ショートカットキーを表示用にフォーマットする
 * 例: 'alt+1' -> 'Alt+1', 'alt+]' -> 'Alt+]'
 */
export function formatShortcut(shortcut: string): string {
  const parts = shortcut.split('+')
  return parts
    .map((part) => {
      switch (part.toLowerCase()) {
        case 'ctrl':
          return 'Ctrl'
        case 'alt':
          return 'Alt'
        case 'shift':
          return 'Shift'
        case 'cmd':
        case 'meta':
          return 'Cmd'
        case 'tab':
          return 'Tab'
        case '[':
        case ']':
        case ',':
        case '.':
        case '/':
        case '\\':
        case ';':
        case "'":
          // 記号はそのまま表示
          return part
        default:
          return part.toUpperCase()
      }
    })
    .join('+')
}
