/**
 * @fileoverview Remarkプラグイン - コードブロックのタイトル抽出
 * @description Markdownコードブロックから言語名とファイル名を抽出し、メタデータとして保存する
 *
 * @example
 * 入力形式: ```typescript:src/example.ts
 * 出力: lang="typescript", meta="data-filename=\"src/example.ts\" data-language=\"typescript\""
 */

import { visit } from 'unist-util-visit'

/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Code} Code
 */

/**
 * コードブロックの言語指定から言語名とファイル名を抽出するRemarkプラグイン
 *
 * @description
 * Markdownのコードフェンスで「言語:ファイル名」形式の指定を解析し、
 * Shikiトランスフォーマーで利用可能なメタデータを生成する
 *
 * @example
 * ```typescript:src/utils/helper.ts
 * export function helper() {}
 * ```
 * → data-language="typescript" data-filename="src/utils/helper.ts"
 *
 * @example
 * ```bash
 * npm install
 * ```
 * → data-language="bash"（ファイル名なし）
 *
 * @returns {(tree: Root) => void} Remarkトランスフォーマー関数
 */
export function remarkCodeTitle() {
  /**
   * @param {Root} tree - Markdown AST ルートノード
   */
  return (tree) => {
    visit(tree, 'code', (/** @type {Code} */ node) => {
      // 言語指定がない場合は処理をスキップ
      if (!node.lang) return

      // 言語とファイル名を分割
      // 例: "typescript:src/example.ts" → ["typescript", "src/example.ts"]
      // 注: ファイルパスにコロンが含まれる場合（Windows等）も考慮
      const colonIndex = node.lang.indexOf(':')
      const hasFilename = colonIndex !== -1

      const lang = hasFilename ? node.lang.slice(0, colonIndex) : node.lang
      const filename = hasFilename ? node.lang.slice(colonIndex + 1) : null

      // 言語名をクリーンアップ（ファイル名部分を除去）
      node.lang = lang

      // メタデータを構築
      const metaParts = []

      // 既存のメタデータがあれば保持
      if (node.meta) {
        metaParts.push(node.meta)
      }

      // ファイル名がある場合は追加
      if (filename) {
        metaParts.push(`data-filename="${filename}"`)
      }

      // 言語名は常に追加
      metaParts.push(`data-language="${lang}"`)

      // メタデータを結合
      node.meta = metaParts.join(' ')
    })
  }
}
