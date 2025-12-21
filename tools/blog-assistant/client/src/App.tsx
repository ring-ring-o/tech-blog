import { useState, useCallback } from 'react'
import { Editor } from './components/Editor'
import { FrontmatterForm } from './components/FrontmatterForm'
import { Preview } from './components/Preview'
import { AstroPreview } from './components/AstroPreview'
import { ReviewPanel } from './components/ReviewPanel'
import { GeneratePanel } from './components/GeneratePanel'
import { SaveModal } from './components/SaveModal'
import { useAIReview } from './hooks/useAIReview'
import { useAIGenerate } from './hooks/useAIGenerate'
import { useArticle } from './hooks/useArticle'
import type { ArticleFrontmatter } from '@shared/types'

const defaultFrontmatter: ArticleFrontmatter = {
  title: '',
  description: '',
  publishedAt: new Date().toISOString().split('T')[0],
  tags: [],
}

type Tab = 'preview' | 'review' | 'generate' | 'astro'

export default function App() {
  const [content, setContent] = useState('')
  const [frontmatter, setFrontmatter] = useState<ArticleFrontmatter>(defaultFrontmatter)
  const [activeTab, setActiveTab] = useState<Tab>('preview')
  const [generateTopic, setGenerateTopic] = useState('')
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  const { review, streamingText: reviewText, isLoading: isReviewing } = useAIReview()
  const { generate, streamingText: generateText, isLoading: isGenerating } = useAIGenerate()
  const { save, isSaving, savedUrl } = useArticle()

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
    async (slug: string) => {
      setIsSaveModalOpen(false)
      await save(content, frontmatter, slug)
    },
    [content, frontmatter, save]
  )

  const handleCancelSave = useCallback(() => {
    setIsSaveModalOpen(false)
  }, [])

  const slug = frontmatter.title
    ? `${frontmatter.publishedAt}-${frontmatter.title
        .toLowerCase()
        .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
        .substring(0, 50)}`
    : ''

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Blog Assistant</h1>
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </header>

      {/* Save Modal */}
      <SaveModal
        isOpen={isSaveModalOpen}
        title={frontmatter.title}
        publishedAt={frontmatter.publishedAt}
        onSave={handleConfirmSave}
        onCancel={handleCancelSave}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Editor */}
        <div className="w-1/2 flex flex-col border-r bg-white">
          {/* Frontmatter Form */}
          <div className="border-b p-4">
            <FrontmatterForm value={frontmatter} onChange={setFrontmatter} />
          </div>

          {/* Editor */}
          <div className="flex-1 p-4">
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

        {/* Right Panel: Preview/Review/Generate/Astro */}
        <div className="w-1/2 flex flex-col bg-white">
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
          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'preview' && (
              <Preview content={content} frontmatter={frontmatter} />
            )}
            {activeTab === 'review' && (
              <ReviewPanel text={reviewText} isLoading={isReviewing} />
            )}
            {activeTab === 'generate' && (
              <GeneratePanel
                text={generateText}
                isLoading={isGenerating}
                onApply={handleApplyGenerated}
              />
            )}
            {activeTab === 'astro' && <AstroPreview slug={slug} />}
          </div>
        </div>
      </div>
    </div>
  )
}
