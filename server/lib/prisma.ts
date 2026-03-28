import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as typeof globalThis & {
    __stonesPrisma?: PrismaClient;
};

export const prisma = globalForPrisma.__stonesPrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.__stonesPrisma = prisma;
}
