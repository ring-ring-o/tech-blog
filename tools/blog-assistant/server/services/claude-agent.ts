import { query } from "@anthropic-ai/claude-agent-sdk";
import type { ArticleFrontmatter, TagSuggestion } from "../types/index.js";
import {
  AI_MODELS,
  AI_AGENT_CONFIG,
  CONTENT_LIMITS,
} from "../../shared/constants/content.js";

/**
 * タイトルを英語スラッグに変換
 */
export async function generateSlug(title: string): Promise<string> {
  const prompt = `
以下の日本語タイトルを、URL用の英語スラッグに変換してください。

タイトル: ${title}

## ルール
- 英語の単語をハイフンでつなげる形式（kebab-case）
- 最大50文字以内
- 小文字のみ使用
- 記事の内容を簡潔に表す
- SEOを意識した適切なキーワードを含める

## 出力形式
スラッグのみを出力してください。説明や前置きは不要です。
例: getting-started-with-react-hooks
`;

  try {
    let slug = "";
    for await (const message of query({
      prompt,
      options: {
        model: AI_MODELS.DEFAULT,
        systemPrompt:
          "You are a URL slug generator. Output only the slug, nothing else.",
        maxTurns: AI_AGENT_CONFIG.SLUG_GENERATION_MAX_TURNS,
        allowedTools: [],
      },
    })) {
      // アシスタントメッセージからテキストを抽出
      if (message.type === "assistant" && message.message?.content) {
        for (const block of message.message.content) {
          if ("text" in block) {
            slug += block.text;
          }
        }
      }
    }

    // クリーンアップ: 余分な文字を除去
    return slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, CONTENT_LIMITS.SLUG_MAX_LENGTH);
  } catch (error) {
    console.error("generateSlug error:", error);
    // フォールバック: 簡易的な変換
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, CONTENT_LIMITS.SLUG_MAX_LENGTH);
  }
}

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
- タグ: ${frontmatter.tags.join(", ")}
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
6. **技術ブログとしての品質**:
   - 内容が明確で具体的か
   - 技術的な主張に根拠や検証結果が示されているか
   - 前提知識や動作環境が明記されているか
   - 適切な引用や参照があるか
   - 柔らかい「ですます調」で統一されているか
7. **Callout（補足情報ブロック）の活用**:
   - 重要な警告や注意事項に:::warningや:::cautionを使用しているか
   - ヒントや推奨事項に:::tipを使用しているか
   - 補足情報に:::noteを使用しているか
   - Calloutの記法が正しいか（:::type ... :::）

問題点があれば、修正前と修正後を具体的に示してください。
`;

  try {
    for await (const message of query({
      prompt,
      options: {
        model: AI_MODELS.DEFAULT,
        resume: sessionId,
        systemPrompt: `あなたは技術ブログの編集者です。
日本語で丁寧に校閲を行い、具体的な修正提案を行ってください。
Markdownの書式に注意し、読みやすい記事になるようアドバイスしてください。
修正が必要な箇所は、修正前・修正後を明確に示してください。

## 重要な指示
- 絵文字は使用しないでください
- 柔らかい「ですます調」で執筆してください`,
        maxTurns: AI_AGENT_CONFIG.REVIEW_MAX_TURNS,
        allowedTools: [],
      },
    })) {
      yield message;
    }
  } catch (error) {
    yield {
      type: "error" as const,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 下書きを生成
 */
export async function* generateDraft(
  topic: string,
  requirements?: {
    targetLength?: "short" | "medium" | "long";
    tone?: "casual" | "professional";
    includeCode?: boolean;
  }
) {
  const lengthGuide = {
    short: "1000-1500文字程度",
    medium: "2000-3000文字程度",
    long: "4000-5000文字程度",
  };

  const today = new Date().toISOString().split("T")[0];

  const prompt = `
以下のトピックでブログ記事の下書きを生成してください。

## トピック
${topic}

## 要件
- 文字数: ${lengthGuide[requirements?.targetLength || "medium"]}
- トーン: ${
    requirements?.tone === "casual"
      ? "カジュアル・親しみやすい"
      : "プロフェッショナル・丁寧"
  }
- コードサンプル: ${requirements?.includeCode ? "含める" : "必要に応じて"}

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

