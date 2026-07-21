import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  await prisma.user.upsert({
    where: { email: 'demo@agropilot.local' },
    update: {},
    create: { name: 'Productor demo', email: 'demo@agropilot.local', passwordHash, role: 'PRODUCER' },
  });
}

main().then(() => prisma.$disconnect()).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
