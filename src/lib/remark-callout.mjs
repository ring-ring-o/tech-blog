/**
 * @fileoverview Remarkプラグイン - Callout（補足情報ブロック）
 * @description Markdownのコンテナ記法（:::type）を解析し、補足情報ブロックに変換する
 *
 * 使用方法:
 * :::note タイトル
 *
 * ノートの内容をここに記述
 *
 * :::
 *
 * 重要: 開始タグ、コンテンツ、終了タグはそれぞれ空行で区切る必要があります。
 */

/**
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Html} Html
 */

/**
 * サポートするCalloutタイプとデフォルトラベル
 */
const CALLOUT_TYPES = {
  note: { label: 'Note', icon: 'ℹ️' },
  tip: { label: 'Tip', icon: '💡' },
  warning: { label: 'Warning', icon: '⚠️' },
  caution: { label: 'Caution', icon: '🚨' },
  important: { label: 'Important', icon: '❗' },
}

/**
 * Callout開始パターン (パラグラフ全体がこのパターンに一致)
 */
const START_PATTERN = /^:::(note|tip|warning|caution|important)(?:\s+(.*))?$/

/**
 * Callout終了パターン
 */
const END_PATTERN = /^:::$/

/**
 * ノードからすべてのテキストを抽出
 */
function extractAllText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.value
  if (node.type === 'inlineCode') return node.value
  if (node.children) return node.children.map(extractAllText).join('')
  return ''
}

/**
 * ノードからHTMLを抽出（インラインフォーマットを保持）
 */
function extractHtmlFromNode(node) {
  if (!node) return ''
  if (node.type === 'text') return escapeHtml(node.value)
  if (node.type === 'inlineCode') return `<code>${escapeHtml(node.value)}</code>`
  if (node.type === 'strong') return `<strong>${node.children.map(extractHtmlFromNode).join('')}</strong>`
  if (node.type === 'emphasis') return `<em>${node.children.map(extractHtmlFromNode).join('')}</em>`
  if (node.type === 'link') return `<a href="${escapeHtml(node.url)}">${node.children.map(extractHtmlFromNode).join('')}</a>`
  if (node.children) return node.children.map(extractHtmlFromNode).join('')
  return ''
}

/**
 * HTMLエスケープ
 */
function escapeHtml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Calloutコンテナを解析・変換するRemarkプラグイン
 */
export function remarkCallout() {
  return (tree) => {
    const containers = []
    let currentContainer = null

    for (let index = 0; index < tree.children.length; index++) {
      const node = tree.children[index]

      if (node.type === 'paragraph') {
        const text = extractAllText(node).trim()

        // 開始パターンをチェック
        const startMatch = text.match(START_PATTERN)
        if (startMatch && !currentContainer) {
          currentContainer = {
            startIndex: index,
            endIndex: -1,
            type: startMatch[1],
            title: startMatch[2] || null,
          }
          continue
        }

        // 終了パターンをチェック
        if (END_PATTERN.test(text) && currentContainer) {
          currentContainer.endIndex = index
          containers.push(currentContainer)
          currentContainer = null
        }
      }
    }

    // コンテナを逆順で処理
    containers.reverse().forEach((container) => {
      const { startIndex, endIndex, type, title } = container
      const typeConfig = CALLOUT_TYPES[type]

      // コンテナ内のコンテンツを取得
      const contentNodes = tree.children.slice(startIndex + 1, endIndex)

      // コンテンツをHTMLとして構築
      const contentHtml = contentNodes
        .map((node) => {
          if (node.type === 'paragraph') {
            return `<p>${extractHtmlFromNode(node)}</p>`
          }
          if (node.type === 'code') {
            return `<pre><code class="language-${node.lang || ''}">${escapeHtml(node.value)}</code></pre>`
          }
          if (node.type === 'list') {
            const tag = node.ordered ? 'ol' : 'ul'
            const items = node.children.map((item) => `<li>${extractHtmlFromNode(item)}</li>`).join('')
            return `<${tag}>${items}</${tag}>`
          }
          return ''
        })
        .filter(Boolean)
        .join('\n')

      const displayTitle = title || typeConfig.label

      const htmlNode = {
        type: 'html',
        value: `<div class="callout callout-${type}">
<div class="callout-title">${typeConfig.icon} ${escapeHtml(displayTitle)}</div>
<div class="callout-content">
${contentHtml}
</div>
</div>`,
      }

      tree.children.splice(startIndex, endIndex - startIndex + 1, htmlNode)
    })
  }
}
