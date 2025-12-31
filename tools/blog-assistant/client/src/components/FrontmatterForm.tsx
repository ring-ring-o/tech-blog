import { useState, useCallback, useEffect, useRef } from 'react'
import type { ArticleFrontmatter } from '@shared/types'
import { CONTENT_LIMITS } from '@shared/constants/content'

interface FrontmatterFormProps {
  value: ArticleFrontmatter
  onChange: (value: ArticleFrontmatter) => void
  onGenerateDescription?: () => void
  onSuggestTags?: () => void
  /** AI機能実行中 */
  isAILoading?: boolean
}

/** インラインコマンドポップアップ */
function InlineCommandPopup({
  isOpen,
  label,
  description,
  onExecute,
  onClose,
}: {
  isOpen: boolean
  label: string
  description: string
  onExecute: () => void
  onClose: () => void
}) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onExecute()
        onClose()
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onExecute, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px]"
    >
      <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase">
        AI機能
      </div>
      <button
        type="button"
        onClick={() => {
          onExecute()
          onClose()
        }}
        className="w-full px-3 py-2 flex items-center gap-2 text-left bg-blue-50 text-blue-700"
      >
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <div>
          <div className="font-medium text-sm">{label}</div>
          <div className="text-xs text-gray-500">{description}</div>
        </div>
      </button>
      <div className="px-3 py-1 text-xs text-gray-400 border-t">
        Enter で実行 / Esc で閉じる
      </div>
    </div>
  )
}

export function FrontmatterForm({ value, onChange, onGenerateDescription, onSuggestTags, isAILoading }: FrontmatterFormProps) {
  const [tagInput, setTagInput] = useState('')
  const [existingTags, setExistingTags] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tagListRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  // スラッシュコマンドの状態
  const [showDescriptionCommand, setShowDescriptionCommand] = useState(false)
  const [showTagCommand, setShowTagCommand] = useState(false)

  // ハイライトされたタグが変更されたときにスクロールして表示
  useEffect(() => {
    if (!isDropdownOpen || !tagListRef.current || highlightedIndex < 0) return
    const highlightedElement = tagListRef.current.querySelector(`[data-tag-index="${highlightedIndex}"]`)
    if (highlightedElement) {
      highlightedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [isDropdownOpen, highlightedIndex])

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
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          説明
          <span className="text-gray-400 ml-1">({value.description.length}/{CONTENT_LIMITS.DESCRIPTION_MAX_LENGTH})</span>
          {onGenerateDescription && (
            <span className="text-gray-400 ml-2 text-xs">/ でAI生成</span>
          )}
        </label>
        <textarea
          ref={descriptionRef}
          value={value.description}
          onChange={(e) => {
            handleChange('description', e.target.value)
            // "/" が入力されたらコマンドメニューを表示
            if (e.target.value === '/' && onGenerateDescription) {
              setShowDescriptionCommand(true)
            } else {
              setShowDescriptionCommand(false)
            }
          }}
          onKeyDown={(e) => {
            if (showDescriptionCommand) {
              if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Backspace') {
                e.preventDefault()
                if (e.key === 'Backspace' || e.key === 'Escape') {
                  handleChange('description', '')
                }
                setShowDescriptionCommand(false)
              }
            }
          }}
          maxLength={CONTENT_LIMITS.DESCRIPTION_MAX_LENGTH}
          rows={2}
          placeholder="記事の概要（メタディスクリプション）"
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isAILoading}
        />
        {onGenerateDescription && (
          <InlineCommandPopup
            isOpen={showDescriptionCommand}
            label="説明生成"
            description="記事内容から説明文を生成"
            onExecute={() => {
              handleChange('description', '')
              onGenerateDescription()
            }}
            onClose={() => {
              setShowDescriptionCommand(false)
              handleChange('description', '')
              descriptionRef.current?.focus()
            }}
          />
        )}
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
          {onSuggestTags && (
            <span className="text-gray-400 ml-2 text-xs">/ でAI提案</span>
          )}
        </label>

        {/* Tag Input with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex gap-2 mb-2">
            <input
              ref={inputRef}
              type="text"
              value={tagInput}
              onChange={(e) => {
                handleInputChange(e)
                // "/" が入力されたらコマンドメニューを表示
                if (e.target.value === '/' && onSuggestTags) {
                  setShowTagCommand(true)
                  setIsDropdownOpen(false)
                } else {
                  setShowTagCommand(false)
                }
              }}
              onKeyDown={(e) => {
                if (showTagCommand) {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    setTagInput('')
                    setShowTagCommand(false)
                    onSuggestTags?.()
                  } else if (e.key === 'Escape' || e.key === 'Backspace') {
                    e.preventDefault()
                    setTagInput('')
                    setShowTagCommand(false)
                  }
                } else {
                  handleTagKeyDown(e)
                }
              }}
              onFocus={handleInputFocus}
              placeholder="タグを検索または入力..."
              disabled={value.tags.length >= CONTENT_LIMITS.MAX_TAGS || isAILoading}
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

          {/* AI Tag Command Popup */}
          {onSuggestTags && (
            <InlineCommandPopup
              isOpen={showTagCommand}
              label="タグ提案"
              description="記事内容から推奨タグを提案"
              onExecute={() => {
                setTagInput('')
                onSuggestTags()
              }}
              onClose={() => {
                setShowTagCommand(false)
                setTagInput('')
                inputRef.current?.focus()
              }}
            />
          )}

          {/* Dropdown */}
          {isDropdownOpen && value.tags.length < CONTENT_LIMITS.MAX_TAGS && (
            <div
              ref={tagListRef}
              className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredTags.length > 0 ? (
                <>
                  <div className="px-3 py-1.5 text-xs text-gray-500 bg-gray-50 border-b">
                    既存のタグ ({filteredTags.length}件)
                  </div>
                  {filteredTags.map((tag, index) => (
                    <button
                      key={tag}
                      type="button"
                      data-tag-index={index}
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
