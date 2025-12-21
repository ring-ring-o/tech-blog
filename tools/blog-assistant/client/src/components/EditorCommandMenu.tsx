import { useState, useEffect, useCallback, useRef } from 'react'
import type { Skill } from '@shared/types'

interface Command {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  category: 'ai' | 'insert' | 'format'
  action: () => void
}

interface EditorCommandMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  filter: string
  skills: Skill[]
  onClose: () => void
  onExecuteSkill: (skill: Skill) => void
  onInsertImage: () => void
  onReview: () => void
  onGenerateDraft: () => void
}

const categoryLabels = {
  ai: 'AI機能',
  insert: '挿入',
  format: '書式',
}

export function EditorCommandMenu({
  isOpen,
  position,
  filter,
  skills,
  onClose,
  onExecuteSkill,
  onInsertImage,
  onReview,
  onGenerateDraft,
}: EditorCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  // コマンド一覧を生成
  const commands: Command[] = [
    // AI機能
    {
      id: 'review',
      label: '校閲',
      description: '記事全体をAIで校閲',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      category: 'ai',
      action: onReview,
    },
    {
      id: 'generate',
      label: '下書き生成',
      description: 'トピックから下書きを生成',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      category: 'ai',
      action: onGenerateDraft,
    },
    // スキル
    ...skills.map((skill) => ({
      id: `skill-${skill.id}`,
      label: skill.name,
      description: skill.description,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      category: 'ai' as const,
      action: () => onExecuteSkill(skill),
    })),
    // 挿入
    {
      id: 'image',
      label: '画像',
      description: '画像をアップロード',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      category: 'insert',
      action: onInsertImage,
    },
  ]

  // フィルタリング
  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(filter.toLowerCase()) ||
      cmd.description.toLowerCase().includes(filter.toLowerCase())
  )

  // カテゴリでグループ化
  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = []
      }
      acc[cmd.category].push(cmd)
      return acc
    },
    {} as Record<string, Command[]>
  )

  // キーボードナビゲーション
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onClose])

  // 選択インデックスをリセット
  useEffect(() => {
    setSelectedIndex(0)
  }, [filter])

  // 外部クリックで閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen || filteredCommands.length === 0) return null

  let flatIndex = 0

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[280px] max-h-[300px] overflow-y-auto"
      style={{ left: position.x, top: position.y }}
    >
      {Object.entries(groupedCommands).map(([category, cmds]) => (
        <div key={category}>
          <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase">
            {categoryLabels[category as keyof typeof categoryLabels]}
          </div>
          {cmds.map((cmd) => {
            const currentIndex = flatIndex++
            return (
              <button
                key={cmd.id}
                onClick={() => {
                  cmd.action()
                  onClose()
                }}
                className={`w-full px-3 py-2 flex items-center gap-3 text-left transition-colors ${
                  currentIndex === selectedIndex
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className={currentIndex === selectedIndex ? 'text-blue-600' : 'text-gray-400'}>
                  {cmd.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{cmd.label}</div>
                  <div className="text-xs text-gray-400 truncate">{cmd.description}</div>
                </div>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
