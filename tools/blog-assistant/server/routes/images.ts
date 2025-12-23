import { Hono } from 'hono'
import { imageService } from '../services/image-service.js'
import type { BlogDirectory } from '../types/index.js'

const app = new Hono()

/**
 * POST /api/images/upload
 * 画像をアップロードして最適化
 * multipart/form-data または JSON (base64) で受け付け
 *
 * 記事に紐付ける場合:
 * - multipart: slug, directory をフォームデータに含める
 * - JSON: slug, directory をボディに含める
 *
 * 記事に紐付けない場合（従来の動作）:
 * - slug, directory を省略すると public/images/posts に保存
 */
app.post('/upload', async (c) => {
  const contentType = c.req.header('content-type') || ''

  try {
    if (contentType.includes('multipart/form-data')) {
      // ファイルアップロード
      const body = await c.req.parseBody()
      const file = body['file']
      const slug = body['slug'] as string | undefined
      const directory = (body['directory'] as BlogDirectory) || 'blog'

      if (!file || !(file instanceof File)) {
        return c.json({ error: 'No file uploaded' }, 400)
      }

      const buffer = Buffer.from(await file.arrayBuffer())

      // 記事コンテキストがある場合は記事フォルダに保存
      if (slug) {
        const result = await imageService.uploadImageToArticle(
          buffer,
          file.name,
          directory,
          slug
        )
        return c.json(result)
      }

      // 従来の動作: public/images/posts に保存
      const result = await imageService.uploadImage(buffer, file.name)
      return c.json({
        success: true,
        ...result,
        markdown: imageService.generateMarkdown(result),
      })
    } else if (contentType.includes('application/json')) {
      // Base64アップロード（クリップボード用）
      const body = await c.req.json<{
        data: string
        filename?: string
        slug?: string
        directory?: BlogDirectory
      }>()

      if (!body.data) {
        return c.json({ error: 'No image data provided' }, 400)
      }

      // 記事コンテキストがある場合は記事フォルダに保存
      if (body.slug) {
        const result = await imageService.uploadBase64ImageToArticle(
          body.data,
          body.filename || 'pasted-image.png',
          body.directory || 'blog',
          body.slug
        )
        return c.json(result)
      }

      // 従来の動作: public/images/posts に保存
      const result = await imageService.uploadBase64Image(
        body.data,
        body.filename || 'pasted-image.png'
      )
      return c.json({
        success: true,
        ...result,
        markdown: imageService.generateMarkdown(result),
      })
    } else {
      return c.json({ error: 'Unsupported content type' }, 400)
    }
  } catch (error) {
    console.error('Image upload error:', error)
    return c.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      500
    )
  }
})

export default app
