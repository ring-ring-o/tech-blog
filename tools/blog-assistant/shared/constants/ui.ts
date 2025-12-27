/**
 * パネル幅設定（パーセント）
 */
export const PANEL_CONFIG = {
  /** デフォルトの左パネル幅 */
  DEFAULT_LEFT_WIDTH: 55,
  /** 折りたたみと判定する閾値 */
  COLLAPSE_THRESHOLD: 95,
  /** 左パネルの最小幅 */
  MIN_LEFT_WIDTH: 30,
  /** 全幅表示時の幅 */
  FULL_WIDTH: 100,
} as const

/**
 * エディタ設定
 */
export const EDITOR_CONFIG = {
  /** 1行の高さ（px） */
  LINE_HEIGHT_PX: 20,
  /** テキスト選択の最小文字数 */
  SELECTION_MIN_CHARS: 5,
  /** コマンドメニューのY方向オフセット */
  MENU_OFFSET_Y: 30,
  /** コマンドメニューのX方向オフセット */
  MENU_OFFSET_X: 16,
  /** マウスアップ後の選択検出遅延（ms） */
  SELECTION_DETECTION_DELAY: 10,
} as const
