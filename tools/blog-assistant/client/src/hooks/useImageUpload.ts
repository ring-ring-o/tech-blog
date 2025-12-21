import { useState, useCallback } from 'react'

interface ImageUploadResult {
  filename: string
  path: string
  markdownUrl: string
  markdown: string
  width: number
  height: number
  size: number
}

interface UseImageUploadReturn {
  uploadFile: (file: File) => Promise<ImageUploadResult | null>
  uploadBase64: (data: string, filename?: string) => Promise<ImageUploadResult | null>
  isUploading: boolean
  error: Error | null
  lastResult: ImageUploadResult | null
  clearError: () => void
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastResult, setLastResult] = useState<ImageUploadResult | null>(null)

  const uploadFile = useCallback(async (file: File): Promise<ImageUploadResult | null> => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

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
  }, [])

  const uploadBase64 = useCallback(async (
    data: string,
    filename: string = 'pasted-image.png'
  ): Promise<ImageUploadResult | null> => {
    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, filename }),
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
  }, [])

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
  }
}
