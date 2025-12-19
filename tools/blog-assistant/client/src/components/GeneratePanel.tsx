import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface GeneratePanelProps {
  text: string
  isLoading: boolean
  onApply: () => void
}

export function GeneratePanel({ text, isLoading, onApply }: GeneratePanelProps) {
  if (!text && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="mb-2">トピックを入力して「下書き生成」をクリックすると</p>
          <p>AIが記事の下書きを作成します</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-none">
      {isLoading && (
        <div className="flex items-center gap-2 mb-4 text-purple-600">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>下書き生成中...</span>
        </div>
      )}

      {text && !isLoading && (
        <div className="mb-4">
          <button
            onClick={onApply}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            エディタに適用
          </button>
        </div>
      )}

      <div className="markdown-preview bg-gray-50 p-4 rounded-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      </div>
    </div>
  )
}
