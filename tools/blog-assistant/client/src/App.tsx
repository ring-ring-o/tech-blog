import { useState, useCallback, useRef, useEffect } from 'react'
import { Editor } from './components/Editor'
import { FrontmatterForm } from './components/FrontmatterForm'
import { Preview } from './components/Preview'
import { AstroPreview } from './components/AstroPreview'
import { SaveModal } from './components/SaveModal'
import { CreateArticleModal } from './components/CreateArticleModal'
import { ArticleList } from './components/ArticleList'
import { AssistEditor } from './components/AssistEditor'
import { AIResultsPanel, type AIResult, type AIResultsPanelHandle } from './components/AIResultsPanel'
import { useAIReview } from './hooks/useAIReview'
import { useAIGenerate } from './hooks/useAIGenerate'
import { useArticle } from './hooks/useArticle'
import { useAssists } from './hooks/useAssists'
import type { ArticleFrontmatter, BlogDirectory, Article, Assist, SaveAssistRequest, TagSuggestion } from '@shared/types'
import { PANEL_CONFIG } from '@shared/constants/ui'
import { API_ENDPOINTS } from '@shared/constants/api'
import { TAB_SHORTCUTS, PANEL_SHORTCUTS, NAV_SHORTCUTS, matchesShortcut, formatShortcut } from '@shared/constants/keyboard'

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
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const [isRightPaneCollapsed, setIsRightPaneCollapsed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const aiResultsPanelRef = useRef<AIResultsPanelHandle>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)

  // 記事編集状態
  const [showArticleList, setShowArticleList] = useState(false)
  const [showAssistsPanel, setShowAssistsPanel] = useState(false)
  const [selectedDirectory, setSelectedDirectory] = useState<BlogDirectory | 'all'>('all')
  const [saveDirectory, setSaveDirectory] = useState<BlogDirectory>('blog')
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  // 新規記事作成モーダル
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreatingArticle, setIsCreatingArticle] = useState(false)

  // UI状態
  const [isFrontmatterCollapsed, setIsFrontmatterCollapsed] = useState(false)

  // アシスト実行状態
  const [executingAssistInfo, setExecutingAssistInfo] = useState<{ assist: Assist; selection: string } | null>(null)
  const [assistStreamingText, setAssistStreamingText] = useState('')
  const [editorSelection, setEditorSelection] = useState('')

  // AI結果
  const [aiResults, setAiResults] = useState<AIResult[]>([])

  // 説明生成とタグ提案の状態
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [isSuggestingTags, setIsSuggestingTags] = useState(false)

  // 下書き生成用トピック入力
  const [showTopicInput, setShowTopicInput] = useState(false)
  const [generateTopic, setGenerateTopic] = useState('')

  const { review, streamingText: reviewText, isLoading: isReviewing } = useAIReview()
  const { generate, streamingText: generateText, isLoading: isGenerating } = useAIGenerate()
  const { assists, loadAssists, createAssist, updateAssist, deleteAssist, executeAssist, isExecuting: isExecutingAssist } = useAssists()

  // アシスト編集状態
  const [editingAssistData, setEditingAssistData] = useState<{ assist: Assist | null; isNew: boolean } | null>(null)
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

  // アシスト一覧を読み込み
  useEffect(() => {
    loadAssists()
  }, [loadAssists])

  // 記事一覧を読み込み
  useEffect(() => {
    if (showArticleList) {
      loadArticles()
    }
  }, [showArticleList, loadArticles])

  // グローバルキーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // テキスト入力中はショートカットを無効化
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // タブ切り替えショートカット
      if (matchesShortcut(e, TAB_SHORTCUTS.RESULTS)) {
        e.preventDefault()
        setActiveTab('results')
        if (isRightPaneCollapsed) {
          setIsRightPaneCollapsed(false)
          setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
        }
      } else if (matchesShortcut(e, TAB_SHORTCUTS.PREVIEW)) {
        e.preventDefault()
        setActiveTab('preview')
        if (isRightPaneCollapsed) {
          setIsRightPaneCollapsed(false)
          setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
        }
      } else if (matchesShortcut(e, TAB_SHORTCUTS.ASTRO)) {
        e.preventDefault()
        setActiveTab('astro')
        if (isRightPaneCollapsed) {
          setIsRightPaneCollapsed(false)
          setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
        }
      }
      // パネル操作ショートカット
      else if (matchesShortcut(e, PANEL_SHORTCUTS.TOGGLE_RIGHT_PANEL)) {
        e.preventDefault()
        if (isRightPaneCollapsed) {
          setIsRightPaneCollapsed(false)
          setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
        } else {
          setIsRightPaneCollapsed(true)
          setLeftPanelWidth(PANEL_CONFIG.FULL_WIDTH)
        }
      } else if (matchesShortcut(e, PANEL_SHORTCUTS.TOGGLE_ARTICLE_LIST)) {
        e.preventDefault()
        setShowArticleList((prev) => !prev)
      } else if (matchesShortcut(e, PANEL_SHORTCUTS.TOGGLE_ASSISTS_PANEL)) {
        e.preventDefault()
        setShowAssistsPanel((prev) => !prev)
      }
      // タブナビゲーション（Ctrl+Tab / Ctrl+Shift+Tab）
      else if (matchesShortcut(e, NAV_SHORTCUTS.NEXT_TAB)) {
        e.preventDefault()
        const tabs: RightTab[] = ['results', 'preview', 'astro']
        const currentIndex = tabs.indexOf(activeTab)
        const nextIndex = (currentIndex + 1) % tabs.length
        setActiveTab(tabs[nextIndex])
        if (isRightPaneCollapsed) {
          setIsRightPaneCollapsed(false)
          setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
        }
      } else if (matchesShortcut(e, NAV_SHORTCUTS.PREV_TAB)) {
        e.preventDefault()
        const tabs: RightTab[] = ['results', 'preview', 'astro']
        const currentIndex = tabs.indexOf(activeTab)
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
        setActiveTab(tabs[prevIndex])
        if (isRightPaneCollapsed) {
          setIsRightPaneCollapsed(false)
          setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isRightPaneCollapsed, activeTab])

  // リサイズ処理
  const handleMouseDown = useCallback(() => {
    setIsResizing(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100

      // 閾値以上で右ペインを折りたたむ
      if (newWidth >= PANEL_CONFIG.COLLAPSE_THRESHOLD) {
        setIsRightPaneCollapsed(true)
        setLeftPanelWidth(PANEL_CONFIG.FULL_WIDTH)
      } else if (newWidth >= PANEL_CONFIG.MIN_LEFT_WIDTH && newWidth <= PANEL_CONFIG.COLLAPSE_THRESHOLD) {
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
      setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
    } else {
      setIsRightPaneCollapsed(true)
      setLeftPanelWidth(PANEL_CONFIG.FULL_WIDTH)
    }
  }, [isRightPaneCollapsed])

  // AI校閲
  const handleReview = useCallback(async () => {
    if (!content) return
    setActiveTab('results')
    setIsRightPaneCollapsed(false)
    setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
    await review(content, frontmatter)
  }, [content, frontmatter, review])

  // 校閲完了時に結果を追加してフォーカスを移動
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
      // 結果追加後にフォーカスを移動
      setTimeout(() => aiResultsPanelRef.current?.focus(), 100)
    }
  }, [isReviewing, reviewText])

  // 下書き生成
  const handleGenerateDraft = useCallback(() => {
    setActiveTab('results')
    setShowTopicInput(true)
    setIsRightPaneCollapsed(false)
    setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
  }, [])

  const handleConfirmGenerate = useCallback(async () => {
    if (!generateTopic.trim()) return
    setShowTopicInput(false)
    setActiveTab('results')
    await generate(generateTopic)
    setGenerateTopic('')
  }, [generateTopic, generate])

  // 生成完了時に結果を追加してフォーカスを移動
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
      // 結果追加後にフォーカスを移動
      setTimeout(() => aiResultsPanelRef.current?.focus(), 100)
    }
  }, [isGenerating, generateText])

  // 説明生成
  const handleGenerateDescription = useCallback(async () => {
    if (!content || !frontmatter.title) return
    setActiveTab('results')
    setIsRightPaneCollapsed(false)
    setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
    setIsGeneratingDescription(true)

    try {
      const response = await fetch(API_ENDPOINTS.ARTICLES_GENERATE_DESCRIPTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: frontmatter.title, content }),
      })

      if (!response.ok) throw new Error('説明の生成に失敗しました')

      const data = await response.json()
      setAiResults((prev) => [
        {
          id: `description-${Date.now()}`,
          type: 'description',
          title: '説明文の生成',
          content: data.description,
          timestamp: new Date(),
          canApply: true,
        },
        ...prev,
      ])
    } catch (error) {
      console.error('Failed to generate description:', error)
      setAiResults((prev) => [
        {
          id: `description-error-${Date.now()}`,
          type: 'description',
          title: '説明文の生成エラー',
          content: error instanceof Error ? error.message : '説明の生成に失敗しました',
          timestamp: new Date(),
          canApply: false,
        },
        ...prev,
      ])
    } finally {
      setIsGeneratingDescription(false)
      // 結果追加後にフォーカスを移動
      setTimeout(() => aiResultsPanelRef.current?.focus(), 100)
    }
  }, [content, frontmatter.title])

  // タグ提案
  const handleSuggestTags = useCallback(async () => {
    if (!content || !frontmatter.title) return
    setActiveTab('results')
    setIsRightPaneCollapsed(false)
    setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
    setIsSuggestingTags(true)

    try {
      const response = await fetch(API_ENDPOINTS.ARTICLES_SUGGEST_TAGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: frontmatter.title, content }),
      })

      if (!response.ok) throw new Error('タグの提案に失敗しました')

      const data = await response.json()
      const suggestions: TagSuggestion[] = data.suggestions

      // 既に設定されているタグを除外
      const filteredSuggestions = suggestions.filter(
        (s) => !frontmatter.tags.includes(s.tag)
      )

      setAiResults((prev) => [
        {
          id: `tags-${Date.now()}`,
          type: 'tags',
          title: 'タグの提案',
          content: filteredSuggestions.map((s) => `- **${s.tag}**: ${s.reason}`).join('\n'),
          timestamp: new Date(),
          canApply: filteredSuggestions.length > 0,
          tagSuggestions: filteredSuggestions,
        },
        ...prev,
      ])
    } catch (error) {
      console.error('Failed to suggest tags:', error)
      setAiResults((prev) => [
        {
          id: `tags-error-${Date.now()}`,
          type: 'tags',
          title: 'タグ提案エラー',
          content: error instanceof Error ? error.message : 'タグの提案に失敗しました',
          timestamp: new Date(),
          canApply: false,
        },
        ...prev,
      ])
    } finally {
      setIsSuggestingTags(false)
      // 結果追加後にフォーカスを移動
      setTimeout(() => aiResultsPanelRef.current?.focus(), 100)
    }
  }, [content, frontmatter.title, frontmatter.tags])

  // AI結果を適用
  const handleApplyResult = useCallback((result: AIResult, selectedTags?: string[]) => {
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
    } else if (result.type === 'assist') {
      // アシスト結果を適用
      if (editorSelection) {
        setContent((prev) => prev.replace(editorSelection, result.content))
      } else {
        setContent((prev) => prev + '\n\n' + result.content)
      }
    } else if (result.type === 'description') {
      // 説明文を適用
      setFrontmatter((prev) => ({
        ...prev,
        description: result.content,
      }))
    } else if (result.type === 'tags' && selectedTags && selectedTags.length > 0) {
      // 選択されたタグを追加
      setFrontmatter((prev) => ({
        ...prev,
        tags: [...prev.tags, ...selectedTags.filter((t) => !prev.tags.includes(t))],
      }))
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

  // 新規記事を作成（モーダルを表示）
  const handleNewArticle = useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  // 新規記事作成を確定
  const handleConfirmCreate = useCallback(
    async (title: string, slug: string, directory: BlogDirectory) => {
      setIsCreatingArticle(true)
      try {
        const newFrontmatter: ArticleFrontmatter = {
          title,
          description: '',
          publishedAt: new Date().toISOString().split('T')[0],
          tags: [],
        }

        // 記事を作成（空のコンテンツで）
        await save({
          content: '',
          frontmatter: newFrontmatter,
          directory,
          slug,
        })

        // 保存結果からファイル名を取得して記事を読み込み
        // savedFilenameは非同期で更新されるため、手動で構築
        const dateStr = newFrontmatter.publishedAt
        const filename = `${dateStr}-${slug}/index.md`

        // 編集モードに移行
        setContent('')
        setFrontmatter(newFrontmatter)
        setEditingArticle({
          id: `${directory}/${filename}`,
          filename,
          directory,
          slug: `${dateStr}-${slug}`,
          content: '',
          frontmatter: newFrontmatter,
          isFolder: true,
        })
        setSaveDirectory(directory)
        setIsCreateModalOpen(false)

        if (showArticleList) {
          loadArticles()
        }
      } catch (err) {
        console.error('Failed to create article:', err)
      } finally {
        setIsCreatingArticle(false)
      }
    },
    [save, showArticleList, loadArticles]
  )

  // 新規記事作成をキャンセル
  const handleCancelCreate = useCallback(() => {
    setIsCreateModalOpen(false)
  }, [])

  // ディレクトリ変更
  const handleDirectoryChange = useCallback((directory: BlogDirectory | 'all') => {
    setSelectedDirectory(directory)
  }, [])

  // 保存先ディレクトリ変更
  const handleSaveDirectoryChange = useCallback((directory: BlogDirectory) => {
    setSaveDirectory(directory)
  }, [])

  // アシスト実行（エディタから）
  const handleExecuteAssist = useCallback(async (assist: Assist, selection: string) => {
    // 特殊なメタアシストは専用ハンドラを使用
    if (assist.id === 'generate-description') {
      handleGenerateDescription()
      return
    }
    if (assist.id === 'suggest-tags') {
      handleSuggestTags()
      return
    }

    // 下書き生成アシストはトピック入力が必要
    if (assist.id === 'generate-draft') {
      setShowTopicInput(true)
      setIsRightPaneCollapsed(false)
      setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
      return
    }

    // AI結果タブを表示
    setActiveTab('results')
    setIsRightPaneCollapsed(false)
    setLeftPanelWidth(PANEL_CONFIG.DEFAULT_LEFT_WIDTH)
    setEditorSelection(selection)
    setExecutingAssistInfo({ assist, selection })
    setAssistStreamingText('')

    const today = new Date().toISOString().split('T')[0]
    const variables: Record<string, string> = {
      content,
      title: frontmatter.title,
      description: frontmatter.description,
      tags: frontmatter.tags.join(', '),
      selection,
      topic: '',
      today,
    }

    try {
      let fullText = ''
      await executeAssist(assist.id, variables, (text) => {
        fullText += text
        setAssistStreamingText(fullText)
      })

      // 完了後、結果をAI結果リストに追加
      setAiResults((prev) => [
        {
          id: `assist-${Date.now()}`,
          type: 'assist',
          title: assist.name,
          content: fullText,
          timestamp: new Date(),
          canApply: true,
        },
        ...prev,
      ])
    } catch (err) {
      setAiResults((prev) => [
        {
          id: `assist-error-${Date.now()}`,
          type: 'assist',
          title: `${assist.name} エラー`,
          content: err instanceof Error ? err.message : 'アシストの実行に失敗しました',
          timestamp: new Date(),
          canApply: false,
        },
        ...prev,
      ])
    } finally {
      setExecutingAssistInfo(null)
      setAssistStreamingText('')
      // 結果追加後にフォーカスを移動
      setTimeout(() => aiResultsPanelRef.current?.focus(), 100)
    }
  }, [handleGenerateDescription, handleSuggestTags, content, frontmatter, executeAssist])


  // 現在ストリーミング中のコンテンツ
  const streamingContent = isReviewing
    ? reviewText
    : isGenerating
      ? generateText
      : isExecutingAssist
        ? assistStreamingText
        : undefined
  const loadingTitle = isReviewing
    ? '校閲中...'
    : isGenerating
      ? '下書き生成中...'
      : isExecutingAssist
        ? `${executingAssistInfo?.assist.name || 'アシスト'}を実行中...`
        : isGeneratingDescription
          ? '説明を生成中...'
          : isSuggestingTags
            ? 'タグを提案中...'
            : undefined
  const isAnyAILoading = isReviewing || isGenerating || isGeneratingDescription || isSuggestingTags || isExecutingAssist

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
          {/* アシストパネルトグル */}
          <button
            onClick={() => setShowAssistsPanel(!showAssistsPanel)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              showAssistsPanel
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            アシスト設定
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
          {editingArticle && (
            <button
              onClick={handleSaveClick}
              disabled={isSaving || !content || !frontmatter.title}
              className="px-3 py-1.5 text-sm text-white rounded disabled:opacity-50 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-700"
            >
              {isSaving ? '保存中...' : '更新'}
            </button>
          )}
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

      {/* Create Article Modal */}
      <CreateArticleModal
        isOpen={isCreateModalOpen}
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelCreate}
      />

      {/* Assist Editor Modal */}
      {editingAssistData && (
        <AssistEditor
          assist={editingAssistData.assist}
          isNew={editingAssistData.isNew}
          onSave={async (data: SaveAssistRequest) => {
            if (editingAssistData.isNew) {
              await createAssist(data)
            } else if (editingAssistData.assist) {
              await updateAssist(editingAssistData.assist.id, data)
            }
          }}
          onDelete={
            editingAssistData.assist && !editingAssistData.assist.isBuiltIn
              ? async () => {
                  if (editingAssistData.assist) {
                    await deleteAssist(editingAssistData.assist.id)
                  }
                }
              : undefined
          }
          onClose={() => setEditingAssistData(null)}
        />
      )}

      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left Side Panels (Article List / Assists) */}
        {(showArticleList || showAssistsPanel) && (
          <div className="w-64 flex-shrink-0 border-r bg-white flex flex-col">
            {showArticleList && (
              <div className={showAssistsPanel ? 'flex-1 border-b overflow-hidden' : 'flex-1 overflow-hidden'}>
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
            {showAssistsPanel && (
              <div className={showArticleList ? 'h-64 overflow-auto' : 'flex-1 overflow-auto'}>
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700">アシスト一覧</h3>
                    <button
                      onClick={() => setEditingAssistData({ assist: null, isNew: true })}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="新規アシスト作成"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-1">
                    {assists.map((assist) => (
                      <div
                        key={assist.id}
                        className="group flex items-center gap-1 px-2 py-1.5 text-sm rounded hover:bg-gray-100 transition-colors"
                      >
                        <button
                          onClick={() => handleExecuteAssist(assist, '')}
                          className="flex-1 text-left min-w-0"
                        >
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-700 truncate">{assist.name}</span>
                            {assist.isBuiltIn && (
                              <span className="px-1 py-0.5 text-[10px] bg-gray-200 text-gray-500 rounded">組込</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{assist.description}</div>
                        </button>
                        <button
                          onClick={() => setEditingAssistData({ assist, isNew: false })}
                          className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={assist.isBuiltIn ? '詳細を表示' : '編集'}
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
          {editingArticle ? (
            <>
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
                    <FrontmatterForm
                      value={frontmatter}
                      onChange={setFrontmatter}
                      onGenerateDescription={handleGenerateDescription}
                      onSuggestTags={handleSuggestTags}
                      isAILoading={isAnyAILoading}
                    />
                  </div>
                )}
              </div>

              {/* Editor */}
              <div ref={editorContainerRef} className="flex-1 p-4 overflow-auto">
                <Editor
                  value={content}
                  onChange={setContent}
                  assists={assists}
                  onExecuteAssist={handleExecuteAssist}
                  onReview={handleReview}
                  onGenerateDraft={handleGenerateDraft}
                  onGenerateDescription={handleGenerateDescription}
                  onSuggestTags={handleSuggestTags}
                  articleImageContext={{
                    slug: editingArticle.slug,
                    directory: editingArticle.directory,
                  }}
                />
              </div>
            </>
          ) : (
            /* Welcome Screen - No article selected */
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  記事を作成または選択してください
                </h2>
                <p className="text-gray-500 mb-6">
                  新しい記事を作成するか、既存の記事を選択して編集を開始します。
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleNewArticle}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    新規記事を作成
                  </button>
                  <button
                    onClick={() => setShowArticleList(true)}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    既存の記事を開く
                  </button>
                </div>
                <p className="mt-6 text-xs text-gray-400">
                  画像を含む記事を作成するには、まず記事を作成してフォルダを確定する必要があります。
                </p>
              </div>
            </div>
          )}
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
                title={`AI結果 (${formatShortcut(TAB_SHORTCUTS.RESULTS)})`}
              >
                AI結果
                <span className="text-[10px] text-gray-400 font-normal ml-1">
                  {formatShortcut(TAB_SHORTCUTS.RESULTS)}
                </span>
                {aiResults.length > 0 && (
                  <span className="px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                    {aiResults.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={`プレビュー (${formatShortcut(TAB_SHORTCUTS.PREVIEW)})`}
              >
                プレビュー
                <span className="text-[10px] text-gray-400 font-normal ml-1">
                  {formatShortcut(TAB_SHORTCUTS.PREVIEW)}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('astro')}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-1 ${
                  activeTab === 'astro'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title={`Astro (${formatShortcut(TAB_SHORTCUTS.ASTRO)})`}
              >
                Astro
                <span className="text-[10px] text-gray-400 font-normal ml-1">
                  {formatShortcut(TAB_SHORTCUTS.ASTRO)}
                </span>
              </button>
              <div className="flex-1" />
              <span className="text-[10px] text-gray-400 mr-2">
                {formatShortcut(NAV_SHORTCUTS.NEXT_TAB)} 次へ
              </span>
              <button
                onClick={toggleRightPane}
                className="px-3 py-2 text-gray-400 hover:text-gray-600"
                title={`パネルを折りたたむ (${formatShortcut(PANEL_SHORTCUTS.TOGGLE_RIGHT_PANEL)})`}
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
                  ref={aiResultsPanelRef}
                  results={aiResults}
                  isLoading={isAnyAILoading}
                  loadingTitle={loadingTitle}
                  streamingContent={streamingContent}
                  onApply={handleApplyResult}
                  onClear={handleClearResults}
                  onEscape={() => {
                    // エディタコンテナにフォーカスを戻す
                    editorContainerRef.current?.querySelector('textarea')?.focus()
                  }}
                  topicInput={{ isOpen: showTopicInput, topic: generateTopic }}
                  onTopicChange={setGenerateTopic}
                  onTopicSubmit={handleConfirmGenerate}
                  onTopicCancel={() => {
                    setShowTopicInput(false)
                    setGenerateTopic('')
                  }}
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
