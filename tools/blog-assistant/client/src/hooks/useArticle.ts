import { useState, useCallback } from 'react'
import type { ArticleFrontmatter, SaveArticleResponse } from '@shared/types'

interface UseArticleReturn {
  save: (content: string, frontmatter: ArticleFrontmatter, slug?: string) => Promise<void>
  isSaving: boolean
  savedUrl: string | null
  savedFilename: string | null
  savedSlug: string | null
  error: Error | null
  clearSaved: () => void
}

export function useArticle(): UseArticleReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [savedUrl, setSavedUrl] = useState<string | null>(null)
  const [savedFilename, setSavedFilename] = useState<string | null>(null)
  const [savedSlug, setSavedSlug] = useState<string | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const save = useCallback(
    async (content: string, frontmatter: ArticleFrontmatter, slug?: string) => {
      setIsSaving(true)
      setError(null)

      try {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, frontmatter, slug }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || `HTTP error: ${response.status}`)
        }

        const result: SaveArticleResponse = await response.json()
        setSavedUrl(result.previewUrl)
        setSavedFilename(result.filename)
        // filenameから拡張子を除いたものがslug
        const slugFromFilename = result.filename.replace(/\.md$/, '')
        setSavedSlug(slugFromFilename)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  const clearSaved = useCallback(() => {
    setSavedUrl(null)
    setSavedFilename(null)
    setSavedSlug(null)
  }, [])

  return { save, isSaving, savedUrl, savedFilename, savedSlug, error, clearSaved }
}
