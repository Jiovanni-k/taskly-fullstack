import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

console.error('DATABASE_URL:', process.env.DATABASE_URL);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set.');
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
