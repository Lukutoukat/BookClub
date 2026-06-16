import express, { type Request, type Response } from "express";
import { prisma } from "../db.ts";
import userExtractor from "../middleware/userExtractor.ts";
const bookClubRouter = express.Router();

interface BookClub {
  id: string;
  name: string;
  invite_code?: string;
  status?: number;
  owner_id?: string;
}

bookClubRouter.get("/", async (req: Request, res: Response) => {
  const clubs = req.query.clubIds;

  const clubIds = Array.isArray(clubs)
    ? clubs.filter((id): id is string => typeof id === "string")
    : typeof clubs === "string"
      ? [clubs]
      : [];

  try {
    const result = await prisma.bookClub.findMany({
      where: {
        id: { in: clubIds },
      },
    });
    res.json(result);
  } catch (error) {
    console.error("GET /api/bookclubs error:", error);
    res.status(500).json({ error: "database error" });
  }
});

bookClubRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string | undefined;
    const bookclub = await prisma.bookClub.findUnique({
      where: { id },
    });
    res.json(bookclub);
  } catch (error) {
    console.error("GET /api/bookclubs/:id error:", error);
    res.status(500).json({ error: "database error" });
  }
  return;
});

bookClubRouter.post(
  "/",
  userExtractor,
  async (req: Request<unknown, unknown, BookClub>, res: Response) => {
    const newBookClub: BookClub = req.body;
    newBookClub.invite_code = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();
    if (req.user) {
      try {
        const created = await prisma.bookClub.create({
          data: {
            name: newBookClub.name,
            status: newBookClub.status,
            owner_id: req.user.id,
            invite_code: newBookClub.invite_code,
          },
        });
        const addedMember = await prisma.bookClubMembers.create({
          data: {
            user_id: req.user.id,
            user_role: 0,
            bookclub_id: created.id,
          },
        });
        if (!addedMember) {
          res.status(500).json({ error: "database error adding member" });
        }
        res.json(created);
      } catch (error) {
        console.error("POST /api/bookclubs error:", error);
        res.status(500).json({ error: "database error" });
      }
      return;
    } else {
      res.status(401).json({ error: "user not found" });
    }
  },
);

bookClubRouter.delete("/:id", async (req, res) => {
  const id = req.params.id as string | undefined;

  if (id === undefined) {
    res.status(400).json({ error: "bookclub id is undefined" });
    return;
  }

  try {
    await prisma.bookClub.delete({
      where: { id },
    });
    res.status(204).end();
  } catch (error) {
    console.error("DELETE /api/bookclubs error: ", error);
    res.status(500).json({ error: "database error in deleting bookclub" });
  }
});

export default bookClubRouter;
