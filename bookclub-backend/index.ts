import express from 'express'
const app = express()
import path from 'path'

import loginRouter from './controllers/login.ts'
import userRouter from './controllers/users.ts'
import bookRouter from './controllers/books.ts'
import bookClubRouter from './controllers/bookclubs.ts'
import bookClubMembersRouter from './controllers/bookclubmembers.ts'
import cycleRouter from './controllers/cycle.ts'
import proposeRouter from './controllers/propose.ts'
import voteRouter from './controllers/vote.ts'

import tokenExtractor from './middleware/tokenExtractor.ts'

app.use(express.json())
app.use(express.static('dist'))
app.use(tokenExtractor)
app.use('/api/users', userRouter)
app.use('/api/books', bookRouter)
app.use('/api/bookclubs', bookClubRouter)
app.use('/api/bookclubmembers', bookClubMembersRouter)
app.use('/api/cycles', cycleRouter)
app.use('/api/propose', proposeRouter)
app.use('/api/vote', voteRouter)
app.use('/api/login', loginRouter)

app.get('/ping', (_req, res) => {
  res.send('pong')
})

app.get('/{*splat}', (_req, res) => {
  res.sendFile(
    path.resolve('dist', 'index.html')
  )
})



const PORT = 3003

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, "0.0.0.0", () => {
  })
}

export { app }