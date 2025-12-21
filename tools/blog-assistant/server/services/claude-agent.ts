import { query } from '@anthropic-ai/claude-agent-sdk'
import type { ArticleFrontmatter } from '../types/index.js'

/**
 * AI校閲を実行
 */
export async function* reviewArticle(
  content: string,
  frontmatter: ArticleFrontmatter,
  sessionId?: string
) {
  const prompt = `
以下のブログ記事を校閲してください。

## Frontmatter
- タイトル: ${frontmatter.title}
- 説明: ${frontmatter.description}
- タグ: ${frontmatter.tags.join(', ')}
- 公開日: ${frontmatter.publishedAt}

## 本文
${content}

## 校閲ポイント
以下の観点で記事をチェックし、具体的な修正提案を行ってください：

1. **文法・表記の誤り**: 誤字脱字、文法ミス、表記ゆれ
2. **文章の読みやすさ**: 文の長さ、段落構成、論理の流れ
3. **技術的な正確性**: 技術用語の正しさ、コード例の妥当性
4. **SEO最適化**: タイトル・説明文の最適化、見出し構造
5. **Frontmatterの検証**:
   - タイトル: 1-200文字
   - 説明: 1-300文字（メタディスクリプション向け120-160文字推奨）
   - タグ: 1-10個

問題点があれば、修正前と修正後を具体的に示してください。
`

  try {
    for await (const message of query({
      prompt,
      options: {
        model: 'claude-sonnet-4-20250514',
        resume: sessionId,
        systemPrompt: `あなたは技術ブログの編集者です。
日本語で丁寧に校閲を行い、具体的な修正提案を行ってください。
Markdownの書式に注意し、読みやすい記事になるようアドバイスしてください。
修正が必要な箇所は、修正前・修正後を明確に示してください。`,
        maxTurns: 5,
        allowedTools: [],
      },
    })) {
      yield message
    }
  } catch (error) {
    yield {
      type: 'error' as const,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * 下書きを生成
 */
export async function* generateDraft(
  topic: string,
  requirements?: {
    targetLength?: 'short' | 'medium' | 'long'
    tone?: 'casual' | 'professional'
    includeCode?: boolean
  }
) {
  const lengthGuide = {
    short: '1000-1500文字程度',
    medium: '2000-3000文字程度',
    long: '4000-5000文字程度',
  }

  const today = new Date().toISOString().split('T')[0]

  const prompt = `
以下のトピックでブログ記事の下書きを生成してください。

## トピック
${topic}

## 要件
- 文字数: ${lengthGuide[requirements?.targetLength || 'medium']}
- トーン: ${requirements?.tone === 'casual' ? 'カジュアル・親しみやすい' : 'プロフェッショナル・丁寧'}
- コードサンプル: ${requirements?.includeCode ? '含める' : '必要に応じて'}

## 出力形式
以下のYAML Frontmatter形式で始めて、その後にMarkdown本文を記述してください：

---
title: "記事タイトル"
description: "記事の説明（120-160文字推奨）"
publishedAt: ${today}
tags: ["タグ1", "タグ2"]
---

# 見出し

（記事内容）

## 注意事項
- H1見出しは1つだけ使用
- H2、H3見出しで構造化
- コードブロックには言語を指定
- 適切な箇所でリストを使用
`

  try {
    for await (const message of query({
      prompt,
      options: {
        model: 'claude-sonnet-4-20250514',
        systemPrompt: `あなたは技術ブログのライターです。
SEOを意識した読みやすい技術記事を執筆してください。
適切な見出し構造、コードブロック、リストを使用してください。
日本語で執筆し、技術用語は正確に使用してください。`,
        maxTurns: 3,
        allowedTools: [],
      },
    })) {
      yield message
    }
  } catch (error) {
    yield {
      type: 'error' as const,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
