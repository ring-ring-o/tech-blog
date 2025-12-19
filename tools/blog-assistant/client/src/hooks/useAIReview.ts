import { useState, useCallback } from 'react'
import type { ArticleFrontmatter } from '@shared/types'

interface UseAIReviewReturn {
  review: (content: string, frontmatter: ArticleFrontmatter) => Promise<void>
  streamingText: string
  isLoading: boolean
  error: Error | null
}

export function useAIReview(): UseAIReviewReturn {
  const [streamingText, setStreamingText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const review = useCallback(
    async (content: string, frontmatter: ArticleFrontmatter) => {
      setIsLoading(true)
      setError(null)
      setStreamingText('')

      try {
        const response = await fetch('/api/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, frontmatter }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('No response body')
        }

        let fullText = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === 'text') {
                  fullText += data.content
                  setStreamingText(fullText)
                } else if (data.type === 'error') {
                  throw new Error(data.message)
                }
              } catch (e) {
                if (e instanceof SyntaxError) {
                  // JSON parse error, skip this line
                  continue
                }
                throw e
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  return { review, streamingText, isLoading, error }
}
