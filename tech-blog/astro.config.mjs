// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { remarkCodeTitle } from './src/lib/remark-code-title.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    remarkPlugins: [remarkCodeTitle],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
      transformers: [
        {
          pre(node) {
            // metaからdata属性を抽出して<pre>タグに追加
            const meta = this.options.meta?.__raw
            if (meta) {
              const filenameMatch = meta.match(/data-filename="([^"]+)"/)
              const languageMatch = meta.match(/data-language="([^"]+)"/)

              if (filenameMatch) {
                node.properties['data-filename'] = filenameMatch[1]
              }
              if (languageMatch) {
                node.properties['data-language'] = languageMatch[1]
              }
            }
          },
        },
      ],
    },
  },
});
