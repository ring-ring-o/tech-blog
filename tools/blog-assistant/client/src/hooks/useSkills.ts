import { useState, useCallback } from 'react'
import type { Skill, SaveSkillRequest, SkillCategory } from '@shared/types'
import { API_ENDPOINTS } from '@shared/constants/api'

interface UseSkillsReturn {
  skills: Skill[]
  isLoading: boolean
  error: Error | null
  loadSkills: (category?: SkillCategory) => Promise<void>
  getSkill: (id: string) => Promise<Skill | null>
  createSkill: (data: SaveSkillRequest) => Promise<Skill | null>
  updateSkill: (id: string, data: SaveSkillRequest) => Promise<Skill | null>
  deleteSkill: (id: string) => Promise<boolean>
  executeSkill: (
    skillId: string,
    variables: Record<string, string>,
    onText: (text: string) => void
  ) => Promise<void>
  isExecuting: boolean
}

export function useSkills(): UseSkillsReturn {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadSkills = useCallback(async (category?: SkillCategory) => {
    setIsLoading(true)
    setError(null)
    try {
      const url = category
        ? `${API_ENDPOINTS.SKILLS}?category=${category}`
        : API_ENDPOINTS.SKILLS
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to load skills')
      const data = await response.json()
      setSkills(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSkill = useCallback(async (id: string): Promise<Skill | null> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SKILLS}/${id}`)
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to load skill')
      }
      return await response.json()
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    }
  }, [])

  const createSkill = useCallback(async (data: SaveSkillRequest): Promise<Skill | null> => {
    try {
      const response = await fetch(API_ENDPOINTS.SKILLS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create skill')
      const skill = await response.json()
      setSkills((prev) => [...prev, skill])
      return skill
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    }
  }, [])

  const updateSkill = useCallback(async (id: string, data: SaveSkillRequest): Promise<Skill | null> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SKILLS}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to update skill')
      const skill = await response.json()
      setSkills((prev) => prev.map((s) => (s.id === id ? skill : s)))
      return skill
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return null
    }
  }, [])

  const deleteSkill = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_ENDPOINTS.SKILLS}/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) return false
      setSkills((prev) => prev.filter((s) => s.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
      return false
    }
  }, [])

  const executeSkill = useCallback(
    async (
      skillId: string,
      variables: Record<string, string>,
      onText: (text: string) => void
    ) => {
      setIsExecuting(true)
      setError(null)

      try {
        const response = await fetch(`${API_ENDPOINTS.SKILLS}/${skillId}/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId, variables }),
        })

        if (!response.ok) {
          throw new Error('Failed to execute skill')
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
    skills,
    isLoading,
    error,
    loadSkills,
    getSkill,
    createSkill,
    updateSkill,
    deleteSkill,
    executeSkill,
    isExecuting,
  }
}
