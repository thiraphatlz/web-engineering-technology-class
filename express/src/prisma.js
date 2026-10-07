import { PrismaClient } from '@prisma/client';

// สร้าง Prisma Client instance สำหรับเชื่อมต่อ SQLite database
const prisma = new PrismaClient();

export default prisma;
