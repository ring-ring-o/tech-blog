// @ts-check
/**
 * @fileoverview Astro設定ファイル
 * @description 技術ブログサイトのビルド設定、Markdown処理、Viteプラグインの統合を定義
 * @see {@link https://astro.build/config Astro設定ドキュメント}
 */

import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { remarkCodeTitle } from './src/lib/remark-code-title.mjs'

/**
 * Astro設定
 * @see {@link https://docs.astro.build/en/reference/configuration-reference/ 設定リファレンス}
 */
export default defineConfig({
  /** サイトのベースURL（本番環境用） */
  site: 'https://example.com',

  /** Astroインテグレーション */
  integrations: [
    /** サイトマップ自動生成 @see {@link https://docs.astro.build/en/guides/integrations-guide/sitemap/} */
    sitemap(),
  ],

  /** Vite設定 */
  vite: {
    plugins: [
      /** Tailwind CSS v4 Viteプラグイン */
      tailwindcss(),
    ],
  },

  /** Markdown処理設定 */
  markdown: {
    /** Remarkプラグイン（Markdown AST変換） */
    remarkPlugins: [
      /** コードブロックから言語名とファイル名を抽出 */
      remarkCodeTitle,
    ],

    /** Shikiシンタックスハイライト設定 */
    shikiConfig: {
      /** カラーテーマ */
      theme: 'github-dark',
      /** 長い行の折り返し */
      wrap: true,
      /**
       * Shikiトランスフォーマー
       * remarkプラグインで設定したメタデータを<pre>タグの属性に変換
       */
      transformers: [
        {
          /**
           * <pre>タグの変換処理
           * @description コードブロックのメタ情報からdata属性を抽出し、preタグに追加する
           * @param {object} node - Shiki AST の pre ノード
           */
          pre(node) {
            const meta = this.options.meta?.__raw
            if (!meta) return

            // data-filename属性の抽出
            const filenameMatch = meta.match(/data-filename="([^"]+)"/)
            if (filenameMatch) {
              node.properties['data-filename'] = filenameMatch[1]
            }

            // data-language属性の抽出
            const languageMatch = meta.match(/data-language="([^"]+)"/)
            if (languageMatch) {
              node.properties['data-language'] = languageMatch[1]
            }
          },
        },
      ],
    },
  },
})
