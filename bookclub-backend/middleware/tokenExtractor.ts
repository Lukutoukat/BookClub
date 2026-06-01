import { type Request, type Response, type NextFunction } from 'express'


interface TokenRequest extends Request {
  token?: string | null
}

const tokenExtractor = (req: TokenRequest, _res: Response, next: NextFunction) => {
    const authorization = req.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        req.token = authorization.replace('Bearer ', '')
    } else {
        req.token = null
    }
    next()
}

export default tokenExtractor