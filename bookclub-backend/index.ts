import express from 'express'
const app = express()
const tokenExtractor = require('./middleware/tokenExtractor')
import path from 'path'
import loginRouter from './controllers/login.ts'
import userRouter from './controllers/users.ts'
import bookRouter from './controllers/books.ts'


app.use(express.json())
app.use(express.static('dist'))
app.use(tokenExtractor)
app.use('/api/books', bookRouter)
app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)


app.get('/ping', (_req, res) => {
  res.send('pong')
})

app.get('/{*splat}', (_req, res) => {
  res.sendFile(
    path.resolve('dist', 'index.html')
  )
})

  console.log('smth happened in backend')
  console.log('Books')


const PORT = 3003

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
  })
}

export { app }