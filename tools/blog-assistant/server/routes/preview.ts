import { Hono } from 'hono'

const app = new Hono()

// プレビューURLを取得
app.get('/:slug', (c) => {
  const slug = c.req.param('slug')
  const previewUrl = `http://localhost:4321/posts/${slug}`

  return c.json({ previewUrl })
})

export default app
