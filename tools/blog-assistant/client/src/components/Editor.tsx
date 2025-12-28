import { useRef, useCallback, useState, useEffect, type DragEvent, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useImageUpload } from '../hooks/useImageUpload'
import { EditorCommandMenu } from './EditorCommandMenu'
import { EditorSelectionPopup } from './EditorSelectionPopup'
import type { Skill, BlogDirectory } from '@shared/types'
import { EDITOR_CONFIG } from '@shared/constants/ui'

/** 画像を記事フォルダに保存するためのコンテキスト */
interface ArticleImageContext {
  slug: string
  directory: BlogDirectory
}

interface EditorProps {
  value: string
  onChange: (value: string) => void
  skills?: Skill[]
  onExecuteSkill?: (skill: Skill, selection: string) => void
  onReview?: () => void
  onGenerateDraft?: () => void
  onGenerateDescription?: () => void
  onSuggestTags?: () => void
  /** 記事の画像コンテキスト（既存記事または新規作成済み記事） */
  articleImageContext?: ArticleImageContext | null
}

export function Editor({
  value,
  onChange,
  skills = [],
  onExecuteSkill,
  onReview,
  onGenerateDraft,
  onGenerateDescription,
  onSuggestTags,
  articleImageContext,
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadFile, isUploading, error, setArticleContext } = useImageUpload()
  const [isDragging, setIsDragging] = useState(false)

  // コンテキストが変わったらuseImageUploadを更新
  useEffect(() => {
    setArticleContext(articleImageContext || null)
  }, [articleImageContext, setArticleContext])

  // コマンドメニュー状態
  const [commandMenuOpen, setCommandMenuOpen] = useState(false)
  const [commandMenuPosition, setCommandMenuPosition] = useState({ x: 0, y: 0 })
  const [commandFilter, setCommandFilter] = useState('')
  const [slashPosition, setSlashPosition] = useState<number | null>(null)

  // 選択ポップアップ状態
  const [selectionPopupOpen, setSelectionPopupOpen] = useState(false)
  const [selectionPopupPosition, setSelectionPopupPosition] = useState({ x: 0, y: 0 })
  const [currentSelection, setCurrentSelection] = useState('')

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
      if (!file.type.startsWith('image/')) {
        return
      }

      // 記事が作成されていない場合はエラー
      if (!articleImageContext) {
        alert('画像をアップロードするには、まず「新規記事」から記事を作成してください。')
        return
      }

      const result = await uploadFile(file)
      if (result) {
        insertAtCursor(`\n${result.markdown}\n`)
      }
    },
    [uploadFile, insertAtCursor, articleImageContext]
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

  // ドラッグ&ドロップ
  const handleDragOver = useCallback((e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

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
      e.target.value = ''
    },
    [handleImageUpload]
  )

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // キー入力ハンドラ（スラッシュコマンド検出）
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current
      if (!textarea) return

      // コマンドメニューが開いている場合は閉じる処理
      if (commandMenuOpen) {
        if (e.key === 'Escape' || e.key === 'Backspace') {
          if (e.key === 'Backspace' && commandFilter.length > 0) {
            // フィルターを削除
            setCommandFilter((prev) => prev.slice(0, -1))
          } else if (e.key === 'Backspace' && commandFilter.length === 0) {
            // /も削除してメニューを閉じる
            setCommandMenuOpen(false)
            setSlashPosition(null)
          }
        }
        return
      }

      // /キーでコマンドメニューを開く
      if (e.key === '/' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const cursorPos = textarea.selectionStart
        // 行頭または空白の後のみ
        const prevChar = value[cursorPos - 1]
        if (cursorPos === 0 || prevChar === '\n' || prevChar === ' ') {
          // カーソル位置を取得
          const rect = textarea.getBoundingClientRect()
          const lines = value.substring(0, cursorPos).split('\n')
          const currentLine = lines.length - 1
          const y = rect.top + currentLine * EDITOR_CONFIG.LINE_HEIGHT_PX + EDITOR_CONFIG.MENU_OFFSET_Y

          setCommandMenuPosition({ x: rect.left + EDITOR_CONFIG.MENU_OFFSET_X, y: Math.min(y, window.innerHeight - 320) })
          setSlashPosition(cursorPos)
          setCommandFilter('')

          // 次のフレームでメニューを開く（入力後）
          requestAnimationFrame(() => {
            setCommandMenuOpen(true)
          })
        }
      }
    },
    [commandMenuOpen, commandFilter, value]
  )

  // 入力ハンドラ
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      onChange(newValue)

      // コマンドメニューが開いている場合、フィルターを更新
      if (commandMenuOpen && slashPosition !== null) {
        const textarea = textareaRef.current
        if (textarea) {
          const cursorPos = textarea.selectionStart
          const textAfterSlash = newValue.substring(slashPosition + 1, cursorPos)

          // スペースや改行が入力されたらメニューを閉じる
          if (textAfterSlash.includes(' ') || textAfterSlash.includes('\n')) {
            setCommandMenuOpen(false)
            setSlashPosition(null)
          } else {
            setCommandFilter(textAfterSlash)
          }
        }
      }
    },
    [onChange, commandMenuOpen, slashPosition]
  )

  // テキスト選択ハンドラ（mouseupで発火）
  const handleMouseUp = useCallback(() => {
    // 少し遅延させてクリックイベントと競合しないようにする
    setTimeout(() => {
      const textarea = textareaRef.current
      if (!textarea) return

      const selection = textarea.value.substring(
        textarea.selectionStart,
        textarea.selectionEnd
      )

      if (selection.length > EDITOR_CONFIG.SELECTION_MIN_CHARS) {
        setCurrentSelection(selection)

        // ブラウザの選択範囲から位置を取得
        const windowSelection = window.getSelection()
        if (windowSelection && windowSelection.rangeCount > 0) {
          const range = windowSelection.getRangeAt(0)
          const rects = range.getClientRects()
          if (rects.length > 0) {
            const lastRect = rects[rects.length - 1]
            setSelectionPopupPosition({
              x: lastRect.left + lastRect.width / 2,
              y: lastRect.top - 10,
            })
          } else {
            // フォールバック: textarea の位置を使用
            const rect = textarea.getBoundingClientRect()
            setSelectionPopupPosition({
              x: rect.left + rect.width / 2,
              y: rect.top + 50,
            })
          }
        }
        setSelectionPopupOpen(true)
      } else {
        setSelectionPopupOpen(false)
        setCurrentSelection('')
      }
    }, EDITOR_CONFIG.SELECTION_DETECTION_DELAY)
  }, [])

  // コマンドメニューを閉じる
  const handleCloseCommandMenu = useCallback(() => {
    setCommandMenuOpen(false)
    setSlashPosition(null)
    setCommandFilter('')

    // スラッシュとフィルターを削除
    if (slashPosition !== null) {
      const textarea = textareaRef.current
      if (textarea) {
        const before = value.substring(0, slashPosition)
        const after = value.substring(textarea.selectionStart)
        onChange(before + after)

        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = slashPosition
          textarea.focus()
        })
      }
    }
  }, [slashPosition, value, onChange])

  // スキル実行
  const handleExecuteSkill = useCallback(
    (skill: Skill) => {
      handleCloseCommandMenu()
      setSelectionPopupOpen(false)
      if (onExecuteSkill) {
        onExecuteSkill(skill, currentSelection)
      }
    },
    [onExecuteSkill, currentSelection, handleCloseCommandMenu]
  )

  // 校閲
  const handleReview = useCallback(() => {
    handleCloseCommandMenu()
    if (onReview) {
      onReview()
    }
  }, [onReview, handleCloseCommandMenu])

  // 下書き生成
  const handleGenerateDraft = useCallback(() => {
    handleCloseCommandMenu()
    if (onGenerateDraft) {
      onGenerateDraft()
    }
  }, [onGenerateDraft, handleCloseCommandMenu])

  // 説明生成
  const handleGenerateDescription = useCallback(() => {
    handleCloseCommandMenu()
    if (onGenerateDescription) {
      onGenerateDescription()
    }
  }, [onGenerateDescription, handleCloseCommandMenu])

  // タグ提案
  const handleSuggestTags = useCallback(() => {
    handleCloseCommandMenu()
    if (onSuggestTags) {
      onSuggestTags()
    }
  }, [onSuggestTags, handleCloseCommandMenu])

  // 画像挿入
  const handleInsertImage = useCallback(() => {
    handleCloseCommandMenu()
    handleUploadClick()
  }, [handleCloseCommandMenu, handleUploadClick])

  // 選択解除時にポップアップを閉じる
  useEffect(() => {
    const handleSelectionChange = () => {
      const windowSelection = window.getSelection()
      if (!windowSelection || windowSelection.isCollapsed) {
        // 選択が解除された場合
        setTimeout(() => {
          setSelectionPopupOpen(false)
          setCurrentSelection('')
        }, 100)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* ヒント */}
      <div className="flex items-center gap-3 mb-2 text-xs text-gray-400">
        <span>「/」でコマンド</span>
        <span>テキスト選択でAI機能</span>
        <span>画像は貼り付け/ドロップ</span>
      </div>

      {/* エディタ */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onMouseUp={handleMouseUp}
          onPaste={handlePaste}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          placeholder="Markdownで記事を書いてください...&#10;&#10;/を入力してコマンドメニューを開く&#10;テキストを選択してAI機能を使用"
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
              <p className="text-blue-600 font-medium">ここに画像をドロップ</p>
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

      {/* 非表示のファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* コマンドメニュー */}
      <EditorCommandMenu
        isOpen={commandMenuOpen}
        position={commandMenuPosition}
        filter={commandFilter}
        skills={skills}
        onClose={handleCloseCommandMenu}
        onExecuteSkill={handleExecuteSkill}
        onInsertImage={handleInsertImage}
        onReview={handleReview}
        onGenerateDraft={handleGenerateDraft}
        onGenerateDescription={handleGenerateDescription}
        onSuggestTags={handleSuggestTags}
      />

      {/* 選択ポップアップ */}
      <EditorSelectionPopup
        isOpen={selectionPopupOpen}
        position={selectionPopupPosition}
        skills={skills}
        onClose={() => setSelectionPopupOpen(false)}
        onExecuteSkill={handleExecuteSkill}
      />
    </div>
  )
}
