import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import articlesRoute from './routes/articles.js'
import reviewRoute from './routes/review.js'
import generateRoute from './routes/generate.js'
import previewRoute from './routes/preview.js'
import skillsRoute from './routes/skills.js'

export const app = new Hono()

// Middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: ['http://localhost:5173', 'http://localhost:4321'],
    credentials: true,
  })
)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// API Routes
app.route('/api/articles', articlesRoute)
app.route('/api/review', reviewRoute)
app.route('/api/generate', generateRoute)
app.route('/api/preview', previewRoute)
app.route('/api/skills', skillsRoute)

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err)
  return c.json({ error: err.message }, 500)
})
