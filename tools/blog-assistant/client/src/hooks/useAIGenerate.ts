import { useState, useCallback } from 'react'

interface GenerateRequirements {
  targetLength?: 'short' | 'medium' | 'long'
  tone?: 'casual' | 'professional'
  includeCode?: boolean
}

interface UseAIGenerateReturn {
  generate: (topic: string, requirements?: GenerateRequirements) => Promise<void>
  streamingText: string
  isLoading: boolean
  error: Error | null
}

export function useAIGenerate(): UseAIGenerateReturn {
  const [streamingText, setStreamingText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const generate = useCallback(
    async (topic: string, requirements?: GenerateRequirements) => {
      setIsLoading(true)
      setError(null)
      setStreamingText('')

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, requirements }),
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

  return { generate, streamingText, isLoading, error }
}
