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
  suggestionLimitEnabled?: boolean
  suggestionLimit?: number | null
}

interface StrippedBookClub {
  id: string,
  name: string,
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
        OR: [
          { owner_id: userId },
          { BookClubMembers: { some: { user_id: userId } } }
        ]
      }
    })

    const filteredResults = resultClubs.map((club) => {
      if (club.owner_id === userId) return club
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
        id,
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
})

/**
 * POST '/'
 * Method to create a new book club.
 */
bookClubRouter.post('/', userExtractor, async (req: Request<unknown, unknown, BookClub>, res: Response) => {
  const newBookClub: BookClub = req.body
  newBookClub.invite_code = Math.random().toString(36).substring(2, 7).toUpperCase()
  if (!req.user) {
    return res.status(401).json({ error: 'user not found' })
  }

  try {
    const created = await prisma.bookClub.create({
      data: {
        name: newBookClub.name,
        status: newBookClub.status,
        owner_id: req.user.id,
        invite_code: newBookClub.invite_code
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
      return res.status(500).json({ error: 'database error adding member' })
    }
    return res.json(created)
  } catch (error) {
    console.error('POST /api/bookclubs error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

/**
 * PATCH '/:id/settings'
 * Update suggestion-limit settings for the club owner.
 */
bookClubRouter.patch('/:id/settings', userExtractor, async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Missing user' })
  }

  const { suggestionLimitEnabled, suggestionLimit } = req.body as {
    suggestionLimitEnabled?: unknown
    suggestionLimit?: unknown
  }

  if (typeof suggestionLimitEnabled !== 'boolean') {
    return res.status(400).json({ error: 'suggestionLimitEnabled must be a boolean' })
  }
  if (suggestionLimitEnabled && (!Number.isInteger(suggestionLimit) || (suggestionLimit as number) < 1)) {
    return res.status(400).json({ error: 'suggestionLimit must be a positive integer when the limit is enabled' })
  }

  const id = req.params.id as string
  try {
    const club = await prisma.bookClub.findUnique({ where: { id } })
    if (!club) {
      return res.status(404).json({ error: 'Unknown club' })
    }
    if (club.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Must be owner of the club to update settings' })
    }

    const updatedClub = await prisma.bookClub.update({
      where: { id },
      data: {
        suggestionLimitEnabled,
        suggestionLimit: suggestionLimitEnabled ? suggestionLimit as number : null
      }
    })
    return res.json(updatedClub)
  } catch (error) {
    console.error('PATCH /api/bookclubs/:id/settings error:', error)
    return res.status(500).json({ error: 'database error' })
  }
})

/**
 * DELETE '/:id'
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

    await prisma.bookClub.delete({ where: { id } })
    return res.status(204).end()
  } catch (error) {
    console.error('DELETE /api/bookclubs error: ', error)
    return res.status(500).json({ error: 'database error in deleting bookclub' })
  }
})

export default bookClubRouter
