import { type Request, type Response, type NextFunction } from 'express'
import { prisma } from '../db.ts'

const jwt = require('jsonwebtoken')

interface TokenRequest extends Request {
  token?: string | null
}

const userExtractor = async (req: TokenRequest, _res: Response, next: NextFunction) => {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    req.user = await prisma.user.findUnique({
        where: {
          id: decodedToken.id
        }
      })
    next()
}

export default userExtractor