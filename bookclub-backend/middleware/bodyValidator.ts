import * as z from 'zod'
import type {NextFunction, Request, Response} from "express";

const validateBody = (schema: z.ZodType) => {
    return (req: Request<unknown, unknown, unknown, unknown>, res: Response, next: NextFunction) => {
        try {
            req.body = schema.parse(req.body)
            return next()
        } catch (error) {
            if (error instanceof z.ZodError) {
                const message = error.issues[0].message;
                return res.status(400).json({error: message})
            }
            return next(error)
        }
    }
}

export default validateBody