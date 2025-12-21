import { useState, useEffect } from 'react'
import type { Article, BlogDirectory } from '@shared/types'

interface ArticleListProps {
  articles: Article[]
  isLoading: boolean
  selectedDirectory: BlogDirectory | 'all'
  onDirectoryChange: (directory: BlogDirectory | 'all') => void
  onSelectArticle: (article: Article) => void
  onNewArticle: () => void
  currentArticleId?: string
}

export function ArticleList({
  articles,
  isLoading,
  selectedDirectory,
  onDirectoryChange,
  onSelectArticle,
  onNewArticle,
  currentArticleId,
}: ArticleListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // フィルタリング
  const filteredArticles = articles.filter((article) => {
    const matchesDirectory =
      selectedDirectory === 'all' || article.directory === selectedDirectory
    const matchesSearch =
      !searchQuery ||
      article.frontmatter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.frontmatter.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    return matchesDirectory && matchesSearch
  })

  // ディレクトリごとの記事数
  const countByDirectory = {
    all: articles.length,
    blog: articles.filter((a) => a.directory === 'blog').length,
    'blog-demo': articles.filter((a) => a.directory === 'blog-demo').length,
  }

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800">記事一覧</h2>
          <button
            onClick={onNewArticle}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            新規作成
          </button>
        </div>

        {/* 検索 */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="検索..."
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        {/* ディレクトリ選択 */}
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => onDirectoryChange('all')}
            className={`px-2 py-1 rounded ${
              selectedDirectory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            すべて ({countByDirectory.all})
          </button>
          <button
            onClick={() => onDirectoryChange('blog')}
            className={`px-2 py-1 rounded ${
              selectedDirectory === 'blog'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            blog ({countByDirectory.blog})
          </button>
          <button
            onClick={() => onDirectoryChange('blog-demo')}
            className={`px-2 py-1 rounded ${
              selectedDirectory === 'blog-demo'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            demo ({countByDirectory['blog-demo']})
          </button>
        </div>
      </div>

      {/* 記事リスト */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">読み込み中...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? '検索結果がありません' : '記事がありません'}
          </div>
        ) : (
          <ul className="divide-y">
            {filteredArticles.map((article) => (
              <li key={article.id}>
                <button
                  onClick={() => onSelectArticle(article)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    currentArticleId === article.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1 px-1.5 py-0.5 text-[10px] rounded ${
                        article.directory === 'blog'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {article.directory === 'blog' ? 'B' : 'D'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate text-sm">
                        {article.frontmatter.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {article.frontmatter.publishedAt}
                      </p>
                      {article.frontmatter.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {article.frontmatter.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {article.frontmatter.tags.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                              +{article.frontmatter.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
