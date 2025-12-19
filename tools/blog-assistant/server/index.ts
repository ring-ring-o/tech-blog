import { serve } from '@hono/node-server'
import { app } from './app.js'

const port = 3001

console.log(`Blog Assistant Server starting on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
