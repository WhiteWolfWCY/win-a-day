// src/__mocks__/db/drizzle.ts

export const db = {
  select: jest.fn().mockReturnThis(),
  from: jest.fn().mockReturnThis(),
  innerJoin: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  groupBy: jest.fn().mockReturnThis(),
  execute: jest.fn().mockResolvedValue([])
};

jest.mock('../db/schemat', () => ({
  db
}));
  