import { readdir, readFile, writeFile, unlink, mkdir } from 'node:fs/promises'
import { join, parse } from 'node:path'
import { existsSync } from 'node:fs'
import matter from 'gray-matter'
import type { Article, ArticleFrontmatter, SaveArticleResponse } from '../types/index.js'

const BLOG_DIR = '/workspace/src/content/blog'
const BLOG_DEMO_DIR = '/workspace/src/content/blog-demo'

export class ArticleService {
  /**
   * 記事一覧を取得
   */
  async listArticles(): Promise<Article[]> {
    // ディレクトリが存在しない場合は作成
    if (!existsSync(BLOG_DIR)) {
      await mkdir(BLOG_DIR, { recursive: true })
      return []
    }

    const files = await readdir(BLOG_DIR)
    const mdFiles = files.filter((f) => f.endsWith('.md') && f !== '.gitkeep')

    const articles = await Promise.all(
      mdFiles.map(async (filename) => {
        const filePath = join(BLOG_DIR, filename)
        const fileContent = await readFile(filePath, 'utf-8')
        const { data, content } = matter(fileContent)

        const slug = parse(filename).name

        return {
          id: filename,
          slug,
          filename,
          frontmatter: data as ArticleFrontmatter,
          content,
        }
      })
    )

    // 公開日の降順でソート
    return articles.sort((a, b) => {
      const dateA = new Date(a.frontmatter.publishedAt).getTime()
      const dateB = new Date(b.frontmatter.publishedAt).getTime()
      return dateB - dateA
    })
  }

  /**
   * 記事を取得
   */
  async getArticle(id: string): Promise<Article | null> {
    const filePath = join(BLOG_DIR, id)

    if (!existsSync(filePath)) {
      return null
    }

    const fileContent = await readFile(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    const slug = parse(id).name

    return {
      id,
      slug,
      filename: id,
      frontmatter: data as ArticleFrontmatter,
      content,
    }
  }

  /**
   * 記事を保存
   */
  async saveArticle(
    frontmatter: ArticleFrontmatter,
    content: string,
    customSlug?: string
  ): Promise<SaveArticleResponse> {
    // ディレクトリが存在しない場合は作成
    if (!existsSync(BLOG_DIR)) {
      await mkdir(BLOG_DIR, { recursive: true })
    }

    // ファイル名生成: YYYY-MM-DD-slug.md
    const dateStr = frontmatter.publishedAt.split('T')[0]
    const slug = customSlug || this.generateSlug(frontmatter.title)
    const filename = `${dateStr}-${slug}.md`

    // Frontmatter + 本文を結合
    const fileContent = matter.stringify(content, frontmatter)

    const filePath = join(BLOG_DIR, filename)
    await writeFile(filePath, fileContent, 'utf-8')

    // Astro dev serverのプレビューURL
    const previewUrl = `http://localhost:4321/posts/${parse(filename).name}`

    return { filename, previewUrl }
  }

  /**
   * 記事を削除
   */
  async deleteArticle(id: string): Promise<boolean> {
    const filePath = join(BLOG_DIR, id)

    if (!existsSync(filePath)) {
      return false
    }

    await unlink(filePath)
    return true
  }

  /**
   * 全記事からユニークなタグを取得（blog と blog-demo の両方から収集）
   */
  async getAllTags(): Promise<string[]> {
    const tagSet = new Set<string>()

    // 本番記事からタグを収集
    const articles = await this.listArticles()
    for (const article of articles) {
      if (Array.isArray(article.frontmatter.tags)) {
        for (const tag of article.frontmatter.tags) {
          tagSet.add(tag)
        }
      }
    }

    // デモ記事からもタグを収集
    if (existsSync(BLOG_DEMO_DIR)) {
      const files = await readdir(BLOG_DEMO_DIR)
      const mdFiles = files.filter((f) => f.endsWith('.md') && f !== '.gitkeep')

      for (const filename of mdFiles) {
        try {
          const filePath = join(BLOG_DEMO_DIR, filename)
          const fileContent = await readFile(filePath, 'utf-8')
          const { data } = matter(fileContent)
          const frontmatter = data as ArticleFrontmatter

          if (Array.isArray(frontmatter.tags)) {
            for (const tag of frontmatter.tags) {
              tagSet.add(tag)
            }
          }
        } catch {
          // ファイル読み込みエラーは無視
        }
      }
    }

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'ja'))
  }

  /**
   * スラッグを生成
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50)
  }
}

export const articleService = new ArticleService()
