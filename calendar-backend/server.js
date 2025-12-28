import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import eventRoutes from './routes/events.js'
import './jobs/reminderJob.js'

dotenv.config()
connectDB()

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`)
)
