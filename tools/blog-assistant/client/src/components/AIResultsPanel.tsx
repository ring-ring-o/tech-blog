import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface AIResult {
  id: string
  type: 'review' | 'generate' | 'skill'
  title: string
  content: string
  timestamp: Date
  canApply: boolean
}

interface AIResultsPanelProps {
  results: AIResult[]
  isLoading: boolean
  loadingTitle?: string
  streamingContent?: string
  onApply: (result: AIResult) => void
  onClear: () => void
}

export function AIResultsPanel({
  results,
  isLoading,
  loadingTitle,
  streamingContent,
  onApply,
  onClear,
}: AIResultsPanelProps) {
  if (results.length === 0 && !isLoading) {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      {results.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <span className="text-sm text-gray-600">
            {results.length}件の結果
          </span>
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            すべてクリア
          </button>
        </div>
      )}

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
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
        {results.map((result) => (
          <div key={result.id} className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 text-xs rounded ${
                    result.type === 'review'
                      ? 'bg-blue-100 text-blue-700'
                      : result.type === 'generate'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                  }`}
                >
                  {result.type === 'review'
                    ? '校閲'
                    : result.type === 'generate'
                      ? '生成'
                      : 'スキル'}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {result.title}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {result.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700 mb-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.content}
              </ReactMarkdown>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(result.content)}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded border"
              >
                コピー
              </button>
              {result.canApply && (
                <button
                  onClick={() => onApply(result)}
                  className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded"
                >
                  記事に適用
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
