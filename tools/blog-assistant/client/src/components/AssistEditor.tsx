import { useState, useEffect } from 'react'
import type { Assist, AssistCategory, SaveAssistRequest } from '@shared/types'

interface AssistEditorProps {
  assist: Assist | null
  isNew: boolean
  onSave: (data: SaveAssistRequest) => Promise<void>
  onDelete?: () => Promise<void>
  onClose: () => void
}

const categoryOptions: { value: AssistCategory; label: string }[] = [
  { value: 'review', label: '校閲' },
  { value: 'generate', label: '生成' },
  { value: 'assist', label: '補助' },
  { value: 'meta', label: 'メタ情報' },
]

export function AssistEditor({
  assist,
  isNew,
  onSave,
  onDelete,
  onClose,
}: AssistEditorProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<AssistCategory>('assist')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userPromptTemplate, setUserPromptTemplate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (assist) {
      setName(assist.name)
      setDescription(assist.description)
      setCategory(assist.category)
      setSystemPrompt(assist.systemPrompt)
      setUserPromptTemplate(assist.userPromptTemplate)
    } else {
      setName('')
      setDescription('')
      setCategory('assist')
      setSystemPrompt('')
      setUserPromptTemplate('')
    }
  }, [assist])

  const handleSave = async () => {
    if (!name.trim() || !userPromptTemplate.trim()) return

    setIsSaving(true)
    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        category,
        systemPrompt: systemPrompt.trim(),
        userPromptTemplate: userPromptTemplate.trim(),
      })
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('このアシストを削除しますか？')) return

    setIsDeleting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const isBuiltIn = assist?.isBuiltIn ?? false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {isNew ? '新規アシスト作成' : isBuiltIn ? 'アシスト詳細' : 'アシスト編集'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isBuiltIn && (
            <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
              ビルトインアシストは編集できません。プロンプトの確認のみ可能です。
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アシスト名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isBuiltIn}
              placeholder="例: 文章を簡潔にする"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBuiltIn}
              placeholder="例: 冗長な表現を削除して簡潔にします"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AssistCategory)}
              disabled={isBuiltIn}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* System Prompt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              システムプロンプト
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={isBuiltIn}
              placeholder="AIの役割や振る舞いを定義します"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm font-mono"
            />
          </div>

          {/* User Prompt Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ユーザープロンプトテンプレート <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              利用可能な変数: {'{{content}}'}, {'{{title}}'}, {'{{description}}'}, {'{{tags}}'}, {'{{selection}}'}, {'{{today}}'}
            </p>
            <textarea
              value={userPromptTemplate}
              onChange={(e) => setUserPromptTemplate(e.target.value)}
              disabled={isBuiltIn}
              placeholder="例: 以下の文章を簡潔にしてください。&#10;&#10;{{selection}}"
              rows={8}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 text-sm font-mono"
            />
          </div>

          {/* Variables Preview */}
          {assist?.variables && assist.variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                使用中の変数
              </label>
              <div className="flex flex-wrap gap-1">
                {assist.variables.map((v) => (
                  <span
                    key={v}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div>
            {!isNew && !isBuiltIn && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {isBuiltIn ? '閉じる' : 'キャンセル'}
            </button>
            {!isBuiltIn && (
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim() || !userPromptTemplate.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? '保存中...' : isNew ? '作成' : '保存'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
