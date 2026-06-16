/// <reference types="jest" />

import request from "supertest";
import jwt from "jsonwebtoken";

jest.mock("../db.ts", () => ({
  prisma: {
    book: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import { app } from "../index.ts";
import { prisma } from "../db.ts";

const mockBook_1 = {
  id: "1",
  isbn: "1234567890",
  name: "Book 1",
  author: "Author 1",
  year: 2024,
  pages: 100,
  comment: "Comment 1",
  language: "English",
  genre: "Fiction",
  user_id: "1",
};
const mockBook_2 = {
  id: "2",
  isbn: "111111111",
  name: "Book 2",
  author: "Author 2",
  year: 2024,
  pages: 100,
  comment: "Comment 2",
  language: "English",
  genre: "Fiction",
  user_id: "1",
};

const authHeaders = () => {
  if (!process.env.SECRET) {
    process.env.SECRET = "testsecret";
  }

  return {
    Authorization: `Bearer ${jwt.sign({ id: "1" }, process.env.SECRET)}`,
  };
};

describe("/api/books", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    process.env.SECRET = "testsecret";
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "1",
      email: "matti@test.com",
      name: "matti",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("GET", () => {
    it("returns books", async () => {
      const mockBooks = [mockBook_1, mockBook_2];

      (prisma.book.findMany as jest.Mock).mockResolvedValue(mockBooks);

      const response = await request(app).get("/api/books").set(authHeaders());

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBooks);
      expect(prisma.book.findMany).toHaveBeenCalledTimes(1);
    });

    it("returns 500 if get fails", async () => {
      (prisma.book.findMany as jest.Mock).mockRejectedValue(
        new Error("Database failed"),
      );

      const response = await request(app).get("/api/books").set(authHeaders());

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "database error" });
    });
  });

  describe("POST", () => {
    it("creates a book", async () => {
      const newBook = mockBook_1;

      (prisma.book.create as jest.Mock).mockResolvedValue(newBook);

      const response = await request(app)
        .post("/api/books")
        .set(authHeaders())
        .send(newBook);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(newBook);
      expect(prisma.book.create).toHaveBeenCalledTimes(1);
      expect(prisma.book.create).toHaveBeenCalledWith({
        data: {
          isbn: "1234567890",
          name: "Book 1",
          author: "Author 1",
          year: 2024,
          pages: 100,
          comment: "Comment 1",
          language: "English",
          genre: "Fiction",
          user_id: "1",
        },
      });
    });

    it("returns 500 if post fails", async () => {
      const newBook = {
        isbn: "1234567890",
      };
      (prisma.book.create as jest.Mock).mockRejectedValue(
        new Error("Database failed"),
      );

      const response = await request(app)
        .post("/api/books")
        .set(authHeaders())
        .send(newBook);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "database error" });
    });
  });

  describe("PUT", () => {
    it("removes a book from user", async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook_1);
      (prisma.book.update as jest.Mock).mockResolvedValue({
        ...mockBook_1,
        user_id: null,
      });

      const response = await request(app)
        .put("/api/books/1/remove")
        .set(authHeaders());

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ...mockBook_1, user_id: null });
      expect(prisma.book.update).toHaveBeenCalledTimes(1);
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: { user_id: null },
      });
    });

    it("returns 500 if remove fails", async () => {
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook_1);
      (prisma.book.update as jest.Mock).mockRejectedValue(
        new Error("Database failed"),
      );

      const response = await request(app)
        .put("/api/books/1/remove")
        .set(authHeaders());

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "database error" });
    });
  });

  describe("PUT", () => {
    it("edits a book", async () => {
      const editedBook = {
        id: "1",
        isbn: "1234567890",
        name: "Book 1",
        author: "Author 1",
        year: 2024,
        pages: 100,
        comment: "edited version",
        language: "English",
        genre: "Fiction",
        user_id: "1",
      };
      (prisma.book.findUnique as jest.Mock).mockResolvedValue(mockBook_1);
      (prisma.book.update as jest.Mock).mockResolvedValue(editedBook);

      const response = await request(app)
        .put("/api/books/1")
        .set(authHeaders())
        .send(editedBook);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(editedBook);
      expect(prisma.book.update).toHaveBeenCalledTimes(1);
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: "1" },
        data: {
          id: "1",
          isbn: "1234567890",
          name: "Book 1",
          author: "Author 1",
          year: 2024,
          pages: 100,
          comment: "edited version",
          language: "English",
          genre: "Fiction",
        },
      });
    });
  });
});
