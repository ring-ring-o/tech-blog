import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ArticleFrontmatter } from '@shared/types'

interface PreviewProps {
  content: string
  frontmatter: ArticleFrontmatter
}

export function Preview({ content, frontmatter }: PreviewProps) {
  if (!content && !frontmatter.title) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>左のエディタで記事を書くと、ここにプレビューが表示されます</p>
      </div>
    )
  }

  return (
    <div className="max-w-none">
      {/* Frontmatter Display */}
      {frontmatter.title && (
        <div className="mb-6 pb-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {frontmatter.title}
          </h1>
          {frontmatter.description && (
            <p className="text-gray-600 mb-3">{frontmatter.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{frontmatter.publishedAt}</span>
            {frontmatter.draft && (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                下書き
              </span>
            )}
          </div>
          {frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {frontmatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Markdown Content */}
      <div className="markdown-preview">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </div>
    </div>
  )
}
