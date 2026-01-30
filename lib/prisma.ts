import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

let prismaInstance: PrismaClient | null = null;
let initializationAttempted = false;

function getPrismaInstance() {
    if (initializationAttempted) return prismaInstance;
    initializationAttempted = true;

    if (!process.env.DATABASE_URL) {
        return null;
    }

    try {
        prismaInstance = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
        });
    } catch (error) {
        // Silently fail during build
        if (process.env.NODE_ENV === 'development' || process.env.BUILD_PRISMA_SKIP === 'true') {
            console.warn('[Prisma] Failed to initialize client during build:', error);
        }
        return null;
    }

    return prismaInstance;
}

// Get or initialize instance with fallback
globalForPrisma.prisma = globalForPrisma.prisma || getPrismaInstance() || undefined;

// For backwards compatibility, create a proxy that lazy-loads the client
export const prisma = new Proxy(
    {},
    {
        get: (target, prop) => {
            const instance = globalForPrisma.prisma;
            if (!instance) {
                // During build, return a silent no-op
                if (typeof window === 'undefined' && process.env.BUILD_PRISMA_SKIP !== 'false') {
                    return () => Promise.resolve(null);
                }
                throw new Error('Prisma client not initialized');
            }
            return (instance as any)[prop];
        },
    }
) as any as PrismaClient;

export default prisma;
