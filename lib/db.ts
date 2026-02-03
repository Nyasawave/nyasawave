// Re-export Prisma client from lib/prisma.ts
// This is the single source of truth for database access
export { prisma } from './prisma';

// Fallback mock for development/testing
const mockPrisma = {
  user: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
  },
  artist: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
  },
  track: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
  },
  transaction: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
    aggregate: async () => ({ _sum: { amount: 0 } }),
  },
  dispute: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
  },
  tournament: {
    findMany: async () => [],
    findUnique: async () => null,
    count: async () => 0,
  },
} as any;

export { mockPrisma };