## 執筆ガイドライン
- H1見出しは1つだけ使用し、H2・H3見出しで構造化してください
- コードブロックには言語を指定してください
- 適切な箇所でリストを使用してください
- 柔らかい「ですます調」で執筆してください
- 絵文字は使用しないでください
- 前提となる環境やバージョンを明記してください
- 技術的な主張には根拠を示してください
- 必要に応じて公式ドキュメントへの言及を含めてください

## Callout（補足情報ブロック）
重要な情報や注意点を強調したい場合、以下の記法を使用してください。
**重要**: 開始タグ、内容、終了タグはそれぞれ空行で区切ってください。

\`\`\`markdown
:::note タイトル（任意）

一般的な補足情報

:::

:::warning

警告メッセージ

:::
\`\`\`

タイプ: note（補足）, tip（ヒント）, warning（警告）, caution（危険）, important（重要）
`;

  try {
    for await (const message of query({
      prompt,
      options: {
        model: AI_MODELS.DEFAULT,
        systemPrompt: `あなたは技術ブログのライターです。
SEOを意識した読みやすい技術記事を執筆してください。
適切な見出し構造、コードブロック、リストを使用してください。
日本語で執筆し、技術用語は正確に使用してください。

## 重要な指示
- 絵文字は使用しないでください
- 柔らかい「ですます調」で執筆してください
- 技術ブログとして以下の品質基準を満たしてください：
  - 内容が明確で具体的であること
  - 技術的な主張には根拠や検証結果を示すこと
  - 前提知識や環境を明記すること
  - 必要に応じて公式ドキュメントや信頼できる情報源への言及を含めること
- 重要な情報や注意点にはCallout記法を使用してください：
  - :::note - 補足情報
  - :::tip - ヒント
  - :::warning - 警告
  - :::caution - 危険な注意事項
  - :::important - 重要な情報`,
        maxTurns: AI_AGENT_CONFIG.DRAFT_GENERATION_MAX_TURNS,
        allowedTools: [],
      },
    })) {
      yield message;
    }
  } catch (error) {
    yield {
      type: "error" as const,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * 記事内容からタグを推奨
 */
export async function suggestTags(
  title: string,
  content: string,
  existingTags: string[]
): Promise<TagSuggestion[]> {
  // 本文が長い場合は先頭部分のみ使用
  const contentExcerpt = content.slice(0, 2000);

  const prompt = `
以下のブログ記事に適切なタグを提案してください。

## タイトル
${title}

## 本文（抜粋）
${contentExcerpt}

## 既存のタグ一覧（ブログ全体で使用されているタグ）
${existingTags.length > 0 ? existingTags.join(", ") : "なし"}

## ルール
1. 記事の内容に最も適したタグを3〜5個提案してください
2. 既存のタグ一覧に合致するものがあれば、できるだけそれを優先してください
3. 既存タグにないが、記事内容に適切な新しいタグも提案できます
4. 各タグには、なぜそのタグが適切かの理由を簡潔に添えてください
5. 既存タグか新規タグかを明示してください

## 出力形式
以下のJSON形式で出力してください。説明や前置きは不要です。
[
  {"tag": "タグ名", "reason": "理由", "isExisting": true},
  {"tag": "タグ名", "reason": "理由", "isExisting": false}
]
`;

  try {
    let result = "";
    for await (const message of query({
      prompt,
      options: {
        model: AI_MODELS.DEFAULT,
        systemPrompt:
          "You are a blog tag suggestion assistant. Output only valid JSON array, nothing else.",
        maxTurns: AI_AGENT_CONFIG.SLUG_GENERATION_MAX_TURNS,
        allowedTools: [],
      },
    })) {
      if (message.type === "assistant" && message.message?.content) {
        for (const block of message.message.content) {
          if ("text" in block) {
            result += block.text;
          }
        }
      }
    }

    // JSONをパース
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response");
    }

    const suggestions: TagSuggestion[] = JSON.parse(jsonMatch[0]);

    // バリデーション
    return suggestions
      .filter(
        (s) =>
          typeof s.tag === "string" &&
          typeof s.reason === "string" &&
          typeof s.isExisting === "boolean"
      )
      .slice(0, 5);
  } catch (error) {
    console.error("suggestTags error:", error);
    return [];
  }
}
