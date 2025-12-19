interface AstroPreviewProps {
  slug: string
}

export function AstroPreview({ slug }: AstroPreviewProps) {
  if (!slug) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <p className="mb-2">記事を保存するとAstroでプレビューできます</p>
        <p className="text-sm">
          Astro dev serverが
          <code className="mx-1 px-1 bg-gray-100 rounded">localhost:4321</code>
          で起動している必要があります
        </p>
      </div>
    )
  }

  const previewUrl = `http://localhost:4321/posts/${slug}`

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b mb-3">
        <span className="text-sm text-gray-500">{previewUrl}</span>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline"
        >
          新しいタブで開く
        </a>
      </div>
      <iframe
        src={previewUrl}
        className="flex-1 w-full border rounded-lg"
        title="Astro Preview"
      />
    </div>
  )
}
