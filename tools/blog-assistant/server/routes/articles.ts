import { Hono } from 'hono'
import { articleService } from '../services/article-service.js'
import { generateSlug } from '../services/claude-agent.js'
import type { SaveArticleRequest, BlogDirectory } from '../types/index.js'

const app = new Hono()

// 記事一覧を取得（?directory=blog or ?directory=blog-demo）
app.get('/', async (c) => {
  const directory = c.req.query('directory') as BlogDirectory | undefined
  const articles = await articleService.listArticles(directory)
  return c.json(articles)
})

// 全記事からタグ一覧を取得
app.get('/tags', async (c) => {
  const tags = await articleService.getAllTags()
  return c.json(tags)
})

// タイトルから英語スラッグを生成
app.post('/generate-slug', async (c) => {
  const body = await c.req.json()
  const { title } = body as { title: string }

  if (!title) {
    return c.json({ error: 'Title is required' }, 400)
  }

  const slug = await generateSlug(title)
  return c.json({ slug })
})

// 記事を取得
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const article = await articleService.getArticle(id)

  if (!article) {
    return c.json({ error: 'Article not found' }, 404)
  }

  return c.json(article)
})

// 記事を保存（新規作成または更新）
app.post('/', async (c) => {
  const body = (await c.req.json()) as SaveArticleRequest

  if (!body.frontmatter?.title || !body.content) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const result = await articleService.saveArticle(
    body.frontmatter,
    body.content,
    body.directory || 'blog',
    body.slug,
    body.existingFilename
  )
  return c.json(result, body.existingFilename ? 200 : 201)
})

// 記事を削除
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const success = await articleService.deleteArticle(id)

  if (!success) {
    return c.json({ error: 'Article not found' }, 404)
  }

  return c.json({ success: true })
})

export default app
