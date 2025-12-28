import { useState, useCallback, useEffect, useRef } from 'react'
import type { ArticleFrontmatter } from '@shared/types'
import { CONTENT_LIMITS } from '@shared/constants/content'

interface FrontmatterFormProps {
  value: ArticleFrontmatter
  onChange: (value: ArticleFrontmatter) => void
}

export function FrontmatterForm({ value, onChange }: FrontmatterFormProps) {
  const [tagInput, setTagInput] = useState('')
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/articles/tags')
      .then((res) => res.json())
      .then((tags) => setExistingTags(tags))
      .catch(() => setExistingTags([]))
  }, [])

  // クリック外でドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = useCallback(
    (field: keyof ArticleFrontmatter, fieldValue: unknown) => {
      onChange({ ...value, [field]: fieldValue })
    },
    [value, onChange]
  )

  // フィルタリングされたタグ候補
  const filteredTags = existingTags.filter(
    (tag) =>
      !value.tags.includes(tag) &&
      tag.toLowerCase().includes(tagInput.toLowerCase())
  )

  const handleAddTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim()
      if (trimmedTag && !value.tags.includes(trimmedTag) && value.tags.length < CONTENT_LIMITS.MAX_TAGS) {
        handleChange('tags', [...value.tags, trimmedTag])
        setTagInput('')
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
      }
    },
    [value.tags, handleChange]
  )

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
        if (highlightedIndex >= 0 && highlightedIndex < filteredTags.length) {
          handleAddTag(filteredTags[highlightedIndex])
        } else if (tagInput.trim()) {
          handleAddTag(tagInput)
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlightedIndex((prev) =>
          prev < filteredTags.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1))
      } else if (e.key === 'Escape') {
        setIsDropdownOpen(false)
        setHighlightedIndex(-1)
      }
    },
    [tagInput, filteredTags, highlightedIndex, handleAddTag]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
    setIsDropdownOpen(true)
    setHighlightedIndex(-1)
  }

  const handleInputFocus = () => {
    setIsDropdownOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タイトル
          <span className="text-gray-400 ml-1">({value.title.length}/{CONTENT_LIMITS.TITLE_MAX_LENGTH})</span>
        </label>
        <input
          type="text"
          value={value.title}
          onChange={(e) => handleChange('title', e.target.value)}
          maxLength={CONTENT_LIMITS.TITLE_MAX_LENGTH}
          placeholder="記事のタイトル"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明
          <span className="text-gray-400 ml-1">({value.description.length}/{CONTENT_LIMITS.DESCRIPTION_MAX_LENGTH})</span>
        </label>
        <textarea
          value={value.description}
          onChange={(e) => handleChange('description', e.target.value)}
          maxLength={CONTENT_LIMITS.DESCRIPTION_MAX_LENGTH}
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
          <span className="text-gray-400 ml-1">({value.tags.length}/{CONTENT_LIMITS.MAX_TAGS})</span>
        </label>

        {/* Tag Input with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex gap-2 mb-2">
            <input
              ref={inputRef}
              type="text"
              value={tagInput}
              onChange={handleInputChange}
              onKeyDown={handleTagKeyDown}
              onFocus={handleInputFocus}
              placeholder="タグを検索または入力..."
              disabled={value.tags.length >= CONTENT_LIMITS.MAX_TAGS}
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => handleAddTag(tagInput)}
              disabled={!tagInput.trim() || value.tags.length >= CONTENT_LIMITS.MAX_TAGS}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加
            </button>
          </div>

          {/* Dropdown */}
          {isDropdownOpen && value.tags.length < CONTENT_LIMITS.MAX_TAGS && (
            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredTags.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border-b">
                    既存のタグ ({filteredTags.length}件)
                  </div>
                  {filteredTags.map((tag, index) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 ${
                        index === highlightedIndex ? 'bg-blue-100' : ''
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </>
              ) : tagInput.trim() ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  「{tagInput}」を新しいタグとして追加できます
                </div>
              ) : existingTags.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  既存のタグがありません
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  すべてのタグが選択済みです
                </div>
              )}
            </div>
          )}
        </div>

        {/* 選択済みタグ */}
        {value.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
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
        )}
      </div>
    </div>
  )
}
