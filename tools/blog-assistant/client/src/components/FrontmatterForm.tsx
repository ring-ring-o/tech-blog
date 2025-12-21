import { useState, useCallback } from 'react'
import type { ArticleFrontmatter } from '@shared/types'

interface FrontmatterFormProps {
  value: ArticleFrontmatter
  onChange: (value: ArticleFrontmatter) => void
}

export function FrontmatterForm({ value, onChange }: FrontmatterFormProps) {
  const [tagInput, setTagInput] = useState('')

  const handleChange = useCallback(
    (field: keyof ArticleFrontmatter, fieldValue: unknown) => {
      onChange({ ...value, [field]: fieldValue })
    },
    [value, onChange]
  )

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim()
    if (tag && !value.tags.includes(tag)) {
      handleChange('tags', [...value.tags, tag])
      setTagInput('')
    }
  }, [tagInput, value.tags, handleChange])

  const handleRemoveTag = useCallback(
    (tag: string) => {
      handleChange(
        'tags',
        value.tags.filter((t) => t !== tag)
      )
    },
    [value.tags, handleChange]
  )

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleAddTag()
      }
    },
    [handleAddTag]
  )

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
          <span className="text-gray-400 ml-1">({value.title.length}/200)</span>
        </label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => handleChange('title', e.target.value)}
          maxLength={200}
          placeholder="記事のタイトル"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明
          <span className="text-gray-400 ml-1">({value.description.length}/300)</span>
        </label>
        <textarea
          value={value.description}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={300}
          rows={2}
          placeholder="記事の概要（メタディスクリプション）"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          公開日
        </label>
        <input
          type="date"
          value={value.publishedAt}
          onChange={(e) => handleChange('publishedAt', e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タグ
          <span className="text-gray-400 ml-1">({value.tags.length}/10)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="タグを入力してEnter"
            disabled={value.tags.length >= 10}
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!tagInput.trim() || value.tags.length >= 10}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            追加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {value.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="w-4 h-4 flex items-center justify-center hover:bg-blue-200 rounded-full"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
