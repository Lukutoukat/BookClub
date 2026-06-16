import { jest } from '@jest/globals'

// Mock Prisma client
export const prisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn()
  },
  book: {
    findMany: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
  }
}
