import { useEffect, useRef } from 'react'
import type { Skill } from '@shared/types'

interface EditorSelectionPopupProps {
  isOpen: boolean
  position: { x: number; y: number }
  skills: Skill[]
  onClose: () => void
  onExecuteSkill: (skill: Skill) => void
}

export function EditorSelectionPopup({
  isOpen,
  position,
  skills,
  onClose,
  onExecuteSkill,
}: EditorSelectionPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  // 選択テキストに適用可能なスキルのみ表示
  const applicableSkills = skills.filter(
    (skill) =>
      skill.variables.includes('selection') ||
      skill.id === 'improve-section' ||
      skill.id === 'supplement'
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
      {applicableSkills.map((skill) => (
        <button
          key={skill.id}
          onClick={() => {
            onExecuteSkill(skill)
            onClose()
          }}
          className="px-3 py-1.5 text-sm hover:bg-gray-700 rounded transition-colors whitespace-nowrap"
          title={skill.description}
        >
          {skill.name}
        </button>
      ))}
      {applicableSkills.length === 0 && (
        <span className="px-3 py-1.5 text-sm text-gray-400">
          選択テキスト用のスキルがありません
        </span>
      )}
    </div>
  )
}
