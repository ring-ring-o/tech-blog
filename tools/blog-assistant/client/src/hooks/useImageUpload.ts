import { useState, useCallback } from 'react'
import type { BlogDirectory } from '../../../shared/types'

/** 記事コンテキスト（画像を記事フォルダに保存する場合） */
interface ArticleContext {
  slug: string
  directory: BlogDirectory
}

/** 画像アップロード結果（新形式・旧形式の統合） */
interface ImageUploadResult {
  success: boolean
  filename: string
  /** 絶対パスまたは旧形式のpath */
  absolutePath?: string
  path?: string
  /** 相対パス（新形式）または旧形式のmarkdownUrl */
  relativePath?: string
  markdownUrl?: string
  /** Markdown記法 */
  markdown: string
  width: number
  height: number
  size: number
}

interface UseImageUploadOptions {
  /** 記事コンテキスト。指定すると記事フォルダに画像を保存 */
  articleContext?: ArticleContext | null
}

interface UseImageUploadReturn {
  uploadFile: (file: File) => Promise<ImageUploadResult | null>
  uploadBase64: (data: string, filename?: string) => Promise<ImageUploadResult | null>
  isUploading: boolean
  error: Error | null
  lastResult: ImageUploadResult | null
  clearError: () => void
  /** 記事コンテキストを更新 */
  setArticleContext: (context: ArticleContext | null) => void
}

export function useImageUpload(
  options: UseImageUploadOptions = {}
): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null)
  const [articleContext, setArticleContext] = useState<ArticleContext | null>(
    options.articleContext ?? null
  )

  const uploadFile = useCallback(
    async (file: File): Promise<ImageUploadResult | null> => {
      setIsUploading(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('file', file)

        // 記事コンテキストがある場合は追加
        if (articleContext) {
          formData.append('slug', articleContext.slug)
          formData.append('directory', articleContext.directory)
        }

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `HTTP error: ${response.status}`)
        }

        const result: ImageUploadResult = await response.json()
        setLastResult(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed')
        setError(error)
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [articleContext]
  )

  const uploadBase64 = useCallback(
    async (
      data: string,
      filename: string = 'pasted-image.png'
    ): Promise<ImageUploadResult | null> => {
      setIsUploading(true)
      setError(null)

      try {
        const body: Record<string, string> = { data, filename }

        // 記事コンテキストがある場合は追加
        if (articleContext) {
          body.slug = articleContext.slug
          body.directory = articleContext.directory
        }

        const response = await fetch('/api/images/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `HTTP error: ${response.status}`)
        }

        const result: ImageUploadResult = await response.json()
        setLastResult(result)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed')
        setError(error)
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [articleContext]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    uploadFile,
    uploadBase64,
    isUploading,
    error,
    lastResult,
    clearError,
    setArticleContext,
  }
}
