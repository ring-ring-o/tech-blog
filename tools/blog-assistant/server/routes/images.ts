import { Hono } from 'hono'
import { imageService } from '../services/image-service.js'

const app = new Hono()

/**
 * POST /api/images/upload
 * 画像をアップロードして最適化
 * multipart/form-data または JSON (base64) で受け付け
 */
app.post('/upload', async (c) => {
  const contentType = c.req.header('content-type') || ''

  try {
    if (contentType.includes('multipart/form-data')) {
      // ファイルアップロード
      const body = await c.req.parseBody()
      const file = body['file']

      if (!file || !(file instanceof File)) {
        return c.json({ error: 'No file uploaded' }, 400)
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await imageService.uploadImage(buffer, file.name)

      return c.json({
        success: true,
        ...result,
        markdown: imageService.generateMarkdown(result),
      })
    } else if (contentType.includes('application/json')) {
      // Base64アップロード（クリップボード用）
      const body = await c.req.json<{ data: string; filename?: string }>()

      if (!body.data) {
        return c.json({ error: 'No image data provided' }, 400)
      }

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
