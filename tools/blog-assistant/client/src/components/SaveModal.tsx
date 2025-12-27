import { useState, useEffect, useCallback, useRef } from 'react'
import type { BlogDirectory } from '@shared/types'
import { API_ENDPOINTS } from '@shared/constants/api'
import { CONTENT_LIMITS } from '@shared/constants/content'

interface SaveModalProps {
  isOpen: boolean
  title: string
  publishedAt: string
  directory: BlogDirectory
  existingFilename?: string // 更新時に既存ファイル名を渡す
  onSave: (slug: string, directory: BlogDirectory) => void
  onCancel: () => void
  onDirectoryChange: (directory: BlogDirectory) => void
}

export function SaveModal({
  isOpen,
  title,
  publishedAt,
  directory,
  existingFilename,
  onSave,
  onCancel,
  onDirectoryChange,
}: SaveModalProps) {
  const isUpdate = !!existingFilename
  const [slug, setSlug] = useState('')
  const [translatedSlug, setTranslatedSlug] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [autoTranslate, setAutoTranslate] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const prevIsOpen = useRef(false)

  // 日付文字列を取得
  const dateStr = publishedAt.split('T')[0]

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

  // モーダルが開いた時の初期化（false → true の変化時のみ）
  useEffect(() => {
    if (isOpen && !prevIsOpen.current) {
      // 初期値としてタイトルを設定
      setSlug(title)
      setTranslatedSlug('')
      setError(null)

      // 自動翻訳がONの場合はAIでスラッグを生成（新規作成時のみ）
      if (!isUpdate && autoTranslate && title.trim()) {
        generateSlug(title)
      }
    }
    prevIsOpen.current = isOpen
  }, [isOpen, title, autoTranslate, generateSlug, isUpdate])

  // 自動翻訳トグルがONに変更された時
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

  // スラッグを正規化（保存用）
  const normalizeSlug = (value: string): string => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, CONTENT_LIMITS.SLUG_MAX_LENGTH)
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

  const handleSave = () => {
    if (isUpdate || finalSlug.trim()) {
      onSave(isUpdate ? '' : finalSlug, directory)
    }
  }

  // 翻訳結果を適用
  const applyTranslatedSlug = () => {
    if (translatedSlug) {
      setSlug(translatedSlug)
    }
  }

  if (!isOpen) return null

  // プレビュー用のファイル名（フォルダ構造）
  const previewFilename = isUpdate
    ? existingFilename
    : `${dateStr}-${finalSlug || 'your-slug'}/index.md`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-800">
              {isUpdate ? '記事を更新' : '記事を保存'}
            </h2>
            {isUpdate && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">
                更新
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-4">
          {/* Directory selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              保存先ディレクトリ
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onDirectoryChange('blog')}
                disabled={isUpdate}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  directory === 'blog'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isUpdate ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium">blog</div>
                <div className="text-xs text-gray-500">本番用</div>
              </button>
              <button
                type="button"
                onClick={() => onDirectoryChange('blog-demo')}
                disabled={isUpdate}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-colors ${
                  directory === 'blog-demo'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isUpdate ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium">blog-demo</div>
                <div className="text-xs text-gray-500">デモ用</div>
              </button>
            </div>
            {isUpdate && (
              <p className="mt-1 text-xs text-gray-500">
                更新時はディレクトリを変更できません
              </p>
            )}
          </div>

          {/* Original title */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">タイトル</label>
            <p className="text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
              {title}
            </p>
          </div>

          {/* Only show slug input for new articles */}
          {!isUpdate && (
            <>
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
              {autoTranslate && (
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
                    <p className="text-sm text-gray-500">翻訳結果がありません</p>
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
            </>
          )}

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">
              {isUpdate ? '更新されるファイル:' : '保存されるファイル名:'}
            </p>
            <p className="text-sm font-mono text-gray-800 break-all">
              {previewFilename}
            </p>
            <p className="text-xs text-gray-500 mt-2">URL:</p>
            <p className="text-sm font-mono text-blue-600 break-all">
              /posts/{isUpdate
                ? existingFilename?.replace(/\/index\.md$/, '').replace(/\.md$/, '')
                : `${dateStr}-${finalSlug || 'your-slug'}`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={(!isUpdate && !finalSlug.trim()) || isGenerating}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isUpdate
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isUpdate ? '更新する' : '保存する'}
          </button>
        </div>
      </div>
    </div>
  )
}
