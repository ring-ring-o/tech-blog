import { useState, useCallback } from 'react'
import type { TagSuggestion, SuggestTagsResponse } from '@shared/types'
import { API_ENDPOINTS } from '@shared/constants/api'

interface UseTagSuggestionsReturn {
  suggestions: TagSuggestion[]
  isLoading: boolean
  error: Error | null
  fetchSuggestions: (title: string, content: string) => Promise<void>
  clearSuggestions: () => void
}

export function useTagSuggestions(): UseTagSuggestionsReturn {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchSuggestions = useCallback(async (title: string, content: string) => {
    if (!title.trim() || !content.trim()) {
      setError(new Error('タイトルと本文が必要です'))
      return
    }

    setIsLoading(true)
    setError(null)
    setSuggestions([])

    try {
      const response = await fetch(API_ENDPOINTS.ARTICLES_SUGGEST_TAGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || `HTTP error: ${response.status}`)
      }

      const result: SuggestTagsResponse = await response.json()
      setSuggestions(result.suggestions)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearSuggestions = useCallback(() => {
    setSuggestions([])
    setError(null)
  }, [])

  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    clearSuggestions,
  }
}
