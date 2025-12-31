import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { TagSuggestion } from '@shared/types'

export interface AIResult {
  id: string
  type: 'review' | 'generate' | 'assist' | 'description' | 'tags'
  title: string
  content: string
  timestamp: Date
  canApply: boolean
  /** タグ提案の場合の詳細データ */
  tagSuggestions?: TagSuggestion[]
}

interface TopicInputState {
  isOpen: boolean
  topic: string
}

export interface AIResultsPanelHandle {
  focus: () => void
}

interface AIResultsPanelProps {
  results: AIResult[]
  isLoading: boolean
  loadingTitle?: string
  streamingContent?: string
  onApply: (result: AIResult, selectedTags?: string[]) => void
  onClear: () => void
  onEscape?: () => void
  topicInput?: TopicInputState
  onTopicChange?: (topic: string) => void
  onTopicSubmit?: () => void
  onTopicCancel?: () => void
}

// タイプに応じたラベルとスタイル
const typeConfig = {
  review: { label: '校閲', className: 'bg-blue-100 text-blue-700' },
  generate: { label: '生成', className: 'bg-purple-100 text-purple-700' },
  assist: { label: 'アシスト', className: 'bg-green-100 text-green-700' },
  description: { label: '説明', className: 'bg-amber-100 text-amber-700' },
  tags: { label: 'タグ', className: 'bg-teal-100 text-teal-700' },
}

interface ResultItemProps {
  result: AIResult
  index: number
  isSelected: boolean
  onApply: (result: AIResult, selectedTags?: string[]) => void
  onCopy: () => void
  onSelect: () => void
}

const ResultItem = forwardRef<HTMLDivElement, ResultItemProps>(
  ({ result, index, isSelected, onApply, onCopy, onSelect }, ref) => {
    const [selectedTags, setSelectedTags] = useState<string[]>(
      result.tagSuggestions?.map((s) => s.tag) || []
    )

    const config = typeConfig[result.type]

    const handleTagToggle = (tag: string) => {
      setSelectedTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      )
    }

    const handleSelectAll = () => {
      if (result.tagSuggestions) {
        setSelectedTags(result.tagSuggestions.map((s) => s.tag))
      }
    }

    const handleDeselectAll = () => {
      setSelectedTags([])
    }

    const handleApply = useCallback(() => {
      onApply(result, result.type === 'tags' ? selectedTags : undefined)
    }, [onApply, result, selectedTags])

    return (
      <div
        ref={ref}
        className={`p-4 border-b transition-colors cursor-pointer ${
          isSelected ? 'bg-blue-50 ring-2 ring-inset ring-blue-300' : 'hover:bg-gray-50'
        }`}
        onClick={onSelect}
        tabIndex={0}
        role="listitem"
        aria-selected={isSelected}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {/* Index badge for keyboard shortcut hint */}
            <span className="w-5 h-5 flex items-center justify-center text-[10px] font-mono bg-gray-200 text-gray-600 rounded">
              {index + 1}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded ${config.className}`}>
              {config.label}
            </span>
            <span className="text-sm font-medium text-gray-700">{result.title}</span>
          </div>
          <span className="text-xs text-gray-400">
            {result.timestamp.toLocaleTimeString()}
          </span>
        </div>

        {/* タグ提案の場合は特別なUI */}
        {result.type === 'tags' && result.tagSuggestions ? (
          <div className="mb-3">
            <div className="flex gap-2 mb-2">
              <button
                onClick={(e) => { e.stopPropagation(); handleSelectAll() }}
                className="text-xs text-blue-600 hover:underline"
              >
                すべて選択
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeselectAll() }}
                className="text-xs text-gray-500 hover:underline"
              >
                すべて解除
              </button>
            </div>
            <div className="space-y-2">
              {result.tagSuggestions.map((suggestion) => (
                <label
                  key={suggestion.tag}
                  className="flex items-start gap-2 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(suggestion.tag)}
                    onChange={() => handleTagToggle(suggestion.tag)}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{suggestion.tag}</span>
                      {suggestion.isExisting && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-gray-200 text-gray-600 rounded">
                          既存
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{suggestion.reason}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-700 mb-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.content}</ReactMarkdown>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onCopy() }}
            className={`px-3 py-1 text-sm rounded border transition-colors ${
              isSelected
                ? 'text-gray-700 bg-white hover:bg-gray-100 border-gray-300'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            コピー{isSelected && <span className="ml-1 text-xs text-gray-400">(c)</span>}
          </button>
          {result.canApply && (
            <button
              onClick={(e) => { e.stopPropagation(); handleApply() }}
              disabled={result.type === 'tags' && selectedTags.length === 0}
              className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {result.type === 'description'
                ? '説明に適用'
                : result.type === 'tags'
                  ? `タグを追加 (${selectedTags.length}件)`
                  : '記事に適用'}
              {isSelected && result.canApply && <span className="ml-1 text-xs opacity-75">(Enter)</span>}
            </button>
          )}
        </div>
      </div>
    )
  }
)

