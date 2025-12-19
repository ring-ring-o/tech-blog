import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { reviewArticle } from '../services/claude-agent.js'
import type { ReviewRequest } from '../types/index.js'

const app = new Hono()

// AI校閲エンドポイント（SSEストリーミング）
app.post('/', async (c) => {
  const body = (await c.req.json()) as ReviewRequest

  if (!body.content || !body.frontmatter) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  return streamSSE(c, async (stream) => {
    try {
      for await (const message of reviewArticle(
        body.content,
        body.frontmatter,
        body.sessionId
      )) {
        // エラーメッセージの場合
        if ('type' in message && message.type === 'error') {
          await stream.writeSSE({
            event: 'error',
            data: JSON.stringify({
              type: 'error',
              message: message.message,
            }),
          })
          continue
        }

        // システム初期化メッセージ
        if (message.type === 'system' && message.subtype === 'init') {
          await stream.writeSSE({
            event: 'init',
            data: JSON.stringify({
              type: 'init',
              sessionId: message.session_id,
            }),
          })
          continue
        }

        // アシスタントメッセージ
        if (message.type === 'assistant' && message.message?.content) {
          for (const block of message.message.content) {
            if ('text' in block) {
              await stream.writeSSE({
                event: 'message',
                data: JSON.stringify({
                  type: 'text',
                  content: block.text,
                }),
              })
            }
          }
        }

        // 結果メッセージ
        if (message.type === 'result') {
          await stream.writeSSE({
            event: 'done',
            data: JSON.stringify({
              type: 'result',
              subtype: message.subtype,
            }),
          })
        }
      }
    } catch (error) {
      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({
          type: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      })
    }
  })
})

export default app
