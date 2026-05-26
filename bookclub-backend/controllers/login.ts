import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import express from 'express'
import { prisma } from '../db.ts'
import dotenv from 'dotenv'
import { type Request, type Response } from 'express'
const loginRouter = express.Router()
dotenv.config()

interface User {
  id?: number,
  email: string,
  name: string,
  password?: string,
  password_hash?: string
}

interface LogIn {
  name?: string,
  password?: string
}

loginRouter.post('/', async (req: Request, res: Response) => {
  const { name, password } = req.body as LogIn
  if (!password) {
    return res.status(401).end()
  }

  const user: User | null = await prisma.user.findUnique({
    where: {
      name: name
    },
  })

  const passwordCorrect: boolean = user === null
    ? false
    : await bcrypt.compare(password, user.password_hash!)

  if (!(user && passwordCorrect)) {
    return res.status(401).json({
      error: 'either username or the password is invalid, please check again'
    })
  }

  const userForToken = {
    username: user.name,
    id: user.id
  }
  if (!process.env.SECRET) {
    throw new Error('came across a problem related to token :)')
  }
  const token = jwt.sign(userForToken, process.env.SECRET)

  res
    .status(200)
    .send({ token, email: user.email, name: user.name})
  return 
})

export default loginRouter