export const AIResultsPanel = forwardRef<AIResultsPanelHandle, AIResultsPanelProps>(
  function AIResultsPanel(
    {
      results,
      isLoading,
      loadingTitle,
      streamingContent,
      onApply,
      onClear,
      onEscape,
      topicInput,
      onTopicChange,
      onTopicSubmit,
      onTopicCancel,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null)
    const resultsContainerRef = useRef<HTMLDivElement>(null)
    const resultRefs = useRef<(HTMLDivElement | null)[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const [isFocused, setIsFocused] = useState(false)
    const prevResultsLength = useRef(results.length)

    // Expose focus method
    useImperativeHandle(ref, () => ({
      focus: () => {
        containerRef.current?.focus()
      },
    }))

    // Auto-scroll to new result and select it
    useEffect(() => {
      if (results.length > prevResultsLength.current) {
        // New result added, select it and scroll to top
        setSelectedIndex(0)
        resultsContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }
      prevResultsLength.current = results.length
    }, [results.length])

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        // トピック入力中はキーボードナビゲーションを無効化
        if (topicInput?.isOpen) return

        switch (e.key) {
          case 'Escape':
            e.preventDefault()
            setSelectedIndex(-1)
            onEscape?.()
            break
          case 'ArrowDown':
          case 'j':
            e.preventDefault()
            setSelectedIndex((prev) =>
              prev < results.length - 1 ? prev + 1 : prev
            )
            break
          case 'ArrowUp':
          case 'k':
            e.preventDefault()
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
            break
          case 'Enter':
            e.preventDefault()
            if (selectedIndex >= 0 && results[selectedIndex]?.canApply) {
              onApply(results[selectedIndex])
            }
            break
          case 'c':
            if (selectedIndex >= 0) {
              e.preventDefault()
              navigator.clipboard.writeText(results[selectedIndex].content)
            }
            break
          case '1':
          case '2':
          case '3':
          case '4':
          case '5':
          case '6':
          case '7':
          case '8':
          case '9':
            const index = parseInt(e.key) - 1
            if (index < results.length) {
              e.preventDefault()
              setSelectedIndex(index)
              resultRefs.current[index]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
              })
            }
            break
        }
      },
      [results, selectedIndex, onApply, onEscape, topicInput?.isOpen]
    )

    // Scroll selected item into view
    useEffect(() => {
      if (selectedIndex >= 0 && resultRefs.current[selectedIndex]) {
        resultRefs.current[selectedIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      }
    }, [selectedIndex])

    // トピック入力フォームがある場合も表示を続ける
    if (results.length === 0 && !isLoading && !topicInput?.isOpen) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4">
          <svg
            className="w-12 h-12 mb-3 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <p className="text-center">
            AI機能を使用すると、結果がここに表示されます
          </p>
          <p className="text-sm mt-2 text-center">
            エディタで「/」を入力するか、テキストを選択してください
          </p>
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className={`h-full flex flex-col outline-none ${
          isFocused ? 'ring-2 ring-inset ring-blue-400' : ''
        }`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        role="listbox"
        aria-label="AI結果一覧"
      >
        {/* Header */}
        {results.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {results.length}件の結果
              </span>
              {isFocused && (
                <span className="text-xs text-gray-400">
                  ↑↓で移動 • Enterで適用 • cでコピー • Escで戻る
                </span>
              )}
            </div>
            <button
              onClick={onClear}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              すべてクリア
            </button>
          </div>
        )}

        {/* Results */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto">
          {/* Topic Input Form */}
          {topicInput?.isOpen && (
            <div className="p-4 border-b bg-purple-50">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="text-sm font-medium text-purple-700">
                  下書きを生成
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={topicInput.topic}
                  onChange={(e) => onTopicChange?.(e.target.value)}
                  placeholder="記事のトピックを入力... 例: React Hooksの使い方"
                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && topicInput.topic.trim()) {
                      onTopicSubmit?.()
                    }
                    if (e.key === 'Escape') {
                      onTopicCancel?.()
                    }
                  }}
                />
                <button
                  onClick={onTopicCancel}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm"
                >
                  キャンセル
                </button>
                <button
                  onClick={onTopicSubmit}
                  disabled={!topicInput.topic.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                >
                  生成
                </button>
              </div>
            </div>
          )}

          {/* Streaming result */}
          {isLoading && (
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-blue-700">
                  {loadingTitle || '処理中...'}
                </span>
              </div>
              {streamingContent && (
                <div className="prose prose-sm max-w-none text-gray-700">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Past results */}
          {results.map((result, index) => (
            <ResultItem
              key={result.id}
              ref={(el) => { resultRefs.current[index] = el }}
              result={result}
              index={index}
              isSelected={selectedIndex === index}
              onApply={onApply}
              onCopy={() => navigator.clipboard.writeText(result.content)}
              onSelect={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      </div>
    )
  }
)
