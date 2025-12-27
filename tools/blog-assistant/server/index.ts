import { serve } from '@hono/node-server'
import { app } from './app.js'
import { SERVER_CONFIG } from '../shared/constants/server.js'

const port = SERVER_CONFIG.PORT

console.log(`Blog Assistant Server starting on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
