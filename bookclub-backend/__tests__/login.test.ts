/// <reference types="jest" />

import request from "supertest";
import bcrypt from "bcrypt";

jest.mock("../db.ts");

import { app } from "../index.ts";
import { prisma } from "../db.ts";

describe("login tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SECRET = "testsecret";
  });

  test("login succeeds with correct credentials", async () => {
    const passwordHash = await bcrypt.hash("salasana123", 10);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: "matti",
      email: "matti@test.com",
      password_hash: passwordHash,
    });

    const response = await request(app).post("/api/login").send({
      username: "matti",
      password: "salasana123",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.email).toBe("matti@test.com");
    expect(response.body.name).toBe("matti");
  });

  test("login fails with wrong password", async () => {
    const passwordHash = await bcrypt.hash("oikeaSalasana", 10);

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      name: "matti",
      email: "matti@test.com",
      password_hash: passwordHash,
    });

    const response = await request(app).post("/api/login").send({
      username: "matti",
      password: "vääräSalasana",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain("invalid");
  });

  test("login fails if user does not exist", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await request(app).post("/api/login").send({
      username: "tuntematon",
      password: "salasana",
    });

    expect(response.status).toBe(401);
  });

  test("login fails if password missing", async () => {
    const response = await request(app).post("/api/login").send({
      username: "matti",
    });

    expect(response.status).toBe(401);
  });
});
