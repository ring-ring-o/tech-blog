import { useState, useCallback, useRef, useEffect } from 'react'
import { Editor } from './components/Editor'
import { FrontmatterForm } from './components/FrontmatterForm'
import { Preview } from './components/Preview'
import { AstroPreview } from './components/AstroPreview'
import { ReviewPanel } from './components/ReviewPanel'
import { GeneratePanel } from './components/GeneratePanel'
import { SaveModal } from './components/SaveModal'
import { ArticleList } from './components/ArticleList'
import { SkillsPanel } from './components/SkillsPanel'
import { SkillExecutor } from './components/SkillExecutor'
import { useAIReview } from './hooks/useAIReview'
import { useAIGenerate } from './hooks/useAIGenerate'
import { useArticle } from './hooks/useArticle'
import type { ArticleFrontmatter, BlogDirectory, Article, Skill } from '@shared/types'

const defaultFrontmatter: ArticleFrontmatter = {
  title: '',
  description: '',
  publishedAt: new Date().toISOString().split('T')[0],
  tags: [],
}

type Tab = 'preview' | 'review' | 'generate' | 'skills' | 'astro'

export default function App() {
  const [content, setContent] = useState('')
  const [frontmatter, setFrontmatter] = useState<ArticleFrontmatter>(defaultFrontmatter)
  const [activeTab, setActiveTab] = useState<Tab>('preview')
  const [generateTopic, setGenerateTopic] = useState('')
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [leftPanelWidth, setLeftPanelWidth] = useState(50) // パーセント
  const [isResizing, setIsResizing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 記事編集状態
  const [showArticleList, setShowArticleList] = useState(false)
  const [selectedDirectory, setSelectedDirectory] = useState<BlogDirectory | 'all'>('all')
  const [saveDirectory, setSaveDirectory] = useState<BlogDirectory>('blog')
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  // UI状態
  const [isFrontmatterCollapsed, setIsFrontmatterCollapsed] = useState(false)

  // スキル実行状態
  const [executingSkill, setExecutingSkill] = useState<Skill | null>(null)
  const [editorSelection, setEditorSelection] = useState('')

  const { review, streamingText: reviewText, isLoading: isReviewing } = useAIReview()
  const { generate, streamingText: generateText, isLoading: isGenerating } = useAIGenerate()
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

      // 最小20%、最大80%に制限
      if (newWidth >= 20 && newWidth <= 80) {
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

  const handleReview = useCallback(async () => {
    setActiveTab('review')
    await review(content, frontmatter)
  }, [content, frontmatter, review])

  const handleGenerate = useCallback(async () => {
    if (!generateTopic.trim()) return
    setActiveTab('generate')
    await generate(generateTopic)
  }, [generateTopic, generate])

  const handleApplyGenerated = useCallback(() => {
    // Frontmatterと本文を解析して適用
    const text = generateText
    const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

    if (match) {
      try {
        const yamlContent = match[1]
        const bodyContent = match[2].trim()

        // 簡易的なYAMLパース
        const titleMatch = yamlContent.match(/title:\s*["'](.+?)["']/)
        const descMatch = yamlContent.match(/description:\s*["'](.+?)["']/)
        const dateMatch = yamlContent.match(/publishedAt:\s*(\S+)/)
        const tagsMatch = yamlContent.match(/tags:\s*\[(.+?)\]/)

        const newFrontmatter: ArticleFrontmatter = {
          title: titleMatch?.[1] || '',
          description: descMatch?.[1] || '',
          publishedAt: dateMatch?.[1] || new Date().toISOString().split('T')[0],
          tags: tagsMatch
            ? tagsMatch[1]
                .split(',')
                .map((t) => t.trim().replace(/["']/g, ''))
            : [],
        }

        setFrontmatter(newFrontmatter)
        setContent(bodyContent)
        setActiveTab('preview')
      } catch {
        // パース失敗時は全文をコンテンツとして設定
        setContent(text)
      }
    } else {
      setContent(text)
    }
  }, [generateText])

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
      // 記事一覧を更新
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

  // スキル実行
  const handleExecuteSkill = useCallback((skill: Skill) => {
    // テキストエリアから選択テキストを取得
    const selection = window.getSelection()?.toString() || ''
    setEditorSelection(selection)
    setExecutingSkill(skill)
  }, [])

  // スキル結果を適用
  const handleApplySkillResult = useCallback((result: string) => {
    // 結果をコンテンツに追加または置換
    if (editorSelection) {
      // 選択テキストがあれば置換
      setContent((prev) => prev.replace(editorSelection, result))
    } else {
      // なければ末尾に追加
      setContent((prev) => prev + '\n\n' + result)
    }
    setActiveTab('preview')
  }, [editorSelection])

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800">Blog Assistant</h1>
          {/* 記事一覧トグル */}
          <button
            onClick={() => setShowArticleList(!showArticleList)}
            className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
              showArticleList
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {showArticleList ? '記事一覧を隠す' : '記事一覧'}
          </button>
          {/* 編集中の記事情報 */}
          {editingArticle && (
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded ${
                  editingArticle.directory === 'blog'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {editingArticle.directory}
              </span>
              <span className="text-xs text-amber-600">編集中:</span>
              <code className="text-sm text-amber-800">{editingArticle.filename}</code>
            </div>
          )}
          {savedFilename && !editingArticle && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded ${
                  savedDirectory === 'blog'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {savedDirectory}
              </span>
              <span className="text-xs text-green-600">
                {isUpdate ? '更新済み:' : '保存済み:'}
              </span>
              <code className="text-sm text-green-800">{savedFilename}</code>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {savedUrl && (
            <a
              href={savedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              プレビューを開く
            </a>
          )}
          <button
            onClick={handleSaveClick}
            disabled={isSaving || !content || !frontmatter.title}
            className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
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

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Article List Panel */}
        {showArticleList && (
          <div className="w-64 flex-shrink-0 border-r bg-white">
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

        {/* Left Panel: Editor */}
        <div
          className="flex flex-col border-r bg-white flex-shrink-0"
          style={{ width: `${leftPanelWidth}%` }}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  メタ情報
                </span>
                {isFrontmatterCollapsed && frontmatter.title && (
                  <span className="text-sm text-gray-500 truncate max-w-[200px]">
                    - {frontmatter.title}
                  </span>
                )}
              </div>
              {!isFrontmatterCollapsed && (
                <span className="text-xs text-gray-400">クリックで折りたたむ</span>
              )}
            </button>
            {!isFrontmatterCollapsed && (
              <div className="p-4">
                <FrontmatterForm value={frontmatter} onChange={setFrontmatter} />
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 p-4 overflow-auto">
            <Editor value={content} onChange={setContent} />
          </div>

          {/* Action Buttons */}
          <div className="border-t p-4 flex gap-3">
            <button
              onClick={handleReview}
              disabled={isReviewing || !content}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isReviewing ? '校閲中...' : 'AI校閲'}
            </button>

            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                placeholder="トピックを入力..."
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !generateTopic.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? '生成中...' : '下書き生成'}
              </button>
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div
          className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
          onMouseDown={handleMouseDown}
          style={{ backgroundColor: isResizing ? '#3b82f6' : undefined }}
        />

        {/* Right Panel: Preview/Review/Generate/Astro */}
        <div
          className="flex flex-col bg-white flex-1"
          style={{ minWidth: 0 }}
        >
          {/* Tabs */}
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-3 font-medium ${
                activeTab === 'preview'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              プレビュー
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`px-4 py-3 font-medium ${
                activeTab === 'review'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              校閲結果
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 py-3 font-medium ${
                activeTab === 'generate'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              生成結果
            </button>
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-3 font-medium ${
                activeTab === 'skills'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              スキル
            </button>
            <button
              onClick={() => setActiveTab('astro')}
              className={`px-4 py-3 font-medium ${
                activeTab === 'astro'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Astro
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto">
            {activeTab === 'preview' && (
              <div className="p-4">
                <Preview content={content} frontmatter={frontmatter} />
              </div>
            )}
            {activeTab === 'review' && (
              <div className="p-4">
                <ReviewPanel text={reviewText} isLoading={isReviewing} />
              </div>
            )}
            {activeTab === 'generate' && (
              <div className="p-4">
                <GeneratePanel
                  text={generateText}
                  isLoading={isGenerating}
                  onApply={handleApplyGenerated}
                />
              </div>
            )}
            {activeTab === 'skills' && (
              <SkillsPanel onExecuteSkill={handleExecuteSkill} />
            )}
            {activeTab === 'astro' && (
              <div className="p-4">
                <AstroPreview slug={savedSlug || ''} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
