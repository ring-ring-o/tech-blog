import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { assistService } from '../services/assist-service.js'
import type { SaveAssistRequest, ExecuteAssistRequest, AssistCategory } from '../types/index.js'
import { AI_MODELS, AI_AGENT_CONFIG } from '../../shared/constants/content.js'

const app = new Hono()

// アシスト一覧を取得
app.get('/', async (c) => {
  const category = c.req.query('category') as AssistCategory | undefined
  const assists = category
    ? await assistService.getAssistsByCategory(category)
    : await assistService.listAssists()
  return c.json(assists)
})

// アシストを取得
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const assist = await assistService.getAssist(id)

  if (!assist) {
    return c.json({ error: 'Assist not found' }, 404)
  }

  return c.json(assist)
})

// カスタムアシストを作成
app.post('/', async (c) => {
  const body = (await c.req.json()) as SaveAssistRequest

  if (!body.name || !body.systemPrompt || !body.userPromptTemplate) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const assist = await assistService.createAssist(body)
  return c.json(assist, 201)
})

// アシストを更新
app.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = (await c.req.json()) as SaveAssistRequest

  const assist = await assistService.updateAssist(id, body)

  if (!assist) {
    return c.json({ error: 'Assist not found' }, 404)
  }

  return c.json(assist)
})

// カスタムアシストを削除
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const success = await assistService.deleteAssist(id)

  if (!success) {
    return c.json({ error: 'Assist not found or is built-in' }, 404)
  }

  return c.json({ success: true })
})

// アシストを実行（SSE）
app.post('/:id/execute', async (c) => {
  const id = c.req.param('id')
  const body = (await c.req.json()) as ExecuteAssistRequest

  const assist = await assistService.getAssist(id)

  if (!assist) {
    return c.json({ error: 'Assist not found' }, 404)
  }

  // プロンプトを生成
  const userPrompt = assistService.buildPrompt(assist.userPromptTemplate, body.variables)

  return streamSSE(c, async (stream) => {
    try {
      for await (const message of query({
        prompt: userPrompt,
        options: {
          model: AI_MODELS.DEFAULT,
          systemPrompt: assist.systemPrompt,
          maxTurns: AI_AGENT_CONFIG.REVIEW_MAX_TURNS,
          allowedTools: [],
        },
      })) {
        if (message.type === 'assistant' && message.message?.content) {
          for (const block of message.message.content) {
            if ('text' in block) {
              await stream.writeSSE({
                data: JSON.stringify({ type: 'text', content: block.text }),
              })
            }
          }
        }
      }

      await stream.writeSSE({
        data: JSON.stringify({ type: 'result' }),
      })
    } catch (error) {
      await stream.writeSSE({
        data: JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      })
    }
  })
})

export default app
