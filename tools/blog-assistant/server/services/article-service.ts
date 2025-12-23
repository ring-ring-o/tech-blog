import {
  readdir,
  readFile,
  writeFile,
  unlink,
  mkdir,
  rm,
  stat,
} from 'node:fs/promises'
import { join, parse, dirname } from 'node:path'
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

/** 記事構造の種類 */
interface ArticleEntry {
  /** フルパス */
  path: string
  /** ファイル名またはフォルダ名 */
  name: string
  /** フォルダ構造かどうか */
  isFolder: boolean
  /** スラッグ（日付プレフィックスを含む） */
  slug: string
}

export class ArticleService {
  /**
   * ディレクトリパスを取得
   */
  private getDirectoryPath(directory: BlogDirectory): string {
    return DIRECTORIES[directory]
  }

  /**
   * ディレクトリ内の記事エントリを取得（フラット・フォルダ両対応）
   */
  private async findArticleEntries(dirPath: string): Promise<ArticleEntry[]> {
    if (!existsSync(dirPath)) {
      return []
    }

    const entries: ArticleEntry[] = []
    const items = await readdir(dirPath)

    for (const item of items) {
      if (item === '.gitkeep') continue

      const itemPath = join(dirPath, item)
      const itemStat = await stat(itemPath)

      if (itemStat.isDirectory()) {
        // フォルダ構造: item/index.md を探す
        const indexPath = join(itemPath, 'index.md')
        if (existsSync(indexPath)) {
          entries.push({
            path: indexPath,
            name: item,
            isFolder: true,
            slug: item,
          })
        }
      } else if (item.endsWith('.md')) {
        // フラットファイル構造
        entries.push({
          path: itemPath,
          name: item,
          isFolder: false,
          slug: parse(item).name,
        })
      }
    }

    return entries
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

      const entries = await this.findArticleEntries(dirPath)

      const articles = await Promise.all(
        entries.map(async (entry) => {
          const fileContent = await readFile(entry.path, 'utf-8')
          const { data, content } = matter(fileContent)

          // ファイル名の決定: フォルダの場合は slug/index.md
          const filename = entry.isFolder
            ? `${entry.slug}/index.md`
            : entry.name

          return {
            id: `${dir}/${filename}`,
            slug: entry.slug,
            filename,
            directory: dir,
            frontmatter: data as ArticleFrontmatter,
            content,
            isFolder: entry.isFolder,
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
   * 記事を取得（idは "directory/filename" または "directory/slug/index.md" 形式）
   */
  async getArticle(id: string): Promise<Article | null> {
    // idを分解（例: "blog/2024-01-01-example.md" または "blog/2024-01-01-example/index.md"）
    const parts = id.split('/')
    const directory = parts[0] as BlogDirectory
    const rest = parts.slice(1).join('/')

    const dirPath = this.getDirectoryPath(directory)
    let filePath: string
    let isFolder: boolean
    let slug: string
    let filename: string

    // フォルダ構造かフラットかを判定
    if (rest.endsWith('/index.md')) {
      // フォルダ構造: slug/index.md
      slug = rest.replace('/index.md', '')
      filePath = join(dirPath, rest)
      isFolder = true
      filename = rest
    } else if (rest.includes('/')) {
      // フォルダ構造の別形式
      slug = parts[1]
      filePath = join(dirPath, slug, 'index.md')
      isFolder = true
      filename = `${slug}/index.md`
    } else {
      // フラットファイル
      filePath = join(dirPath, rest)
      isFolder = false
      slug = parse(rest).name
      filename = rest
    }

    if (!existsSync(filePath)) {
      return null
    }

    const fileContent = await readFile(filePath, 'utf-8')
    const { data, content } = matter(fileContent)

    return {
      id,
      slug,
      filename,
      directory,
      frontmatter: data as ArticleFrontmatter,
      content,
      isFolder,
    }
  }

  /**
   * 記事を保存（新規作成または更新）
   * 新規作成時はフォルダ構造で保存、更新時は既存構造を維持
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
    let filePath: string
    let isUpdate = false
    let slug: string

    if (existingFilename) {
      // 更新モード: 既存ファイル構造を維持
      filename = existingFilename
      isUpdate = true

      // 更新日時を追加
      frontmatter.updatedAt = new Date().toISOString().split('T')[0]

      // フォルダ構造かフラットかを判定
      if (existingFilename.endsWith('/index.md')) {
        slug = existingFilename.replace('/index.md', '')
        filePath = join(dirPath, existingFilename)
      } else {
        slug = parse(existingFilename).name
        filePath = join(dirPath, existingFilename)
      }
    } else {
      // 新規作成モード: フォルダ構造で作成
      const dateStr = frontmatter.publishedAt.split('T')[0]
      slug = customSlug || this.generateSlug(frontmatter.title)
      const folderSlug = `${dateStr}-${slug}`

      // フォルダを作成
      const articleDir = join(dirPath, folderSlug)
      await mkdir(articleDir, { recursive: true })

      // 画像用フォルダも作成
      const imagesDir = join(articleDir, 'images')
      await mkdir(imagesDir, { recursive: true })

      filename = `${folderSlug}/index.md`
      filePath = join(articleDir, 'index.md')
      slug = folderSlug
    }

    // Frontmatter + 本文を結合
    const fileContent = matter.stringify(content, frontmatter)

    await writeFile(filePath, fileContent, 'utf-8')

    // Astro dev serverのプレビューURL
    const previewUrl = `http://localhost:4321/posts/${slug}`

    return { filename, previewUrl, isUpdate }
  }

  /**
   * 記事の画像保存先ディレクトリを取得
   */
  getArticleImagesDir(directory: BlogDirectory, slug: string): string {
    const dirPath = this.getDirectoryPath(directory)
    return join(dirPath, slug, 'images')
  }

  /**
   * 記事の画像保存先ディレクトリを確保（存在しなければ作成）
   */
  async ensureArticleImagesDir(
    directory: BlogDirectory,
    slug: string
  ): Promise<string> {
    const imagesDir = this.getArticleImagesDir(directory, slug)
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }
    return imagesDir
  }

  /**
   * 記事を削除（idは "directory/filename" 形式）
   * フォルダ構造の場合はフォルダごと削除
   */
  async deleteArticle(id: string): Promise<boolean> {
    const parts = id.split('/')
    const directory = parts[0] as BlogDirectory
    const rest = parts.slice(1).join('/')

    const dirPath = this.getDirectoryPath(directory)

    // フォルダ構造かフラットかを判定
    if (rest.endsWith('/index.md')) {
      // フォルダ構造: フォルダごと削除
      const folderPath = join(dirPath, rest.replace('/index.md', ''))
      if (!existsSync(folderPath)) {
        return false
      }
      await rm(folderPath, { recursive: true })
      return true
    } else {
      // フラットファイル
      const filePath = join(dirPath, rest)
      if (!existsSync(filePath)) {
        return false
      }
      await unlink(filePath)
      return true
    }
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
