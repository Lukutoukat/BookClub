import { type Request, type Response, type NextFunction } from 'express'
import { prisma } from '../db.ts'

import jwt, { type JwtPayload } from 'jsonwebtoken'

// interface User {
//   id?: string,
//   email: string,
//   name: string,
//   password?: string,
//   password_hash?: string
// }

interface TokenPayload extends JwtPayload {
  id: string
}
const userExtractor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.token) {
      throw new Error('token missing')
    }
    if (!process.env.SECRET) {
      throw new Error('variable missing')
    }
    const decodedToken = jwt.verify(req.token, process.env.SECRET) as TokenPayload
    console.log('token verified')
    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id
      }
    })
    if (!user) {
      req.user = undefined
    } else {
      req.user = user
    }
    next()
  } catch (err) {
    if (err instanceof Error && err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'token expired' })
    }
    return res.status(401).json({ error: 'invalid token' })
  }
  return
}

export default userExtractor
