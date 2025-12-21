import { useState, useCallback, useRef, useEffect } from 'react'
import { Editor } from './components/Editor'
import { FrontmatterForm } from './components/FrontmatterForm'
import { Preview } from './components/Preview'
import { AstroPreview } from './components/AstroPreview'
import { SaveModal } from './components/SaveModal'
import { ArticleList } from './components/ArticleList'
import { SkillExecutor } from './components/SkillExecutor'
import { SkillEditor } from './components/SkillEditor'
import { AIResultsPanel, type AIResult } from './components/AIResultsPanel'
import { useAIReview } from './hooks/useAIReview'
import { useAIGenerate } from './hooks/useAIGenerate'
import { useArticle } from './hooks/useArticle'
import { useSkills } from './hooks/useSkills'
import type { ArticleFrontmatter, BlogDirectory, Article, Skill, SaveSkillRequest } from '@shared/types'

const defaultFrontmatter: ArticleFrontmatter = {
  title: '',
  description: '',
  publishedAt: new Date().toISOString().split('T')[0],
  tags: [],
}

type RightTab = 'preview' | 'results' | 'astro'

export default function App() {
  const [content, setContent] = useState('')
  const [frontmatter, setFrontmatter] = useState<ArticleFrontmatter>(defaultFrontmatter)
  const [activeTab, setActiveTab] = useState<RightTab>('results')
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(55)
  const [isResizing, setIsResizing] = useState(false)
  const [isRightPaneCollapsed, setIsRightPaneCollapsed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 記事編集状態
  const [showArticleList, setShowArticleList] = useState(false)
  const [showSkillsPanel, setShowSkillsPanel] = useState(false)
  const [selectedDirectory, setSelectedDirectory] = useState<BlogDirectory | 'all'>('all')
  const [saveDirectory, setSaveDirectory] = useState<BlogDirectory>('blog')
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // UI状態
  const [isFrontmatterCollapsed, setIsFrontmatterCollapsed] = useState(false)

  // スキル実行状態
  const [executingSkill, setExecutingSkill] = useState<Skill | null>(null)
  const [editorSelection, setEditorSelection] = useState('')

  // AI結果
  const [aiResults, setAiResults] = useState<AIResult[]>([])

  // 下書き生成用トピック入力
  const [showTopicInput, setShowTopicInput] = useState(false)
  const [generateTopic, setGenerateTopic] = useState('')

  const { review, streamingText: reviewText, isLoading: isReviewing } = useAIReview()
  const { generate, streamingText: generateText, isLoading: isGenerating } = useAIGenerate()
  const { skills, loadSkills, createSkill, updateSkill, deleteSkill } = useSkills()

  // スキル編集状態
  const [editingSkillData, setEditingSkillData] = useState<{ skill: Skill | null; isNew: boolean } | null>(null)
  const {
    save,
    isSaving,
    savedUrl,
    savedFilename,
    savedSlug,
    savedDirectory,
    isUpdate,
    articles,
    isLoadingArticles,
    loadArticles,
    clearSaved,
  } = useArticle()

  // スキル一覧を読み込み
  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  // 記事一覧を読み込み
  useEffect(() => {
    if (showArticleList) {
      loadArticles()
    }
  }, [showArticleList, loadArticles])

  // リサイズ処理
  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // 95%以上で右ペインを折りたたむ
      if (newWidth >= 95) {
        setIsRightPaneCollapsed(true)
        setLeftPanelWidth(100)
      } else if (newWidth >= 30 && newWidth <= 95) {
        setIsRightPaneCollapsed(false)
        setLeftPanelWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  // 右ペインの折りたたみトグル
  const toggleRightPane = useCallback(() => {
    if (isRightPaneCollapsed) {
      setIsRightPaneCollapsed(false)
      setLeftPanelWidth(55)
    } else {
      setIsRightPaneCollapsed(true)
      setLeftPanelWidth(100)
    }
  }, [isRightPaneCollapsed])

  // AI校閲
  const handleReview = useCallback(async () => {
    if (!content) return
    setActiveTab('results')
    setIsRightPaneCollapsed(false)
    setLeftPanelWidth(55)
    await review(content, frontmatter)
  }, [content, frontmatter, review])

  // 校閲完了時に結果を追加
  useEffect(() => {
    if (!isReviewing && reviewText) {
      setAiResults((prev) => [
        {
          id: `review-${Date.now()}`,
          type: 'review',
          title: '校閲結果',
          content: reviewText,
          timestamp: new Date(),
          canApply: false,
        },
        ...prev,
      ])
    }
  }, [isReviewing, reviewText])

  // 下書き生成
  const handleGenerateDraft = useCallback(() => {
    setShowTopicInput(true)
    setIsRightPaneCollapsed(false)
    setLeftPanelWidth(55)
  }, [])

  const handleConfirmGenerate = useCallback(async () => {
    if (!generateTopic.trim()) return
    setShowTopicInput(false)
    setActiveTab('results')
    await generate(generateTopic)
    setGenerateTopic('')
  }, [generateTopic, generate])

  // 生成完了時に結果を追加
  useEffect(() => {
    if (!isGenerating && generateText) {
      setAiResults((prev) => [
        {
          id: `generate-${Date.now()}`,
          type: 'generate',
          title: '下書き生成',
          content: generateText,
          timestamp: new Date(),
          canApply: true,
        },
        ...prev,
      ])
    }
  }, [isGenerating, generateText])

  // AI結果を適用
  const handleApplyResult = useCallback((result: AIResult) => {
    if (result.type === 'generate') {
      // Frontmatterと本文を解析して適用
      const text = result.content
      const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

      if (match) {
        try {
          const yamlContent = match[1]
          const bodyContent = match[2].trim()

          const titleMatch = yamlContent.match(/title:\s*["'](.+?)["']/)
          const descMatch = yamlContent.match(/description:\s*["'](.+?)["']/)
          const dateMatch = yamlContent.match(/publishedAt:\s*(\S+)/)
          const tagsMatch = yamlContent.match(/tags:\s*\[(.+?)\]/)

          const newFrontmatter: ArticleFrontmatter = {
            title: titleMatch?.[1] || '',
            description: descMatch?.[1] || '',
            publishedAt: dateMatch?.[1] || new Date().toISOString().split('T')[0],
            tags: tagsMatch
              ? tagsMatch[1].split(',').map((t) => t.trim().replace(/["']/g, ''))
              : [],
          }

          setFrontmatter(newFrontmatter)
          setContent(bodyContent)
        } catch {
          setContent(text)
        }
      } else {
        setContent(text)
      }
    } else if (result.type === 'skill') {
      // スキル結果を適用
      if (editorSelection) {
        setContent((prev) => prev.replace(editorSelection, result.content))
      } else {
        setContent((prev) => prev + '\n\n' + result.content)
      }
    }
    setActiveTab('preview')
  }, [editorSelection])

  // AI結果をクリア
  const handleClearResults = useCallback(() => {
    setAiResults([])
  }, [])

  const handleSaveClick = useCallback(() => {
    if (!content || !frontmatter.title) return
    setIsSaveModalOpen(true)
  }, [content, frontmatter.title])

  const handleConfirmSave = useCallback(
    async (slug: string, directory: BlogDirectory) => {
      setIsSaveModalOpen(false)
      await save({
        content,
        frontmatter,
        directory,
        slug: slug || undefined,
        existingFilename: editingArticle?.filename,
      })
      if (showArticleList) {
        loadArticles()
      }
    },
    [content, frontmatter, save, editingArticle, showArticleList, loadArticles]
  )

  const handleCancelSave = useCallback(() => {
    setIsSaveModalOpen(false)
  }, [])

  // 既存記事を選択
  const handleSelectArticle = useCallback((article: Article) => {
    setContent(article.content)
    setFrontmatter(article.frontmatter)
    setEditingArticle(article)
    setSaveDirectory(article.directory)
    clearSaved()
  }, [clearSaved])

  // 新規記事を作成
  const handleNewArticle = useCallback(() => {
    setContent('')
    setFrontmatter(defaultFrontmatter)
    setEditingArticle(null)
    setSaveDirectory('blog')
    clearSaved()
  }, [clearSaved])

  // ディレクトリ変更
  const handleDirectoryChange = useCallback((directory: BlogDirectory | 'all') => {
    setSelectedDirectory(directory)
  }, [])

  // 保存先ディレクトリ変更
  const handleSaveDirectoryChange = useCallback((directory: BlogDirectory) => {
    setSaveDirectory(directory)
  }, [])

  // スキル実行（エディタから）
  const handleExecuteSkill = useCallback((skill: Skill, selection: string) => {
    setEditorSelection(selection)
    setExecutingSkill(skill)
  }, [])

  // スキル結果を適用
  const handleApplySkillResult = useCallback((result: string) => {
    // 結果をAI結果リストに追加
    setAiResults((prev) => [
      {
        id: `skill-${Date.now()}`,
        type: 'skill',
        title: executingSkill?.name || 'スキル',
        content: result,
        timestamp: new Date(),
        canApply: true,
      },
      ...prev,
    ])
    setActiveTab('results')
  }, [executingSkill])

  // 現在ストリーミング中のコンテンツ
  const streamingContent = isReviewing ? reviewText : isGenerating ? generateText : undefined
  const loadingTitle = isReviewing ? '校閲中...' : isGenerating ? '下書き生成中...' : undefined

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">Blog Assistant</h1>
          {/* 記事一覧トグル */}
          <button
            onClick={() => setShowArticleList(!showArticleList)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              showArticleList
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            記事一覧
          </button>
          {/* スキルパネルトグル */}
          <button
            onClick={() => setShowSkillsPanel(!showSkillsPanel)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              showSkillsPanel
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            スキル設定
          </button>
          {/* 編集中の記事情報 */}
          {editingArticle && (
            <div className="flex items-center gap-2 px-2 py-1 bg-amber-50 border border-amber-200 rounded text-xs">
              <span className={`px-1 py-0.5 rounded ${
                editingArticle.directory === 'blog'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {editingArticle.directory}
              </span>
              <span className="text-amber-600">編集中:</span>
              <code className="text-amber-800">{editingArticle.filename}</code>
            </div>
          )}
          {savedFilename && !editingArticle && (
            <div className="flex items-center gap-2 px-2 py-1 bg-green-50 border border-green-200 rounded text-xs">
              <span className={`px-1 py-0.5 rounded ${
                savedDirectory === 'blog'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {savedDirectory}
              </span>
              <span className="text-green-600">{isUpdate ? '更新済み:' : '保存済み:'}</span>
              <code className="text-green-800">{savedFilename}</code>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {savedUrl && (
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-xs"
            >
              プレビュー
            </a>
          )}
          <button
            onClick={handleSaveClick}
            disabled={isSaving || !content || !frontmatter.title}
            className={`px-3 py-1.5 text-sm text-white rounded disabled:opacity-50 disabled:cursor-not-allowed ${
              editingArticle
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSaving ? '保存中...' : editingArticle ? '更新' : '保存'}
          </button>
        </div>
      </header>

      {/* Save Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        title={frontmatter.title}
        publishedAt={frontmatter.publishedAt}
        directory={saveDirectory}
        existingFilename={editingArticle?.filename}
        onSave={handleConfirmSave}
        onCancel={handleCancelSave}
        onDirectoryChange={handleSaveDirectoryChange}
      />

      {/* Topic Input Modal */}
      {showTopicInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-4">下書きのトピックを入力</h3>
            <input
              type="text"
              value={generateTopic}
              onChange={(e) => setGenerateTopic(e.target.value)}
              placeholder="例: React Hooksの使い方"
              className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmGenerate()
                if (e.key === 'Escape') setShowTopicInput(false)
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTopicInput(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmGenerate}
                disabled={!generateTopic.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                生成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skill Executor Modal */}
      {executingSkill && (
        <SkillExecutor
          skill={executingSkill}
          content={content}
          title={frontmatter.title}
          description={frontmatter.description}
          tags={frontmatter.tags}
          selection={editorSelection}
          onClose={() => setExecutingSkill(null)}
          onApplyResult={handleApplySkillResult}
        />
      )}

      {/* Skill Editor Modal */}
      {editingSkillData && (
        <SkillEditor
          skill={editingSkillData.skill}
          isNew={editingSkillData.isNew}
          onSave={async (data: SaveSkillRequest) => {
            if (editingSkillData.isNew) {
              await createSkill(data)
            } else if (editingSkillData.skill) {
              await updateSkill(editingSkillData.skill.id, data)
            }
          }}
          onDelete={
            editingSkillData.skill && !editingSkillData.skill.isBuiltIn
              ? async () => {
                  if (editingSkillData.skill) {
                    await deleteSkill(editingSkillData.skill.id)
                  }
                }
              : undefined
          }
          onClose={() => setEditingSkillData(null)}
        />
      )}

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left Side Panels (Article List / Skills) */}
        {(showArticleList || showSkillsPanel) && (
          <div className="w-64 flex-shrink-0 border-r bg-white flex flex-col">
            {showArticleList && (
              <div className={showSkillsPanel ? 'flex-1 border-b overflow-hidden' : 'flex-1 overflow-hidden'}>
                <ArticleList
                  articles={articles}
                  isLoading={isLoadingArticles}
                  selectedDirectory={selectedDirectory}
                  onDirectoryChange={handleDirectoryChange}
                  onSelectArticle={handleSelectArticle}
                  onNewArticle={handleNewArticle}
                  currentArticleId={editingArticle?.id}
                />
              </div>
            )}
            {showSkillsPanel && (
              <div className={showArticleList ? 'h-64 overflow-auto' : 'flex-1 overflow-auto'}>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">スキル一覧</h3>
                    <button
                      onClick={() => setEditingSkillData({ skill: null, isNew: true })}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="新規スキル作成"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-1">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="group flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
                      >
                        <button
                          onClick={() => handleExecuteSkill(skill, '')}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-700 truncate">{skill.name}</span>
                            {skill.isBuiltIn && (
                              <span className="px-1 py-0.5 text-[10px] bg-gray-200 text-gray-500 rounded">組込</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{skill.description}</div>
                        </button>
                        <button
                          onClick={() => setEditingSkillData({ skill, isNew: false })}
                          className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={skill.isBuiltIn ? '詳細を表示' : '編集'}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Editor Panel */}
        <div
          className="flex flex-col bg-white flex-shrink-0"
          style={{ width: isRightPaneCollapsed ? '100%' : `${leftPanelWidth}%` }}
        >
          {/* Frontmatter Form (Collapsible) */}
          <div className="border-b">
            <button
              onClick={() => setIsFrontmatterCollapsed(!isFrontmatterCollapsed)}
              className="w-full px-4 py-2 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isFrontmatterCollapsed ? '' : 'rotate-90'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-medium text-gray-700">メタ情報</span>
                {isFrontmatterCollapsed && frontmatter.title && (
                  <span className="text-sm text-gray-500 truncate max-w-[200px]">- {frontmatter.title}</span>
                )}
              </div>
            </button>
            {!isFrontmatterCollapsed && (
              <div className="p-4">
                <FrontmatterForm value={frontmatter} onChange={setFrontmatter} />
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 p-4 overflow-auto">
            <Editor
              value={content}
              onChange={setContent}
              skills={skills}
              onExecuteSkill={handleExecuteSkill}
              onReview={handleReview}
              onGenerateDraft={handleGenerateDraft}
            />
          </div>
        </div>

        {/* Resizer */}
        {!isRightPaneCollapsed && (
          <div
            className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
            onMouseDown={handleMouseDown}
            style={{ backgroundColor: isResizing ? '#3b82f6' : undefined }}
          />
        )}

        {/* Right Panel Toggle Button (when collapsed) */}
        {isRightPaneCollapsed && (
          <button
            onClick={toggleRightPane}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-l-0 rounded-l-lg px-1 py-4 shadow hover:bg-gray-50 z-10"
            title="パネルを展開"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Right Panel: Preview/Results/Astro */}
        {!isRightPaneCollapsed && (
          <div className="flex flex-col bg-white flex-1" style={{ minWidth: 0 }}>
            {/* Tabs + Collapse Button */}
            <div className="border-b flex items-center">
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-1 ${
                  activeTab === 'results'
                    ? 'border-b-2 border-purple-600 text-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                AI結果
                {aiResults.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    {aiResults.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'preview'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                プレビュー
              </button>
              <button
                onClick={() => setActiveTab('astro')}
                className={`px-4 py-3 text-sm font-medium ${
                  activeTab === 'astro'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Astro
              </button>
              <div className="flex-1" />
              <button
                onClick={toggleRightPane}
                className="px-3 py-2 text-gray-400 hover:text-gray-600"
                title="パネルを折りたたむ"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Tab Content */}
            <div className={`flex-1 ${activeTab === 'astro' ? 'flex flex-col min-h-0' : 'overflow-auto'}`}>
              {activeTab === 'preview' && (
                <div className="p-4">
                  <Preview content={content} frontmatter={frontmatter} />
                </div>
              )}
              {activeTab === 'results' && (
                <AIResultsPanel
                  results={aiResults}
                  isLoading={isReviewing || isGenerating}
                  loadingTitle={loadingTitle}
                  streamingContent={streamingContent}
                  onApply={handleApplyResult}
                  onClear={handleClearResults}
                />
              )}
              {activeTab === 'astro' && (
                <div className="p-4 flex-1 flex flex-col min-h-0">
                  <AstroPreview slug={savedSlug || ''} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
