import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import bcrypt from 'bcrypt'

const userRouter = express.Router()

interface User {
  id?: number,
  email: string,
  name: string,
  password?: string,
  password_hash?: string
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

userRouter.post('/', async (req: Request<unknown, unknown, User>, res: Response) => {
  const newUser: User = req.body

  if (!newUser.email || !newUser.name || !newUser.password) {
    res.status(400).json({ error: 'email, name, and password are required' })
    return
  }

  if (!PASSWORD_REGEX.test(newUser.password)) {
    res.status(400).json({
      error:
        'Password must be at least 8 characters long and contain uppercase, lowercase, and a number'
    })
    return
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: { name: newUser.name }
    })
    if (existingUser) {
      res.status(400).json({ error: 'Username already exists' })
      return
    }

    const saltRounds = 10
    const password_hash = await bcrypt.hash(newUser.password, saltRounds)

    const user = await prisma.user.create({
      data: {
        email: newUser.email,
        name: newUser.name,
        password_hash: password_hash
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })

    res.json(user)
  } catch (error) {
    console.error('POST /api/users error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

userRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany()

    res.json(users)
  } catch (error) {
    console.error('GET /api/users error:', error)

    res.status(500).json({ error: 'database error' })
  }
})

export default userRouter