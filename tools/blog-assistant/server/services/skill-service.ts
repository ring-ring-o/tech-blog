import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname } from 'node:path'
import type { Skill, SkillCategory, SaveSkillRequest } from '../types/index.js'

const SKILLS_FILE = '/workspace/tools/blog-assistant/data/skills.json'

// 共通のシステムプロンプト指示
const COMMON_INSTRUCTIONS = `
## 重要な指示
- 絵文字は使用しないでください
- 柔らかい「ですます調」で執筆してください
- 技術ブログとして以下の品質基準を満たしてください：
  - 内容が明確で具体的であること
  - 技術的な主張には根拠や検証結果を示すこと
  - 前提知識や環境を明記すること
  - 必要に応じて公式ドキュメントや信頼できる情報源への言及を含めること
`

// ビルトインスキルの定義
const BUILT_IN_SKILLS: Skill[] = [
  {
    id: 'review',
    name: '校閲',
    description: '文章の誤りや改善点を指摘します',
    category: 'review',
    systemPrompt: `あなたは技術ブログの編集者です。
日本語で丁寧に校閲を行い、具体的な修正提案を行ってください。
Markdownの書式に注意し、読みやすい記事になるようアドバイスしてください。
修正が必要な箇所は、修正前・修正後を明確に示してください。
${COMMON_INSTRUCTIONS}`,
    userPromptTemplate: `以下のブログ記事を校閲してください。

## Frontmatter
- タイトル: {{title}}
- 説明: {{description}}
- タグ: {{tags}}

## 本文
{{content}}

## 校閲ポイント
以下の観点で記事をチェックし、具体的な修正提案を行ってください：

1. **文法・表記の誤り**: 誤字脱字、文法ミス、表記ゆれ
2. **文章の読みやすさ**: 文の長さ、段落構成、論理の流れ
3. **技術的な正確性**: 技術用語の正しさ、コード例の妥当性
4. **SEO最適化**: タイトル・説明文の最適化、見出し構造
5. **技術ブログとしての品質**:
   - 内容が明確で具体的か
   - 技術的な主張に根拠や検証結果が示されているか
   - 前提知識や動作環境が明記されているか
   - 適切な引用や参照があるか
   - 柔らかい「ですます調」で統一されているか

問題点があれば、修正前と修正後を具体的に示してください。`,
    variables: ['content', 'title', 'description', 'tags'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'generate-draft',
    name: '下書き生成',
    description: 'トピックから記事の下書きを生成します',
    category: 'generate',
    systemPrompt: `あなたは技術ブログのライターです。
SEOを意識した読みやすい技術記事を執筆してください。
適切な見出し構造、コードブロック、リストを使用してください。
日本語で執筆し、技術用語は正確に使用してください。
${COMMON_INSTRUCTIONS}`,
    userPromptTemplate: `以下のトピックでブログ記事の下書きを生成してください。

## トピック
{{topic}}

## 出力形式
以下のYAML Frontmatter形式で始めて、その後にMarkdown本文を記述してください：

---
title: "記事タイトル"
description: "記事の説明（120-160文字推奨）"
publishedAt: {{today}}
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
- 必要に応じて公式ドキュメントへの言及を含めてください`,
    variables: ['topic', 'today'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'continue-writing',
    name: '続きを書く',
    description: '既存の内容から続きを執筆します',
    category: 'assist',
    systemPrompt: `あなたは技術ブログのライターです。
与えられた記事の続きを、同じトーンと文体で自然に執筆してください。
既存の内容との整合性を保ち、論理的な流れを維持してください。
${COMMON_INSTRUCTIONS}`,
    userPromptTemplate: `以下の記事の続きを書いてください。

## タイトル
{{title}}

## 説明
{{description}}

## 現在の内容
{{content}}

## 指示
- 現在の内容から自然に続く形で執筆してください
- 既存の文体・トーン（ですます調）を維持してください
- 既存の見出し構造に合わせてください
- 500〜1000文字程度を目安に追加してください
- 絵文字は使用しないでください
- 技術的な内容には根拠を示してください

続きの内容のみを出力してください（既存の内容は含めないでください）。`,
    variables: ['content', 'title', 'description'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'supplement',
    name: '内容を補完',
    description: '選択した箇所の内容を詳しく説明します',
    category: 'assist',
    systemPrompt: `あなたは技術ブログの編集者です。
選択された箇所について、より詳しい説明や具体例を追加してください。
読者にとってわかりやすい説明を心がけてください。
${COMMON_INSTRUCTIONS}`,
    userPromptTemplate: `以下の記事で、選択された箇所の内容を補完・拡張してください。

## 記事タイトル
{{title}}

## 記事全体の内容
{{content}}

## 補完してほしい箇所
{{selection}}

## 指示
- 選択された箇所をより詳しく説明してください
- 必要に応じて具体例やコードサンプルを追加してください
- 元の文体（ですます調）を維持してください
- Markdown形式で出力してください
- 絵文字は使用しないでください
- 技術的な説明には根拠や参照を含めてください

補完・拡張した内容のみを出力してください。`,
    variables: ['content', 'title', 'selection'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'improve-section',
    name: 'セクション改善',
    description: '選択したセクションを改善します',
    category: 'assist',
    systemPrompt: `あなたは技術ブログの編集者です。
選択されたセクションを、より読みやすく、わかりやすく改善してください。
${COMMON_INSTRUCTIONS}`,
    userPromptTemplate: `以下のセクションを改善してください。

## 記事タイトル
{{title}}

## 改善してほしいセクション
{{selection}}

## 改善ポイント
- 文章をより明確に、簡潔にしてください
- 論理的な流れを整理してください
- 必要に応じて具体例を追加してください
- 読者にとってわかりやすい表現にしてください
- 柔らかい「ですます調」で統一してください
- 絵文字は使用しないでください
- 技術的な主張には根拠を示してください

改善後のセクションのみを出力してください。`,
    variables: ['title', 'selection'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'generate-description',
    name: '説明生成',
    description: '記事内容からメタディスクリプションを生成します',
    category: 'meta',
    systemPrompt: `あなたは技術ブログのSEO専門家です。
記事のタイトルと内容から、検索エンジン最適化された説明文（メタディスクリプション）を生成してください。
${COMMON_INSTRUCTIONS}`,
    userPromptTemplate: `以下の記事から、SEOに最適化されたメタディスクリプション（説明文）を生成してください。

## タイトル
{{title}}

## 記事内容
{{content}}

## 生成ルール
- 最大300文字以内で生成してください
- 記事の主要なポイントを簡潔にまとめてください
- 検索結果で魅力的に見える文章にしてください
- 記事の価値や読者が得られるメリットを含めてください
- 絵文字は使用しないでください
- 「ですます調」で統一してください

説明文のみを出力してください（他の説明や補足は不要です）。`,
    variables: ['title', 'content'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'suggest-tags',
    name: 'タグ提案',
    description: '記事内容から適切なタグを提案します',
    category: 'meta',
    systemPrompt: `あなたは技術ブログのカテゴリ分類専門家です。
記事の内容から適切なタグを提案してください。
既存のタグがある場合は、それらを優先的に使用してください。
${COMMON_INSTRUCTIONS}`,
    userPromptTemplate: `以下の記事に適切なタグを提案してください。

## タイトル
{{title}}

## 記事内容
{{content}}

## 既存のタグ一覧
{{existingTags}}

## 提案ルール
- 3〜5個のタグを提案してください
- 既存のタグがある場合は優先的に使用してください
- 新しいタグを提案する場合は、その理由も説明してください
- タグは短く、具体的なものにしてください
- 技術用語や概念を表すタグを優先してください

以下のJSON形式で出力してください：
[
  { "tag": "タグ名", "reason": "選定理由", "isExisting": true/false }
]`,
    variables: ['title', 'content', 'existingTags'],
    isBuiltIn: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

export class SkillService {
  private skills: Skill[] = []
  private initialized = false

  /**
   * スキルデータを初期化
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    // ディレクトリが存在しない場合は作成
    const dir = dirname(SKILLS_FILE)
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }

    // ファイルが存在する場合は読み込み
    if (existsSync(SKILLS_FILE)) {
      try {
        const data = await readFile(SKILLS_FILE, 'utf-8')
        const customSkills: Skill[] = JSON.parse(data)
        // ビルトインスキルとカスタムスキルをマージ
        this.skills = [...BUILT_IN_SKILLS, ...customSkills]
      } catch {
        this.skills = [...BUILT_IN_SKILLS]
      }
    } else {
      this.skills = [...BUILT_IN_SKILLS]
      await this.save()
    }

    this.initialized = true
  }

  /**
   * カスタムスキルを保存
   */
  private async save(): Promise<void> {
    const customSkills = this.skills.filter((s) => !s.isBuiltIn)
    await writeFile(SKILLS_FILE, JSON.stringify(customSkills, null, 2), 'utf-8')
  }

  /**
   * 全スキルを取得
   */
  async listSkills(): Promise<Skill[]> {
    await this.initialize()
    return this.skills
  }

  /**
   * カテゴリ別にスキルを取得
   */
  async getSkillsByCategory(category: SkillCategory): Promise<Skill[]> {
    await this.initialize()
    return this.skills.filter((s) => s.category === category)
  }

  /**
   * スキルを取得
   */
  async getSkill(id: string): Promise<Skill | null> {
    await this.initialize()
    return this.skills.find((s) => s.id === id) || null
  }

  /**
   * カスタムスキルを作成
   */
  async createSkill(data: SaveSkillRequest): Promise<Skill> {
    await this.initialize()

    // 変数を抽出
    const variables = this.extractVariables(data.userPromptTemplate)

    const skill: Skill = {
      id: `custom-${Date.now()}`,
      name: data.name,
      description: data.description,
      category: data.category,
      systemPrompt: data.systemPrompt,
      userPromptTemplate: data.userPromptTemplate,
      variables,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.skills.push(skill)
    await this.save()
    return skill
  }

  /**
   * スキルを更新
   */
  async updateSkill(id: string, data: SaveSkillRequest): Promise<Skill | null> {
    await this.initialize()

    const index = this.skills.findIndex((s) => s.id === id)
    if (index === -1) return null

    const existing = this.skills[index]

    // ビルトインスキルは更新不可（プロンプトのカスタマイズは別途対応）
    if (existing.isBuiltIn) {
      // ビルトインスキルはプロンプトのみ更新可能
      const updated: Skill = {
        ...existing,
        systemPrompt: data.systemPrompt,
        userPromptTemplate: data.userPromptTemplate,
        variables: this.extractVariables(data.userPromptTemplate),
        updatedAt: new Date().toISOString(),
      }
      this.skills[index] = updated
      // ビルトインスキルのカスタマイズは別ファイルに保存することも検討
      return updated
    }

    const variables = this.extractVariables(data.userPromptTemplate)
    const updated: Skill = {
      ...existing,
      name: data.name,
      description: data.description,
      category: data.category,
      systemPrompt: data.systemPrompt,
      userPromptTemplate: data.userPromptTemplate,
      variables,
      updatedAt: new Date().toISOString(),
    }

    this.skills[index] = updated
    await this.save()
    return updated
  }

  /**
   * カスタムスキルを削除
   */
  async deleteSkill(id: string): Promise<boolean> {
    await this.initialize()

    const skill = this.skills.find((s) => s.id === id)
    if (!skill || skill.isBuiltIn) return false

    this.skills = this.skills.filter((s) => s.id !== id)
    await this.save()
    return true
  }

  /**
   * プロンプトテンプレートから変数を抽出
   */
  private extractVariables(template: string): string[] {
    const matches = template.match(/\{\{(\w+)\}\}/g) || []
    const variables = matches.map((m) => m.replace(/\{\{|\}\}/g, ''))
    return [...new Set(variables)]
  }

  /**
   * プロンプトを生成
   */
  buildPrompt(template: string, variables: Record<string, string>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    }
    return result
  }
}

export const skillService = new SkillService()
