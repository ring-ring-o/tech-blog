import { useEffect, useRef } from 'react'
import type { Assist } from '@shared/types'

interface EditorSelectionPopupProps {
  isOpen: boolean
  position: { x: number; y: number }
  assists: Assist[]
  onClose: () => void
  onExecuteAssist: (assist: Assist) => void
}

export function EditorSelectionPopup({
  isOpen,
  position,
  assists,
  onClose,
  onExecuteAssist,
}: EditorSelectionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // 選択テキストに適用可能なアシストのみ表示
  const applicableAssists = assists.filter(
    (assist) =>
      assist.variables.includes('selection') ||
      assist.id === 'improve-section' ||
      assist.id === 'supplement'
  )

  // 外部クリックで閉じる（遅延を入れてmouseupと競合しないようにする）
  useEffect(() => {
    if (!isOpen) return

    let cleanup: (() => void) | undefined

    const timeoutId = setTimeout(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
          onClose()
        }
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)

      cleanup = () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      cleanup?.()
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl py-1.5 px-2 flex items-center gap-1"
      style={{
        left: Math.max(10, Math.min(position.x, window.innerWidth - 200)),
        top: position.y,
        transform: 'translateX(-50%) translateY(-100%)',
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {applicableAssists.map((assist) => (
        <button
          key={assist.id}
          onClick={() => {
            onExecuteAssist(assist)
            onClose()
          }}
          className="px-3 py-1.5 text-sm hover:bg-gray-700 rounded transition-colors whitespace-nowrap"
          title={assist.description}
        >
          {assist.name}
        </button>
      ))}
      {applicableAssists.length === 0 && (
        <span className="px-3 py-1.5 text-sm text-gray-400">
          選択テキスト用のアシストがありません
        </span>
      )}
    </div>
  )
}
