import { useState, useCallback } from 'react'
import type { Assist, SaveAssistRequest, AssistCategory } from '@shared/types'
import { API_ENDPOINTS } from '@shared/constants/api'

interface UseAssistsReturn {
  assists: Assist[]
  isLoading: boolean
  error: Error | null
  loadAssists: (category?: AssistCategory) => Promise<void>
  getAssist: (id: string) => Promise<Assist | null>
  createAssist: (data: SaveAssistRequest) => Promise<Assist | null>
  updateAssist: (id: string, data: SaveAssistRequest) => Promise<Assist | null>
  deleteAssist: (id: string) => Promise<boolean>
  executeAssist: (
    assistId: string,
    variables: Record<string, string>,
    onText: (text: string) => void
  ) => Promise<void>
  isExecuting: boolean
}

export function useAssists(): UseAssistsReturn {
  const [assists, setAssists] = useState<Assist[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadAssists = useCallback(async (category?: AssistCategory) => {
    setIsLoading(true)
    setError(null)
    try {
      const url = category
        ? `${API_ENDPOINTS.ASSISTS}?category=${category}`
        : API_ENDPOINTS.ASSISTS
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load assists')
      const data = await response.json()
      setAssists(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getAssist = useCallback(async (id: string): Promise<Assist | null> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ASSISTS}/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to load assist')
      }
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    }
  }, [])

  const createAssist = useCallback(async (data: SaveAssistRequest): Promise<Assist | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.ASSISTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create assist')
      const assist = await response.json()
      setAssists((prev) => [...prev, assist])
      return assist
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    }
  }, [])

  const updateAssist = useCallback(async (id: string, data: SaveAssistRequest): Promise<Assist | null> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ASSISTS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update assist')
      const assist = await response.json()
      setAssists((prev) => prev.map((s) => (s.id === id ? assist : s)))
      return assist
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    }
  }, [])

  const deleteAssist = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.ASSISTS}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) return false
      setAssists((prev) => prev.filter((s) => s.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return false
    }
  }, [])

  const executeAssist = useCallback(
    async (
      assistId: string,
      variables: Record<string, string>,
      onText: (text: string) => void
    ) => {
      setIsExecuting(true)
      setError(null)

      try {
        const response = await fetch(`${API_ENDPOINTS.ASSISTS}/${assistId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assistId, variables }),
        })

        if (!response.ok) {
          throw new Error('Failed to execute assist')
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
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
                  onText(data.content)
                } else if (data.type === 'error') {
                  throw new Error(data.message)
                }
              } catch {
                // JSON parse error - skip
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        throw err
      } finally {
        setIsExecuting(false)
      }
    },
    []
  )

  return {
    assists,
    isLoading,
    error,
    loadAssists,
    getAssist,
    createAssist,
    updateAssist,
    deleteAssist,
    executeAssist,
    isExecuting,
  }
}
