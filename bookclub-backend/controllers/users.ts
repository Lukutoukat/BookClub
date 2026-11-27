import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'
import {
  isExistingUser, registerUser,
  type UserCreationRequest,
  userCreationRequestSchema,
} from "../services/userService.ts";
import validateBody from "../middleware/bodyValidator.ts";

const userRouter = express.Router()

userRouter.post('/',
    validateBody(userCreationRequestSchema),
    async (req: Request<unknown, unknown, UserCreationRequest>, res: Response) => {
      const {email, name, password} = req.body

      const isExisting = await isExistingUser(email, name)
      if (isExisting) {
          return res.status(400).json({ error: 'existing_user' })
      }

      const user = await registerUser(email, name, password)
      return res.json(user)
})

userRouter.delete('/', userExtractor, async (req: Request, res: Response) => {
  try {

    // Ensure request contains an existing extracted user
    const user = req.user;
    if (!user) {
      res.status(403).json({})
      return;
    }

    // Attempt to delete current user
    const userDeletion = await prisma.user.delete({where: {id: user.id}})
    if (!userDeletion) {
      res.status(500).json({ error: 'User could not be deleted'})
      return;
    }

    res.status(200).json({})
  } catch (error) {
    console.error('DELETE /api/users error:', error)

    res.status(500).json({ error: 'A database error occurred' })
  }
})

export default userRouter
