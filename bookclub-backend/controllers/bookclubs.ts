import express, { type Request, type Response } from 'express'
import { prisma } from '../db.ts'
import userExtractor from '../middleware/userExtractor.ts'

const bookClubRouter = express.Router()

interface BookClub {
  id: string
  name: string
  invite_code?: string | null
  status?: number | null
  owner_id?: string | null
  maxBooksPerUser?: number | null
}

interface StrippedBookClub {
  id: string
  name: string
}

interface BookClubUpdate {
  maxBooksPerUser?: number | null
}

/**
 * Function to strip sensitive information from a book club object
 */
function stripBookClub(club: BookClub): StrippedBookClub {
  return {
    id: club.id,
    name: club.name
  }
}

/**
 * GET '/'
 *
 * Method to request all clubs the current user is a part of.
 */
bookClubRouter.get('/', userExtractor, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Missing user' })
    return
  }

  const userId = req.user.id

  try {
    const resultClubs = await prisma.bookClub.findMany({
      where: {
        OR: [{ owner_id: userId }, { BookClubMembers: { some: { user_id: userId } } }]
      }
    })

    const filteredResults = resultClubs.map((club) => {
      const isOwner = club.owner_id === userId

      if (isOwner) {
        return club
      }

      return stripBookClub(club)
    })

    res.status(200).json(filteredResults)
  } catch (error) {
    console.error('GET /api/bookclubs error:', error)
    res.status(500).json({ error: 'database error' })
  }
})

/**
 * GET '/:id'
 *
 * Method to get a club by an ID.
 */
bookClubRouter.get('/:id', userExtractor, async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Missing user' })
    return
  }

  const userId = req.user.id

  try {
    const id = req.params.id as string | undefined

    const bookclub = await prisma.bookClub.findUnique({
      where: {
        id: id,
        OR: [{ owner_id: userId }, { BookClubMembers: { some: { user_id: userId } } }]
      }
    })

    if (!bookclub) {
      res.status(404).json({ error: 'Club not found or no permission to access that club' })
      return
    }

    if (bookclub.owner_id === userId) {
      res.status(200).json(bookclub)
      return
    }

    res.status(200).json(stripBookClub(bookclub))
  } catch (error) {
    console.error('GET /api/bookclubs/:id error:', error)
    res.status(500).json({ error: 'database error' })
  }

  return
})

/**
 * POST '/'
 *
 * Method to create a new book club.
 * Request body contains new clubs information.
 */
bookClubRouter.post('/', userExtractor, async (req: Request<unknown, unknown, BookClub>, res: Response) => {
  const newBookClub: BookClub = req.body
  newBookClub.invite_code = Math.random().toString(36).substring(2, 7).toUpperCase()

  if (req.user) {
    try {
      const created = await prisma.bookClub.create({
        data: {
          name: newBookClub.name,
          status: newBookClub.status,
          owner_id: req.user.id,
          invite_code: newBookClub.invite_code,
          maxBooksPerUser: newBookClub.maxBooksPerUser ?? 0
        }
      })

      const addedMember = await prisma.bookClubMembers.create({
        data: {
          user_id: req.user.id,
          user_role: 0,
          bookclub_id: created.id
        }
      })

      if (!addedMember) {
        res.status(500).json({ error: 'database error adding member' })
        return
      }

      res.json(created)
    } catch (error) {
      console.error('POST /api/bookclubs error:', error)
      res.status(500).json({ error: 'database error' })
    }
    return
  } else {
    res.status(401).json({ error: 'user not found' })
  }
})

/**
 * PUT '/:id'
 *
 * Method to update club settings.
 */
bookClubRouter.put('/:id', userExtractor, async (req: Request<unknown, unknown, BookClubUpdate>, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Missing user' })
    return
  }

  const clubId = req.params.id
  const { maxBooksPerUser } = req.body

  try {
    const club = await prisma.bookClub.findUnique({
      where: { id: clubId }
    })

    if (!club) {
      res.status(404).json({ error: 'Unknown club' })
      return
    }

    if (club.owner_id !== req.user.id) {
      res.status(403).json({ error: 'Must be owner of the club to update settings' })
      return
    }

    const sanitizedMaxBooksPerUser =
      typeof maxBooksPerUser === 'number' ? Math.max(0, Math.floor(maxBooksPerUser)) : 0

    const updatedClub = await prisma.bookClub.update({
      where: { id: clubId },
      data: {
        maxBooksPerUser: sanitizedMaxBooksPerUser
      }
    })

    res.status(200).json(updatedClub)
  } catch (error) {
    console.error('PUT /api/bookclubs/:id error:', error)
    res.status(500).json({ error: 'database error in updating bookclub' })
  }
})

/**
 * DELETE '/:id'
 *
 * Method to delete a book club by its ID.
 */
bookClubRouter.delete('/:id', userExtractor, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Missing user' })
  }

  const userId = req.user.id
  const id = req.params.id as string

  try {
    const club = await prisma.bookClub.findUnique({ where: { id } })

    if (!club) {
      return res.status(404).json({ error: 'Unknown club' })
    }

    if (club.owner_id !== userId) {
      return res.status(403).json({ error: 'Must be owner of the club to delete' })
    }

    await prisma.bookClub.delete({
      where: { id }
    })

    return res.status(204).end()
  } catch (error) {
    console.error('DELETE /api/bookclubs error: ', error)
    return res.status(500).json({ error: 'database error in deleting bookclub' })
  }
})

export default bookClubRouter
