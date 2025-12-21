import { useState, useCallback, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Skill } from '@shared/types'
import { useSkills } from '../hooks/useSkills'

interface SkillExecutorProps {
  skill: Skill | null
  content: string
  title: string
  description: string
  tags: string[]
  selection: string
  onClose: () => void
  onApplyResult: (result: string) => void
}

export function SkillExecutor({
  skill,
  content,
  title,
  description,
  tags,
  selection,
  onClose,
  onApplyResult,
}: SkillExecutorProps) {
  const { executeSkill, isExecuting } = useSkills()
  const [result, setResult] = useState('')
  const [topic, setTopic] = useState('')
  const [hasExecuted, setHasExecuted] = useState(false)

  // 下書き生成スキルの場合はトピック入力が必要
  const needsTopic = skill?.id === 'generate-draft'

  const handleExecute = useCallback(async () => {
    if (!skill) return

    setResult('')
    setHasExecuted(true)

    const today = new Date().toISOString().split('T')[0]
    const variables: Record<string, string> = {
      content,
      title,
      description,
      tags: tags.join(', '),
      selection,
      topic,
      today,
    }

    try {
      await executeSkill(skill.id, variables, (text) => {
        setResult((prev) => prev + text)
      })
    } catch (err) {
      setResult(`エラー: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }, [skill, content, title, description, tags, selection, topic, executeSkill])

  // 自動実行（トピック不要のスキル）
  useEffect(() => {
    if (skill && !needsTopic && !hasExecuted) {
      handleExecute()
    }
  }, [skill, needsTopic, hasExecuted, handleExecute])

  if (!skill) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{skill.name}</h2>
            <p className="text-sm text-gray-500">{skill.description}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Topic Input (for generate-draft) */}
        {needsTopic && !hasExecuted && (
          <div className="px-6 py-4 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              トピックを入力
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="記事のトピックを入力..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleExecute}
                disabled={!topic.trim() || isExecuting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                生成
              </button>
            </div>
          </div>
        )}

        {/* Selection Preview (if using selection) */}
        {selection && skill.variables.includes('selection') && (
          <div className="px-6 py-3 border-b bg-gray-50">
            <p className="text-xs text-gray-500 mb-1">選択テキスト:</p>
            <p className="text-sm text-gray-700 line-clamp-3">{selection}</p>
          </div>
        )}

        {/* Result */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {isExecuting && !result && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span>実行中...</span>
            </div>
          )}
          {result && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        {hasExecuted && !isExecuting && result && (
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={handleExecute}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              再実行
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(result)
              }}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              コピー
            </button>
            <button
              onClick={() => {
                onApplyResult(result)
                onClose()
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              結果を適用
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
