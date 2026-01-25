import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pollingUnitRouter from './routes/pollingUnit'
import wardsRouter from './routes/wards'
import pollingUnitsRouter from './routes/pollingUnits'
import directionsRouter from './routes/directions'
import aiRouter from './routes/ai'
import landmarksRouter from './routes/landmarks'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0' // Important for Railway/Render

// CORS configuration - allow frontend domain in production
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) // Remove undefined values

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? allowedOrigins.length > 0 ? allowedOrigins : true // Allow specific origins in prod, or all if not set
    : true, // Allow all in development
  credentials: true,
}))
app.use(express.json())

// Simple rate limiting (in-memory, for production use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 60 // 60 requests per minute

app.use((req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return next()
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
    })
  }

  record.count++
  next()
})

// Health check
app.get('/health', async (req, res) => {
  try {
    const { supabase } = await import('./lib/supabase')
    const { error } = await supabase.from('wards').select('id').limit(1)
    if (error) throw error
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

// Routes
app.use('/api/polling-unit', pollingUnitRouter)
app.use('/api/wards', wardsRouter)
app.use('/api/polling-units', pollingUnitsRouter)
app.use('/api/directions', directionsRouter)
app.use('/api/ai', aiRouter)
app.use('/api/landmarks', landmarksRouter)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  })
})

// Start server
app.listen(Number(PORT), HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})





