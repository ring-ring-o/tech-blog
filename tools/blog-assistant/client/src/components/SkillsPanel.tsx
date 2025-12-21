import { useState, useEffect } from 'react'
import type { Skill, SkillCategory, SaveSkillRequest } from '@shared/types'
import { useSkills } from '../hooks/useSkills'

interface SkillsPanelProps {
  onExecuteSkill: (skill: Skill) => void
}

const CATEGORY_LABELS: Record<SkillCategory, string> = {
  review: '校閲',
  generate: '生成',
  assist: 'アシスト',
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  review: 'bg-blue-100 text-blue-700',
  generate: 'bg-purple-100 text-purple-700',
  assist: 'bg-green-100 text-green-700',
}

export function SkillsPanel({ onExecuteSkill }: SkillsPanelProps) {
  const {
    skills,
    isLoading,
    loadSkills,
    createSkill,
    updateSkill,
    deleteSkill,
  } = useSkills()

  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all')
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const filteredSkills =
    selectedCategory === 'all'
      ? skills
      : skills.filter((s) => s.category === selectedCategory)

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill)
    setIsCreating(false)
    setShowEditor(true)
  }

  const handleCreate = () => {
    setEditingSkill(null)
    setIsCreating(true)
    setShowEditor(true)
  }

  const handleSave = async (data: SaveSkillRequest) => {
    if (isCreating) {
      await createSkill(data)
    } else if (editingSkill) {
      await updateSkill(editingSkill.id, data)
    }
    setShowEditor(false)
    setEditingSkill(null)
    setIsCreating(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('このスキルを削除しますか？')) {
      await deleteSkill(id)
    }
  }

  const handleCancel = () => {
    setShowEditor(false)
    setEditingSkill(null)
    setIsCreating(false)
  }

  if (showEditor) {
    return (
      <SkillEditor
        skill={editingSkill}
        isCreating={isCreating}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">スキル管理</h2>
          <button
            onClick={handleCreate}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            新規作成
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 rounded ${
              selectedCategory === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {(Object.keys(CATEGORY_LABELS) as SkillCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded ${
                selectedCategory === cat
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Skills List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">読み込み中...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="p-4 text-center text-gray-500">スキルがありません</div>
        ) : (
          <ul className="divide-y">
            {filteredSkills.map((skill) => (
              <li key={skill.id} className="p-3 hover:bg-gray-50">
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 px-1.5 py-0.5 text-[10px] rounded ${
                      CATEGORY_COLORS[skill.category]
                    }`}
                  >
                    {CATEGORY_LABELS[skill.category]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800 text-sm">
                        {skill.name}
                      </p>
                      {skill.isBuiltIn && (
                        <span className="px-1 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded">
                          組み込み
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {skill.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => onExecuteSkill(skill)}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        実行
                      </button>
                      <button
                        onClick={() => handleEdit(skill)}
                        className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
                      >
                        編集
                      </button>
                      {!skill.isBuiltIn && (
                        <button
                          onClick={() => handleDelete(skill.id)}
                          className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// スキルエディタコンポーネント
interface SkillEditorProps {
  skill: Skill | null
  isCreating: boolean
  onSave: (data: SaveSkillRequest) => void
  onCancel: () => void
}

function SkillEditor({ skill, isCreating, onSave, onCancel }: SkillEditorProps) {
  const [name, setName] = useState(skill?.name || '')
  const [description, setDescription] = useState(skill?.description || '')
  const [category, setCategory] = useState<SkillCategory>(skill?.category || 'assist')
  const [systemPrompt, setSystemPrompt] = useState(skill?.systemPrompt || '')
  const [userPromptTemplate, setUserPromptTemplate] = useState(
    skill?.userPromptTemplate || ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      name,
      description,
      category,
      systemPrompt,
      userPromptTemplate,
    })
  }

  const isBuiltIn = skill?.isBuiltIn ?? false

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-bold text-gray-800">
          {isCreating ? 'スキルを作成' : 'スキルを編集'}
        </h2>
        {isBuiltIn && (
          <p className="text-xs text-amber-600 mt-1">
            組み込みスキルはプロンプトのみ編集可能です
          </p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            名前
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isBuiltIn}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            required
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
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SkillCategory)}
            disabled={isBuiltIn}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            {(Object.keys(CATEGORY_LABELS) as SkillCategory[]).map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
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
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            required
          />
        </div>

        {/* User Prompt Template */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ユーザープロンプトテンプレート
          </label>
          <p className="text-xs text-gray-500 mb-1">
            変数: {'{{content}}'}, {'{{title}}'}, {'{{description}}'}, {'{{tags}}'}, {'{{selection}}'}, {'{{topic}}'}, {'{{today}}'}
          </p>
          <textarea
            value={userPromptTemplate}
            onChange={(e) => setUserPromptTemplate(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            キャンセル
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  )
}
