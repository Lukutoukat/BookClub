import { type Request, type Response, type NextFunction } from 'express'
import { prisma } from '../db.ts'

import jwt, { type JwtPayload} from 'jsonwebtoken'

interface User {
  id?: number,
  email: string,
  name: string,
  password?: string,
  password_hash?: string
}

interface TokenRequest extends Request {
  token?: string | undefined,
  user?: User | null
}

interface TokenPayload extends JwtPayload {
  id: number
}
const userExtractor = async (req: TokenRequest, _res: Response, next: NextFunction) => {
  if (!req.token) {
    throw new Error('token missing')
  }
  if (!process.env.SECRET) {
    throw new Error('variable missing')
  }
  const decodedToken = jwt.verify(req.token, process.env.SECRET) as TokenPayload
  req.user = await prisma.user.findUnique({
      where: {
        id: decodedToken.id
      }
    })
  next()
}

export default userExtractor