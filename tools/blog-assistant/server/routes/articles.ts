import { Hono } from 'hono'
import { articleService } from '../services/article-service.js'
import type { SaveArticleRequest } from '../types/index.js'

const app = new Hono()

// 記事一覧を取得
app.get('/', async (c) => {
  const articles = await articleService.listArticles()
  return c.json(articles)
})

// 全記事からタグ一覧を取得
app.get('/tags', async (c) => {
  const tags = await articleService.getAllTags()
  return c.json(tags)
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

// 記事を保存
app.post('/', async (c) => {
  const body = (await c.req.json()) as SaveArticleRequest

  if (!body.frontmatter?.title || !body.content) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const result = await articleService.saveArticle(body.frontmatter, body.content)
  return c.json(result, 201)
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
