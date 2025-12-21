import { readdir, readFile, writeFile, unlink, mkdir } from 'node:fs/promises'
import { join, parse } from 'node:path'
import { existsSync } from 'node:fs'
import matter from 'gray-matter'
import type {
  Article,
  ArticleFrontmatter,
  SaveArticleResponse,
  BlogDirectory,
} from '../types/index.js'

const DIRECTORIES: Record<BlogDirectory, string> = {
  blog: '/workspace/src/content/blog',
  'blog-demo': '/workspace/src/content/blog-demo',
}

const BLOG_DIR = DIRECTORIES.blog
const BLOG_DEMO_DIR = DIRECTORIES['blog-demo']

export class ArticleService {
  /**
   * ディレクトリパスを取得
   */
  private getDirectoryPath(directory: BlogDirectory): string {
    return DIRECTORIES[directory]
  }

  /**
   * 記事一覧を取得（ディレクトリ指定可能）
   */
  async listArticles(directory?: BlogDirectory): Promise<Article[]> {
    const directories: BlogDirectory[] = directory
      ? [directory]
      : ['blog', 'blog-demo']
    const allArticles: Article[] = []

    for (const dir of directories) {
      const dirPath = this.getDirectoryPath(dir)

      // ディレクトリが存在しない場合は作成
      if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true })
        continue
      }

      const files = await readdir(dirPath)
      const mdFiles = files.filter((f) => f.endsWith('.md') && f !== '.gitkeep')

      const articles = await Promise.all(
        mdFiles.map(async (filename) => {
          const filePath = join(dirPath, filename)
          const fileContent = await readFile(filePath, 'utf-8')
          const { data, content } = matter(fileContent)

          const slug = parse(filename).name

          return {
            id: `${dir}/${filename}`,
            slug,
            filename,
            directory: dir,
            frontmatter: data as ArticleFrontmatter,
            content,
          }
        })
      )

      allArticles.push(...articles)
    }

    // 公開日の降順でソート
    return allArticles.sort((a, b) => {
      const dateA = new Date(a.frontmatter.publishedAt).getTime()
      const dateB = new Date(b.frontmatter.publishedAt).getTime()
      return dateB - dateA
    })
  }

  /**
   * 記事を取得（idは "directory/filename" 形式）
   */
  async getArticle(id: string): Promise<Article | null> {
    // idを分解（例: "blog/2024-01-01-example.md"）
    const [directory, filename] = id.includes('/')
      ? (id.split('/') as [BlogDirectory, string])
      : (['blog' as BlogDirectory, id])

    const dirPath = this.getDirectoryPath(directory)
    const filePath = join(dirPath, filename)

    if (!existsSync(filePath)) {
      return null
    }

    const fileContent = await readFile(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    const slug = parse(filename).name

    return {
      id,
      slug,
      filename,
      directory,
      frontmatter: data as ArticleFrontmatter,
      content,
    }
  }

  /**
   * 記事を保存（新規作成または更新）
   */
  async saveArticle(
    frontmatter: ArticleFrontmatter,
    content: string,
    directory: BlogDirectory = 'blog',
    customSlug?: string,
    existingFilename?: string
  ): Promise<SaveArticleResponse> {
    const dirPath = this.getDirectoryPath(directory)

    // ディレクトリが存在しない場合は作成
    if (!existsSync(dirPath)) {
      await mkdir(dirPath, { recursive: true })
    }

    let filename: string
    let isUpdate = false

    if (existingFilename) {
      // 更新モード: 既存ファイル名を使用
      filename = existingFilename
      isUpdate = true

      // 更新日時を追加
      frontmatter.updatedAt = new Date().toISOString().split('T')[0]
    } else {
      // 新規作成モード: ファイル名生成 YYYY-MM-DD-slug.md
      const dateStr = frontmatter.publishedAt.split('T')[0]
      const slug = customSlug || this.generateSlug(frontmatter.title)
      filename = `${dateStr}-${slug}.md`
    }

    // Frontmatter + 本文を結合
    const fileContent = matter.stringify(content, frontmatter)

    const filePath = join(dirPath, filename)
    await writeFile(filePath, fileContent, 'utf-8')

    // Astro dev serverのプレビューURL
    const previewUrl = `http://localhost:4321/posts/${parse(filename).name}`

    return { filename, previewUrl, isUpdate }
  }

  /**
   * 記事を削除（idは "directory/filename" 形式）
   */
  async deleteArticle(id: string): Promise<boolean> {
    const [directory, filename] = id.includes('/')
      ? (id.split('/') as [BlogDirectory, string])
      : (['blog' as BlogDirectory, id])

    const dirPath = this.getDirectoryPath(directory)
    const filePath = join(dirPath, filename)

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
