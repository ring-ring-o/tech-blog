import { useState, useCallback } from 'react'
import type { BlogDirectory } from '@shared/types'
import { API_ENDPOINTS } from '@shared/constants/api'
import { CONTENT_LIMITS } from '@shared/constants/content'

interface CreateArticleModalProps {
  isOpen: boolean
  onConfirm: (title: string, slug: string, directory: BlogDirectory) => void
  onCancel: () => void
}

export function CreateArticleModal({
  isOpen,
  onConfirm,
  onCancel,
}: CreateArticleModalProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [translatedSlug, setTranslatedSlug] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [directory, setDirectory] = useState<BlogDirectory>('blog')

  // 日付文字列を取得
  const dateStr = new Date().toISOString().split('T')[0]

  // スラッグをAIで生成
  const generateSlug = useCallback(async (targetTitle: string) => {
    if (!targetTitle.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(API_ENDPOINTS.ARTICLES_GENERATE_SLUG, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: targetTitle }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate slug')
      }

      const data = await response.json()
      setTranslatedSlug(data.slug)
      setSlug(data.slug)
    } catch (err) {
      console.error('Slug generation error:', err)
      setError('スラッグの生成に失敗しました。手動で入力してください。')
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // タイトル変更時
  const handleTitleChange = (value: string) => {
    setTitle(value)
    // 翻訳結果をクリア（新しいタイトルで再生成が必要）
    setTranslatedSlug('')
    // 手動入力がない場合はタイトルをスラッグにセット
    if (!slug || slug === translatedSlug) {
      setSlug(value)
    }
  }

  // タイトル確定時（blur または Enter）
  const handleTitleBlur = () => {
    if (autoTranslate && title.trim() && !translatedSlug) {
      generateSlug(title)
    }
  }

  // 自動翻訳トグル
  const handleAutoTranslateToggle = () => {
    const newValue = !autoTranslate
    setAutoTranslate(newValue)
    if (newValue && title.trim() && !translatedSlug) {
      generateSlug(title)
    }
  }

  // 再生成
  const handleRegenerate = () => {
    generateSlug(title)
  }

  // 翻訳結果を適用
  const applyTranslatedSlug = () => {
    if (translatedSlug) {
      setSlug(translatedSlug)
    }
  }

  // 最終的なファイル名用スラッグ（英数字とハイフンのみ）
  const finalSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, CONTENT_LIMITS.SLUG_MAX_LENGTH)

  // 日本語が含まれているかチェック
  const hasJapanese = /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/.test(slug)

  const handleConfirm = () => {
    if (title.trim() && finalSlug.trim()) {
      onConfirm(title, finalSlug, directory)
      // リセット
      setTitle('')
      setSlug('')
      setTranslatedSlug('')
      setError(null)
      setDirectory('blog')
    }
  }

  const handleClose = () => {
    // リセット
    setTitle('')
    setSlug('')
    setTranslatedSlug('')
    setError(null)
    setDirectory('blog')
    onCancel()
  }

  if (!isOpen) return null

  // プレビュー用のファイル名（フォルダ構造）
  const previewFilename = `${dateStr}-${finalSlug || 'your-slug'}/index.md`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">新規記事を作成</h2>
          <p className="text-sm text-gray-500 mt-1">
            まずタイトルを入力してください。記事フォルダが作成されます。
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Title input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTitleBlur()
                }
              }}
              placeholder="記事のタイトルを入力"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Directory selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              保存先ディレクトリ
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDirectory('blog')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  directory === 'blog'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">blog</div>
                <div className="text-xs text-gray-500">本番用</div>
              </button>
              <button
                type="button"
                onClick={() => setDirectory('blog-demo')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  directory === 'blog-demo'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">blog-demo</div>
                <div className="text-xs text-gray-500">デモ用</div>
              </button>
            </div>
          </div>

          {/* Auto translate toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              AIでファイル名を英訳
            </label>
            <button
              type="button"
              onClick={handleAutoTranslateToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoTranslate ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoTranslate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* AI translation result */}
          {autoTranslate && title.trim() && (
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-blue-600 font-medium">AI翻訳結果</span>
                {!isGenerating && translatedSlug && (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    再生成
                  </button>
                )}
              </div>
              {isGenerating ? (
                <p className="text-sm text-blue-800 animate-pulse">生成中...</p>
              ) : translatedSlug ? (
                <div className="flex items-center gap-2">
                  <code className="text-sm text-blue-800 bg-blue-100 px-2 py-1 rounded flex-1">
                    {translatedSlug}
                  </code>
                  <button
                    type="button"
                    onClick={applyTranslatedSlug}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    適用
                  </button>
                </div>
              ) : error ? (
                <p className="text-sm text-red-600">{error}</p>
              ) : (
                <p className="text-sm text-gray-500">タイトルを入力すると翻訳されます</p>
              )}
            </div>
          )}

          {/* Slug input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ファイル名（スラッグ）
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="example-article-name"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {hasJapanese && (
              <p className="mt-1 text-xs text-amber-600">
                ※ 日本語は自動的にハイフンに変換されます
              </p>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">作成されるファイル:</p>
            <p className="text-sm font-mono text-gray-800 break-all">
              {previewFilename}
            </p>
            <p className="text-xs text-gray-500 mt-2">URL:</p>
            <p className="text-sm font-mono text-blue-600 break-all">
              /posts/{dateStr}-{finalSlug || 'your-slug'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!title.trim() || !finalSlug.trim() || isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            作成して編集開始
          </button>
        </div>
      </div>
    </div>
  )
}
