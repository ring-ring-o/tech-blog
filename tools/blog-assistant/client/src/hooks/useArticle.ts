import { useState, useCallback } from 'react'
import type {
  ArticleFrontmatter,
  SaveArticleResponse,
  BlogDirectory,
  Article,
} from '@shared/types'
import { API_ENDPOINTS } from '@shared/constants/api'

interface SaveOptions {
  content: string
  frontmatter: ArticleFrontmatter
  directory: BlogDirectory
  slug?: string
  existingFilename?: string
}

interface UseArticleReturn {
  save: (options: SaveOptions) => Promise<void>
  isSaving: boolean
  savedUrl: string | null
  savedFilename: string | null
  savedSlug: string | null
  savedDirectory: BlogDirectory | null
  isUpdate: boolean
  error: Error | null
  clearSaved: () => void
  // 記事一覧
  articles: Article[]
  isLoadingArticles: boolean
  loadArticles: (directory?: BlogDirectory) => Promise<void>
  // 記事読み込み
  loadArticle: (id: string) => Promise<Article | null>
}

export function useArticle(): UseArticleReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [savedFilename, setSavedFilename] = useState<string | null>(null)
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [savedDirectory, setSavedDirectory] = useState<BlogDirectory | null>(null)
  const [isUpdate, setIsUpdate] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)

  const save = useCallback(async (options: SaveOptions) => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.ARTICLES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `HTTP error: ${response.status}`)
      }

      const result: SaveArticleResponse = await response.json()
      setSavedUrl(result.previewUrl)
      setSavedFilename(result.filename)
      setSavedDirectory(options.directory)
      setIsUpdate(result.isUpdate)
      // filenameからslugを抽出
      // フォルダ構造: "2025-01-01-title/index.md" -> "2025-01-01-title"
      // フラット構造: "2025-01-01-title.md" -> "2025-01-01-title"
      let slugFromFilename = result.filename
      if (slugFromFilename.endsWith('/index.md')) {
        slugFromFilename = slugFromFilename.replace('/index.md', '')
      } else if (slugFromFilename.endsWith('.md')) {
        slugFromFilename = slugFromFilename.replace(/\.md$/, '')
      }
      setSavedSlug(slugFromFilename)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsSaving(false)
    }
  }, [])

  const loadArticles = useCallback(async (directory?: BlogDirectory) => {
    setIsLoadingArticles(true)
    try {
      const url = directory
        ? `${API_ENDPOINTS.ARTICLES}?directory=${directory}`
        : API_ENDPOINTS.ARTICLES
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to load articles')
      }
      const data: Article[] = await response.json()
      setArticles(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoadingArticles(false)
    }
  }, [])

  const loadArticle = useCallback(async (id: string): Promise<Article | null> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ARTICLES}/${encodeURIComponent(id)}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to load article')
      }
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    }
  }, [])

  const clearSaved = useCallback(() => {
    setSavedUrl(null)
    setSavedFilename(null)
    setSavedSlug(null)
    setSavedDirectory(null)
    setIsUpdate(false)
  }, [])

  return {
    save,
    isSaving,
    savedUrl,
    savedFilename,
    savedSlug,
    savedDirectory,
    isUpdate,
    error,
    clearSaved,
    articles,
    isLoadingArticles,
    loadArticles,
    loadArticle,
  }
}
