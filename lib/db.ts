// Mock Prisma client for development without database
// In production, this should use actual Prisma configuration

export const prisma = {
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

export { prisma };
