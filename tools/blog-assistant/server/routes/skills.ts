import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import { query } from '@anthropic-ai/claude-agent-sdk'
import { skillService } from '../services/skill-service.js'
import type { SaveSkillRequest, ExecuteSkillRequest, SkillCategory } from '../types/index.js'

const app = new Hono()

// スキル一覧を取得
app.get('/', async (c) => {
  const category = c.req.query('category') as SkillCategory | undefined
  const skills = category
    ? await skillService.getSkillsByCategory(category)
    : await skillService.listSkills()
  return c.json(skills)
})

// スキルを取得
app.get('/:id', async (c) => {
  const id = c.req.param('id')
  const skill = await skillService.getSkill(id)

  if (!skill) {
    return c.json({ error: 'Skill not found' }, 404)
  }

  return c.json(skill)
})

// カスタムスキルを作成
app.post('/', async (c) => {
  const body = (await c.req.json()) as SaveSkillRequest

  if (!body.name || !body.systemPrompt || !body.userPromptTemplate) {
    return c.json({ error: 'Missing required fields' }, 400)
  }

  const skill = await skillService.createSkill(body)
  return c.json(skill, 201)
})

// スキルを更新
app.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = (await c.req.json()) as SaveSkillRequest

  const skill = await skillService.updateSkill(id, body)

  if (!skill) {
    return c.json({ error: 'Skill not found' }, 404)
  }

  return c.json(skill)
})

// カスタムスキルを削除
app.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const success = await skillService.deleteSkill(id)

  if (!success) {
    return c.json({ error: 'Skill not found or is built-in' }, 404)
  }

  return c.json({ success: true })
})

// スキルを実行（SSE）
app.post('/:id/execute', async (c) => {
  const id = c.req.param('id')
  const body = (await c.req.json()) as ExecuteSkillRequest

  const skill = await skillService.getSkill(id)

  if (!skill) {
    return c.json({ error: 'Skill not found' }, 404)
  }

  // プロンプトを生成
  const userPrompt = skillService.buildPrompt(skill.userPromptTemplate, body.variables)

  return streamSSE(c, async (stream) => {
    try {
      for await (const message of query({
        prompt: userPrompt,
        options: {
          model: 'claude-sonnet-4-20250514',
          systemPrompt: skill.systemPrompt,
          maxTurns: 5,
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
