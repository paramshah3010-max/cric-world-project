import { PrismaClient } from '../generated/prisma/index.js';

// A single shared Prisma client instance for the whole server process.
export const prisma = new PrismaClient();

export async function connectDatabase() {
  await prisma.$connect();
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
