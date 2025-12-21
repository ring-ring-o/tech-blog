import { useRef, useCallback, useState, DragEvent, ClipboardEvent } from 'react'
import { useImageUpload } from '../hooks/useImageUpload'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export function Editor({ value, onChange }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadFile, uploadBase64, isUploading, error } = useImageUpload()
  const [isDragging, setIsDragging] = useState(false)

  // カーソル位置にテキストを挿入
  const insertAtCursor = useCallback(
    (text: string) => {
      const textarea = textareaRef.current
      if (!textarea) {
        onChange(value + text)
        return
      }

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = value.substring(0, start) + text + value.substring(end)
      onChange(newValue)

      // カーソル位置を更新
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length
        textarea.focus()
      })
    },
    [value, onChange]
  )

  // 画像をアップロードしてMarkdownを挿入
  const handleImageUpload = useCallback(
    async (file: File) => {
      // 画像ファイルのみ受け付け
      if (!file.type.startsWith('image/')) {
        return
      }

      const result = await uploadFile(file)
      if (result) {
        insertAtCursor(`\n${result.markdown}\n`)
      }
    },
    [uploadFile, insertAtCursor]
  )

  // Base64画像をアップロード
  const handleBase64Upload = useCallback(
    async (dataUrl: string) => {
      const result = await uploadBase64(dataUrl)
      if (result) {
        insertAtCursor(`\n${result.markdown}\n`)
      }
    },
    [uploadBase64, insertAtCursor]
  )

  // クリップボードからの貼り付け
  const handlePaste = useCallback(
    async (e: ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            await handleImageUpload(file)
          }
          return
        }
      }
    },
    [handleImageUpload]
  )

  // ドラッグオーバー
  const handleDragOver = useCallback((e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  // ドラッグリーブ
  const handleDragLeave = useCallback((e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  // ドロップ
  const handleDrop = useCallback(
    async (e: DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = e.dataTransfer?.files
      if (!files || files.length === 0) return

      for (const file of files) {
        if (file.type.startsWith('image/')) {
          await handleImageUpload(file)
        }
      }
    },
    [handleImageUpload]
  )

  // ファイル選択
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      for (const file of files) {
        await handleImageUpload(file)
      }

      // 入力をリセット
      e.target.value = ''
    },
    [handleImageUpload]
  )

  // ファイル選択ボタンをクリック
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* ツールバー */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={handleUploadClick}
          disabled={isUploading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-300 disabled:opacity-50 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {isUploading ? 'アップロード中...' : '画像を追加'}
        </button>
        <span className="text-xs text-gray-400">
          またはクリップボードから貼り付け / ドラッグ&ドロップ
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* エディタ */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          placeholder="Markdownで記事を書いてください...&#10;&#10;画像はドラッグ&ドロップまたは貼り付けで追加できます"
          className={`editor-textarea w-full h-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed transition-colors ${
            isDragging
              ? 'border-blue-400 bg-blue-50 ring-2 ring-blue-300'
              : 'border-gray-300'
          }`}
        />

        {/* ドラッグオーバーレイ */}
        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-100/80 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none">
            <div className="text-center">
              <svg
                className="w-12 h-12 mx-auto text-blue-500 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-blue-600 font-medium">
                ここに画像をドロップ
              </p>
            </div>
          </div>
        )}

        {/* アップロード中オーバーレイ */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-gray-600 text-sm">画像をアップロード中...</p>
            </div>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mt-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}
    </div>
  )
}
