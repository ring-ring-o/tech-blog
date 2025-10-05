import { visit } from 'unist-util-visit'

/**
 * remarkプラグイン: コードブロックの言語指定から言語名とファイル名を抽出
 * 形式: ```言語:ファイル名
 * 例: ```typescript:src/example.ts
 */
export function remarkCodeTitle() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (!node.lang) return

      // 言語とファイル名を分割（例: "typescript:src/example.ts" -> ["typescript", "src/example.ts"]）
      const parts = node.lang.split(':')
      const lang = parts[0]
      const filename = parts.slice(1).join(':') // コロンを含むファイル名にも対応

      if (filename) {
        // ファイル名がある場合、metaフィールドに保存
        node.lang = lang
        node.meta = node.meta
          ? `${node.meta} data-filename="${filename}" data-language="${lang}"`
          : `data-filename="${filename}" data-language="${lang}"`
      } else {
        // ファイル名がない場合は言語のみ
        node.meta = node.meta
          ? `${node.meta} data-language="${lang}"`
          : `data-language="${lang}"`
      }
    })
  }
}
